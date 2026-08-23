import { mockFailure } from "@/lib/mock-chat";
import { retrieveArchive } from "@/lib/archive-retrieval";
import {
  ASK_ERROR_STATUS,
  type AskErrorCode,
  type AskErrorResponse,
  type AskLocale,
  type AskRequest,
  type AskStreamEvent,
} from "@/lib/ask-protocol";
import { type Bilingual, type ChatSource } from "@/data/content";
import { t } from "@/lib/i18n";

export const runtime = "edge";

const MAX_QUESTION_LENGTH = 500;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 12;
const STREAM_TIMEOUT_MS = 30_000;
const MOCK_CHAR_DELAY_MS = 22;
const RATE_LIMIT_MAX_KEYS = 1_000;
const KIMI_ENDPOINTS = [
  "https://api.moonshot.cn/v1/chat/completions",
  "https://api.moonshot.ai/v1/chat/completions",
] as const;
const KIMI_DEFAULT_MODEL = "moonshot-v1-8k";
const KIMI_MAX_COMPLETION_TOKENS = 500;

const errorMessages: Record<AskErrorCode, Bilingual> = {
  "invalid-request": {
    zh: "請求格式無效，請提供問題文字。",
    en: "Invalid request. Please provide a question.",
  },
  "question-too-long": {
    zh: "問題不能超過 500 個字元。",
    en: "The question cannot exceed 500 characters.",
  },
  "rate-limit": {
    zh: "提問次數過多，請稍後再試。",
    en: "Too many questions. Please try again later.",
  },
  timeout: {
    zh: "檔案回答逾時，請稍後再試。",
    en: "The archive response timed out. Please try again later.",
  },
  "service-unavailable": {
    zh: "檔案回答服務暫時無法使用，請稍後再試。",
    en: "The archive answer service is temporarily unavailable.",
  },
};

const noArchiveMatch: Bilingual = {
  zh: "檔案中未收錄與這個問題相關的公開內容，因此目前無法根據站內資料回答。你可以改問專案架構、設計取捨、實作範圍或檔案來源。",
  en: "The archive does not contain public material relevant to this question, so it cannot be answered from the site records. Try asking about project architecture, design tradeoffs, implementation scope, or sources.",
};

// Edge/Serverless instances do not share memory. This is temporary per-instance protection,
// not a distributed limiter; production abuse control should use external storage.
const requestTimesByIp = new Map<string, number[]>();
let lastRateLimitSweepAt = 0;

function isAskLocale(value: unknown): value is AskLocale {
  return value === "zh" || value === "en";
}

function messageFor(code: AskErrorCode, locale: AskLocale): string {
  return t(errorMessages[code], locale);
}

function jsonError(code: AskErrorCode, locale: AskLocale): Response {
  const body: AskErrorResponse = { error: { code, message: messageFor(code, locale) } };
  return Response.json(body, { status: ASK_ERROR_STATUS[code] });
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",", 1)[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

function consumeRateLimit(ip: string, now: number): boolean {
  if (now - lastRateLimitSweepAt >= RATE_LIMIT_WINDOW_MS || requestTimesByIp.size >= RATE_LIMIT_MAX_KEYS) {
    requestTimesByIp.forEach((timestamps, storedIp) => {
      const active = timestamps.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
      if (active.length === 0) requestTimesByIp.delete(storedIp);
      else if (active.length !== timestamps.length) requestTimesByIp.set(storedIp, active);
    });
    lastRateLimitSweepAt = now;
  }

  while (!requestTimesByIp.has(ip) && requestTimesByIp.size >= RATE_LIMIT_MAX_KEYS) {
    const oldestIp = requestTimesByIp.keys().next().value as string | undefined;
    if (!oldestIp) break;
    requestTimesByIp.delete(oldestIp);
  }

  const recent = (requestTimesByIp.get(ip) ?? []).filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    requestTimesByIp.set(ip, recent);
    return false;
  }
  recent.push(now);
  requestTimesByIp.set(ip, recent);
  return true;
}

function ndjson(event: AskStreamEvent): string {
  return `${JSON.stringify(event)}\n`;
}

function streamHeaders(): HeadersInit {
  return {
    "Content-Type": "application/x-ndjson; charset=utf-8",
    "Cache-Control": "no-store",
  };
}

