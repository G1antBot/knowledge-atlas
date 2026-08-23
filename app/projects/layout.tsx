import type { ReactNode } from "react";
import { createZhPageMetadata } from "@/lib/metadata";

export const metadata = createZhPageMetadata(
  "檔案索引",
  "目前收錄一份研究主檔案與兩份專案檔案，內容依各自的來源與完成狀態持續整理。",
);

export default function ProjectsLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
