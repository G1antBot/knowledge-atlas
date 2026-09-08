import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { POST } from "../app/api/ask/route";

const originalKey = process.env.MOONSHOT_API_KEY;
const originalModel = process.env.KIMI_MODEL;
const originalFetch = globalThis.fetch;
afterEach(() => {
  if (originalKey === undefined) delete process.env.MOONSHOT_API_KEY; else process.env.MOONSHOT_API_KEY = originalKey;
  if (originalModel === undefined) delete process.env.KIMI_MODEL; else process.env.KIMI_MODEL = originalModel;
  globalThis.fetch = originalFetch;
});
let counter = 0;
function request(question = "混合路由如何決定走規則或模型？") {
  return new Request("https://example.test/api/ask", { method: "POST", headers: { "Content-Type": "application/json", "x-forwarded-for": `test-${counter++}` }, body: JSON.stringify({ question, locale: "zh" }) });
}
function sse(content: string, finishReason = "stop") {
  return new Response(`data: ${JSON.stringify({ choices: [{ delta: { content }, finish_reason: finishReason }] })}\n\ndata: [DONE]\n\n`, { headers: { "Content-Type": "text/event-stream" } });
}
test("missing key returns a real service error without archive excerpts", async () => {
  delete process.env.MOONSHOT_API_KEY;
  globalThis.fetch = async () => { throw new Error("must not request upstream"); };
  const result = await POST(request());
  assert.equal(result.status, 503);
  assert.equal((await result.json()).error.code, "service-unavailable");
});
test("invalid input and overlong question are rejected before upstream", async () => {
  assert.equal((await POST(request(" "))).status, 400);
  assert.equal((await POST(request("問".repeat(501)))).status, 400);
});
test("upstream error never silently returns local content", async () => {
  process.env.MOONSHOT_API_KEY = "test-key";
  globalThis.fetch = async () => new Response(null, { status: 503 });
  const result = await POST(request());
  assert.equal(result.status, 503);
  assert.equal((await result.json()).error.code, "service-unavailable");
});
test("upstream rate limiting remains actionable", async () => {
  process.env.MOONSHOT_API_KEY = "test-key";
  globalThis.fetch = async () => new Response(null, { status: 429 });
  assert.equal((await POST(request())).status, 429);
});
test("K2.6 with thinking disabled returns cited NDJSON", async () => {
  process.env.MOONSHOT_API_KEY = "test-key";
  delete process.env.KIMI_MODEL;
  globalThis.fetch = async (_url, options) => {
    const body = JSON.parse(String(options?.body));
    assert.equal(body.model, "kimi-k2.6");
    assert.deepEqual(body.thinking, { type: "disabled" });
    return sse("混合路由的說明 [資料 1]。");
  };
  const result = await POST(request());
  const events = (await result.text()).trim().split("\n").map((line) => JSON.parse(line));
  assert.equal(events[0].type, "sources");
  assert.ok(events[0].sources.some((source: { href: string }) => source.href.includes("#hybrid-routing")));
  assert.equal(events[1].type, "delta");
  assert.equal(events.at(-1).type, "done");
});
test("unmatched question reports the retrieval gap without invoking model memory", async () => {
  process.env.MOONSHOT_API_KEY = "test-key";
  globalThis.fetch = async () => { throw new Error("must not request upstream"); };
  const result = await POST(request("What is the weather in Paris today?"));
  const events = (await result.text()).trim().split("\n").map((line) => JSON.parse(line));
  assert.deepEqual(events[0].sources, []);
  assert.match(events[1].text, /未收錄/);
});
test("truncated upstream output is not marked complete", async () => {
  process.env.MOONSHOT_API_KEY = "test-key";
  globalThis.fetch = async () => sse("未完成的回答", "length");
  const events = (await (await POST(request())).text()).trim().split("\n").map((line) => JSON.parse(line));
  assert.equal(events.at(-1).type, "error");
  assert.ok(!events.some((event) => event.type === "done"));
});
test("premature upstream EOF returns an error rather than done", async () => {
  process.env.MOONSHOT_API_KEY = "test-key";
  globalThis.fetch = async () => new Response(`data: ${JSON.stringify({ choices: [{ delta: { content: "部分內容" } }] })}\n\n`);
  const events = (await (await POST(request())).text()).trim().split("\n").map((line) => JSON.parse(line));
  assert.equal(events.at(-1).type, "error");
});
test("upstream timeout aborts the request and returns a timeout error", async (context) => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  process.env.MOONSHOT_API_KEY = "test-key";
  let requestStarted!: () => void;
  const started = new Promise<void>((resolve) => { requestStarted = resolve; });
  globalThis.fetch = async (_url, options) => {
    requestStarted();
    return new Promise<Response>((_resolve, reject) => {
      options?.signal?.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
    });
  };
  const pending = POST(request());
  await started;
  context.mock.timers.tick(30_001);
  const result = await pending;
  assert.equal(result.status, 408);
  assert.equal((await result.json()).error.code, "timeout");
});