function streamResponse(request: Request, sources: ChatSource[], answer: string, locale: AskLocale): Response {
  const encoder = new TextEncoder();
  const upstreamController = new AbortController();
  let streamCancelled = false;
  let timeoutId: ReturnType<typeof globalThis.setTimeout> | undefined;
  let charTimerId: ReturnType<typeof globalThis.setTimeout> | undefined;

  const abortFromRequest = () => upstreamController.abort();
  if (request.signal.aborted) upstreamController.abort();
  request.signal.addEventListener("abort", abortFromRequest, { once: true });

  const cleanup = () => {
    streamCancelled = true;
    if (timeoutId !== undefined) globalThis.clearTimeout(timeoutId);
    if (charTimerId !== undefined) globalThis.clearTimeout(charTimerId);
    request.signal.removeEventListener("abort", abortFromRequest);
  };

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const enqueue = (event: AskStreamEvent): boolean => {
        if (streamCancelled || upstreamController.signal.aborted) return false;
        controller.enqueue(encoder.encode(ndjson(event)));
        return true;
      };

      timeoutId = globalThis.setTimeout(() => upstreamController.abort(), STREAM_TIMEOUT_MS);

      const finishWithTimeout = () => {
        if (streamCancelled || request.signal.aborted) {
          cleanup();
          return;
        }
        try {
          controller.enqueue(encoder.encode(ndjson({ type: "error", code: "timeout", message: messageFor("timeout", locale) })));
          controller.close();
        } finally {
          cleanup();
        }
      };

      const emitAnswer = () => {
        if (streamCancelled || upstreamController.signal.aborted) {
          if (upstreamController.signal.aborted && !request.signal.aborted && !streamCancelled) finishWithTimeout();
          return;
        }

        if (!enqueue({ type: "sources", sources })) {
          cleanup();
          return;
        }

        const characters = Array.from(answer);
        let cursor = 0;
        const emitNext = () => {
          if (streamCancelled || upstreamController.signal.aborted) {
            if (upstreamController.signal.aborted && !request.signal.aborted && !streamCancelled) finishWithTimeout();
            return;
          }
          if (cursor >= characters.length) {
            enqueue({ type: "done" });
            controller.close();
            cleanup();
            return;
          }
          if (!enqueue({ type: "delta", text: characters[cursor] })) {
            cleanup();
            return;
          }
          cursor += 1;
          charTimerId = globalThis.setTimeout(emitNext, MOCK_CHAR_DELAY_MS);
        };
        emitNext();
      };

      upstreamController.signal.addEventListener("abort", finishWithTimeout, { once: true });
      if (upstreamController.signal.aborted) {
        finishWithTimeout();
        return;
      }
      emitAnswer();
    },
    cancel() {
      cleanup();
      upstreamController.abort();
    },
  });

  return new Response(stream, {
    headers: streamHeaders(),
  });
}

type KimiUsage = {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
};

function recordValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function finiteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function kimiUsage(value: unknown): KimiUsage | undefined {
  const usage = recordValue(value);
  if (!usage) return undefined;
  const result: KimiUsage = {
    promptTokens: finiteNumber(usage.prompt_tokens),
    completionTokens: finiteNumber(usage.completion_tokens),
    totalTokens: finiteNumber(usage.total_tokens),
  };
  return Object.values(result).some((item) => item !== undefined) ? result : undefined;
}

