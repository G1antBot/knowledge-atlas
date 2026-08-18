import { chatAnswers, type ChatAnswer } from "@/data/content";

export type MockChatResult = ChatAnswer & { answerIndex: number };

export function mockAnswer(question: string): MockChatResult {
  const normalized = question.toLowerCase();
  const answerIndex = normalized.includes("混合路由") || normalized.includes("规则还是模型") || normalized.includes("hybrid routing") || normalized.includes("rules versus") ? 1
    : normalized.includes("看门狗") || normalized.includes("急停") || normalized.includes("watchdog") || normalized.includes("emergency stop") ? 2
    : normalized.includes("安全") || normalized.includes("边界") || normalized.includes("safety") || normalized.includes("boundary") ? 3
    : normalized.includes("yoloe") || normalized.includes("感知") || normalized.includes("observation") || normalized.includes("perception") ? 4
    : normalized.includes("视觉伺服") || normalized.includes("对准") || normalized.includes("逼近") || normalized.includes("visual servo") || normalized.includes("alignment") || normalized.includes("approach") ? 5
    : normalized.includes("strike") || normalized.includes("终端穿越") || normalized.includes("terminal traverse") ? 6
    : normalized.includes("限制") || normalized.includes("下一步") || normalized.includes("来源") || normalized.includes("mock") || normalized.includes("后端") || normalized.includes("limits") || normalized.includes("next step") || normalized.includes("source") || normalized.includes("backend") ? 7
    : normalized.includes("无人机") || normalized.includes("uav") || normalized.includes("大模型") || normalized.includes("language model") || normalized.includes("高层决策") ? 0
    : question.length % chatAnswers.length;
  return { ...chatAnswers[answerIndex], answerIndex };
}

export function mockFailure(question: string): "rate-limit" | "error" | null {
  if (question.toLowerCase().includes("限流") || question.toLowerCase().includes("rate")) return "rate-limit";
  if (question.toLowerCase().includes("错误") || question.toLowerCase().includes("error")) return "error";
  return null;
}
