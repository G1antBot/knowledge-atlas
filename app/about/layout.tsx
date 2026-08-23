import type { ReactNode } from "react";
import { createZhPageMetadata } from "@/lib/metadata";

export const metadata = createZhPageMetadata(
  "關於我",
  "這一頁補上檔案之外的脈絡：學習背景、實習記錄，以及我持續關注的問題。",
);

export default function AboutLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
