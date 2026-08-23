import type { ChatSource } from "@/data/content";

export type AskLocale = "zh" | "en";

export type AskErrorCode =
  | "invalid-request"
  | "question-too-long"
  | "rate-limit"
  | "timeout"
  | "service-unavailable";

export type AskErrorResponse = {
  error: {
    code: AskErrorCode;
    message: string;
  };
};

export const ASK_ERROR_STATUS: Record<AskErrorCode, number> = {
  "invalid-request": 400,
  "question-too-long": 400,
  "rate-limit": 429,
  timeout: 408,
  "service-unavailable": 503,
};

export function isAskErrorCode(value: unknown): value is AskErrorCode {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(ASK_ERROR_STATUS, value);
}

export type AskRequest = {
  question: string;
  locale?: AskLocale;
};

export type AskStreamEvent =
  | { type: "sources"; sources: ChatSource[] }
  | { type: "delta"; text: string }
  | {
      type: "done";
      usage?: {
        promptTokens?: number;
        completionTokens?: number;
        totalTokens?: number;
      };
    }
  | { type: "error"; code: AskErrorCode; message: string };
