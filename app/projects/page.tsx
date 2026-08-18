"use client";

import { archiveProjects } from "@/data/content";
import { Eyebrow } from "@/components/ui";
import { ProjectBrowser } from "@/components/project-browser";
import { useLocale } from "@/components/locale-context";

export default function ProjectsPage() {
  const { locale } = useLocale();
  return <div className="page-frame"><section className="page-intro"><Eyebrow>Archive / 02</Eyebrow><h1>PROJECT<br /><span style={{ color: "var(--blue)" }}>INDEX</span></h1><p>{locale === "zh" ? "按档案状态进入：主档案、待补档和次级索引。" : "Enter by archive status: primary, pending, or secondary."}</p></section><ProjectBrowser projects={archiveProjects} /></div>;
}
