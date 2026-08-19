"use client";

import { archiveProjects } from "@/data/content";
import { Eyebrow } from "@/components/ui";
import { ProjectBrowser } from "@/components/project-browser";
import { useLocale } from "@/components/locale-context";

export default function ProjectsPage() {
  const { locale } = useLocale();
  return <div className="page-frame"><section className="page-intro"><Eyebrow>Archive / 02</Eyebrow><h1>PROJECT<br /><span style={{ color: "var(--blue)" }}>INDEX</span></h1><p>{locale === "zh" ? "目前有一份完整研究檔案，以及兩個等待補充資料的專案入口。" : "The index currently holds one complete research archive and two project entries awaiting more material."}</p></section><ProjectBrowser projects={archiveProjects} /></div>;
}
