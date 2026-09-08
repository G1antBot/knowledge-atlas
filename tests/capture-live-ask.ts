// Opt-in smoke test: uses the running site's server-side model configuration.
// Prints only public questions and responses; never reads or prints credentials.
import { askEvaluationCases } from "./ask-evaluation-cases";

async function main() {
const base = process.argv[2] ?? "http://localhost:3000";
const ids = process.argv.slice(3);
const selected = ids.length ? ids : ["role-hant", "role-en", "environment-zh", "statement-zh", "compound-hant", "compare-zh", "gap-zh", "gap-hant"];
for (const id of selected) {
  const entry = askEvaluationCases.find((item) => item.id === id);
  if (!entry) throw new Error(`Unknown case: ${id}`);
  const started = Date.now();
  const response = await fetch(new URL("/api/ask", base), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: entry.question, locale: entry.locale }),
    signal: AbortSignal.timeout(40000),
  });
  const events = (await response.text()).trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
  const result = {
    id, question: entry.question, locale: entry.locale,
    status: response.status, elapsedMs: Date.now() - started,
    done: events.some((event) => event.type === "done"),
    errors: events.filter((event) => event.type === "error" || event.error),
    sources: events.flatMap((event) => event.type === "sources" ? event.sources : []),
    answer: events.filter((event) => event.type === "delta").map((event) => event.text).join(""),
  };
  console.log(JSON.stringify(result));
  if (!response.ok || !result.done || result.errors.length > 0) {
    process.exitCode = 1;
    break;
  }
}
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Live smoke test failed");
  process.exitCode = 1;
});
