import { chatAnswers, type ChatAnswer } from "@/data/content";

export type MockChatResult = ChatAnswer & { answerIndex: number };

export function mockAnswer(question: string): MockChatResult {
  const normalized = question.toLowerCase();
  const includesAny = (...terms: string[]) => terms.some((term) => normalized.includes(term));
  const answerIndex = includesAny("扫码登录", "掃碼登入", "二维码登录", "二維碼登入", "qr login") ? 8
    : includesAny("四人团队", "四人團隊", "团队中", "團隊中", "负责哪些", "負責哪些", "four-person team", "team role") ? 9
    : includesAny("混合路由", "规则还是模型", "規則還是模型", "規則或模型", "hybrid routing", "rules versus") ? 1
    : includesAny("看门狗", "看門狗", "急停", "watchdog", "emergency stop") ? 2
    : includesAny("安全", "边界", "邊界", "safety", "boundary") ? 3
    : includesAny("yoloe", "感知", "observation", "perception") ? 4
    : includesAny("视觉伺服", "視覺伺服", "对准", "對準", "逼近", "visual servo", "alignment", "approach") ? 5
    : includesAny("strike", "终端穿越", "終端穿越", "terminal traverse") ? 6
    : includesAny("限制", "下一步", "来源", "來源", "mock", "后端", "後端", "limits", "next step", "source", "backend") ? 7
    : includesAny("无人机", "無人機", "uav", "大模型", "大型語言模型", "language model", "高层决策", "高層決策") ? 0
    : question.length % chatAnswers.length;
  return { ...chatAnswers[answerIndex], answerIndex };
}

export function mockFailure(question: string): "rate-limit" | "error" | null {
  if (question.toLowerCase().includes("限流") || question.toLowerCase().includes("rate")) return "rate-limit";
  if (question.toLowerCase().includes("错误") || question.toLowerCase().includes("錯誤") || question.toLowerCase().includes("error")) return "error";
  return null;
}
