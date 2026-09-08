import type { ChatSource } from "@/data/content";

export type AnswerStatus = "streaming" | "complete" | "incomplete";
export type Message = {
  role: "user" | "assistant";
  text: string;
  sources?: ChatSource[];
  index?: number;
  status?: AnswerStatus;
};

export function markAnswer(messages: Message[], index: number, status: AnswerStatus): Message[] {
  return messages.map((message) => message.role === "assistant" && message.index === index
    ? { ...message, status }
    : message);
}

export function isCompleteAnswer(message: Message): boolean {
  return message.role === "assistant" && message.status === "complete" && Boolean(message.text);
}
