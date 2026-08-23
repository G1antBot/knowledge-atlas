import type { ReactNode } from "react";
import { createZhPageMetadata } from "@/lib/metadata";

export const metadata = createZhPageMetadata(
  "向檔案提問",
  "從目前公開的專案檔案提出問題，系統會先檢索相關章節，再由 Kimi 整理附有來源的回答。",
);

export default function AskLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
