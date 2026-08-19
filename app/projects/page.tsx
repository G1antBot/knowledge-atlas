"use client";

import { archiveProjects } from "@/data/content";
import { Eyebrow } from "@/components/ui";
import { ProjectBrowser } from "@/components/project-browser";
import { useLocale } from "@/components/locale-context";

export default function ProjectsPage() {
  const { locale } = useLocale();
  return <div className="page-frame"><section className="page-intro"><Eyebrow>Archive / 02</Eyebrow><h1>PROJECT<br /><span style={{ color: "var(--blue)" }}>INDEX</span></h1><p>{locale === "zh" ? "目前收錄一份研究主檔案與兩份專案檔案，內容依各自的來源與完成狀態持續整理。" : "The index currently holds one primary research archive and two project archives, each maintained according to its sources and delivery state."}</p></section><ProjectBrowser projects={archiveProjects} /></div>;
}