async function kimiStreamResponse(
  request: Request,
  prompt: string,
  question: string,
  sources: ChatSource[],
  locale: AskLocale,
  apiKey: string,
): Promise<Response> {
  const upstreamController = new AbortController();
  const model = process.env.KIMI_MODEL?.trim() || KIMI_DEFAULT_MODEL;
  let timedOut = false;
  let cleaned = false;

  const abortFromRequest = () => upstreamController.abort();
  if (request.signal.aborted) upstreamController.abort();
  request.signal.addEventListener("abort", abortFromRequest, { once: true });
  const timeoutId = globalThis.setTimeout(() => {
    timedOut = true;
    upstreamController.abort();
  }, STREAM_TIMEOUT_MS);

  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    globalThis.clearTimeout(timeoutId);
    request.signal.removeEventListener("abort", abortFromRequest);
  };

  const body = JSON.stringify({
    model,
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: question },
    ],
    stream: true,
    max_completion_tokens: KIMI_MAX_COMPLETION_TOKENS,
  });

  let upstream: Response | undefined;
  for (const endpoint of KIMI_ENDPOINTS) {
    try {
      upstream = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body,
        cache: "no-store",
        signal: upstreamController.signal,
      });
      break;
    } catch {
      if (timedOut || request.signal.aborted) break;
      // Some networks cannot complete TLS to the regional endpoint. Retry only
      // connection failures against the compatible endpoint from the handoff plan.
    }
  }

  if (!upstream) {
    cleanup();
    if (timedOut) return jsonError("timeout", locale);
    if (!request.signal.aborted) console.error("[ask] Kimi request could not be completed.");
    return jsonError("service-unavailable", locale);
  }

  if (!upstream.ok || !upstream.body) {
    cleanup();
    const log = upstream.status >= 500 ? console.error : console.warn;
    log(`[ask] Kimi upstream returned HTTP ${upstream.status}.`);
    if (upstream.status === 429) return jsonError("rate-limit", locale);
    return jsonError("service-unavailable", locale);
  }

  const reader = upstream.body.getReader();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let cancelled = false;
  let closed = false;
  let usage: KimiUsage | undefined;
  let receivedContent = false;
  let receivedTerminal = false;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const enqueue = (event: AskStreamEvent): boolean => {
        if (cancelled || closed) return false;
        try {
          controller.enqueue(encoder.encode(ndjson(event)));
          return true;
        } catch {
          return false;
        }
      };

      const close = () => {
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {
          // The client may have disconnected while the upstream stream was closing.
        }
      };

      const finish = () => {
        enqueue({ type: "done", usage });
        close();
      };

      const failStream = (code: AskErrorCode) => {
        enqueue({ type: "error", code, message: messageFor(code, locale) });
        close();
      };

      const processFrame = (frame: string): boolean => {
        const data = frame
          .split("\n")
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trimStart())
          .join("\n")
          .trim();
        if (!data) return false;
        if (data === "[DONE]") {
          receivedTerminal = true;
          if (receivedContent) finish();
          else failStream("service-unavailable");
          void reader.cancel();
          return true;
        }

        try {
          const chunk = recordValue(JSON.parse(data));
          if (!chunk || chunk.error !== undefined) {
            failStream("service-unavailable");
            return true;
          }
          const choices = Array.isArray(chunk?.choices) ? chunk.choices : [];
          const choice = recordValue(choices[0]);
          const delta = recordValue(choice?.delta);
          const content = delta?.content;
          if (typeof content === "string" && content) {
            receivedContent = true;
            enqueue({ type: "delta", text: content });
          }
          if (typeof choice?.finish_reason === "string") receivedTerminal = true;
          usage = kimiUsage(choice?.usage) ?? kimiUsage(chunk?.usage) ?? usage;
          if (receivedTerminal) {
            if (receivedContent) finish();
            else failStream("service-unavailable");
            void reader.cancel();
            return true;
          }
        } catch {
          failStream("service-unavailable");
          return true;
        }
        return false;
      };

      enqueue({ type: "sources", sources });

      void (async () => {
        let buffer = "";
        try {
          while (!cancelled && !closed) {
            const { done, value } = await reader.read();
            buffer += decoder.decode(value, { stream: !done });
            buffer = buffer.replace(/\r\n/g, "\n");
            const frames = buffer.split("\n\n");
            buffer = frames.pop() ?? "";
            if (frames.some(processFrame)) return;
            if (done) {
              if (buffer.trim() && processFrame(buffer)) return;
              if (!closed && receivedContent && receivedTerminal) finish();
              else if (!closed) failStream("service-unavailable");
              return;
            }
          }
        } catch {
          if (request.signal.aborted || cancelled) {
            close();
            return;
          }
          if (timedOut) enqueue({ type: "error", code: "timeout", message: messageFor("timeout", locale) });
          else {
            console.error("[ask] Kimi response stream ended unexpectedly.");
            enqueue({ type: "error", code: "service-unavailable", message: messageFor("service-unavailable", locale) });
          }
          close();
        } finally {
          cleanup();
        }
      })();
    },
    cancel() {
      cancelled = true;
      cleanup();
      upstreamController.abort();
      void reader.cancel();
    },
  });

  return new Response(stream, { headers: streamHeaders() });
}

export async function POST(request: Request): Promise<Response> {
  let body: AskRequest;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return jsonError("invalid-request", "zh");
    const candidate = parsed as Record<string, unknown>;
    if (typeof candidate.question !== "string" || (candidate.locale !== undefined && !isAskLocale(candidate.locale))) {
      return jsonError("invalid-request", isAskLocale(candidate.locale) ? candidate.locale : "zh");
    }
    body = { question: candidate.question, locale: candidate.locale as AskLocale | undefined };
  } catch {
    return jsonError("invalid-request", "zh");
  }

  const locale = body.locale ?? "zh";
  const question = body.question.trim();
  if (!question) return jsonError("invalid-request", locale);
  if (Array.from(question).length > MAX_QUESTION_LENGTH) return jsonError("question-too-long", locale);
  if (!consumeRateLimit(clientIp(request), Date.now())) return jsonError("rate-limit", locale);

  const retrieval = retrieveArchive(question, locale);

  const apiKey = process.env.MOONSHOT_API_KEY?.trim();
  if (apiKey && retrieval.sources.length > 0) {
    return kimiStreamResponse(request, retrieval.prompt, question, retrieval.sources, locale, apiKey);
  }

  const failure = mockFailure(question);
  if (failure === "rate-limit") return jsonError("rate-limit", locale);
  if (failure === "error") return jsonError("service-unavailable", locale);

  const answerText = retrieval.fallbackText ? t(retrieval.fallbackText, locale) : t(noArchiveMatch, locale);
  return streamResponse(request, retrieval.sources, answerText, locale);
}
