import type { ReactNode } from "react";
import { createZhPageMetadata } from "@/lib/metadata";

export const metadata = createZhPageMetadata(
  "向檔案提問",
  "從目前公開的專案檔案提出問題，回答會附上對應章節；目前使用本地模擬串流，尚未連接外部模型。",
);

export default function AskLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
