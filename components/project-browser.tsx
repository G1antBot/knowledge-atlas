"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProjectArchive } from "@/data/content";
import { useLocale } from "@/components/locale-context";
import { t } from "@/lib/i18n";
import { Arrow, Eyebrow } from "@/components/ui";

export function ProjectBrowser({ projects }: { projects: ProjectArchive[] }) {
  const { locale } = useLocale();
  const filters = ["ALL", ...Array.from(new Set(projects.flatMap((project) => project.tags)))];
  const [activeFilter, setActiveFilter] = useState("ALL");
  const visibleProjects = useMemo(() => activeFilter === "ALL" ? projects : projects.filter((project) => project.tags.includes(activeFilter)), [activeFilter, projects]);
  const zh = locale === "zh";

  return <>
    <div className="filter-row" aria-label={zh ? "檔案篩選" : "Archive filters"}>{filters.map((filter) => <button type="button" className={`filter-button ${filter === activeFilter ? "active" : ""}`} key={filter} onClick={() => setActiveFilter(filter)} aria-pressed={filter === activeFilter}>{filter === "ALL" ? (zh ? "全部" : "ALL") : filter}</button>)}</div>
    <div className="archive-list">{visibleProjects.map((project) => <Link href={`/projects/${project.slug}`} key={project.slug} className={`archive-row archive-row-${project.accent} archive-status-${project.status}`}><span className="archive-index">{project.index}</span><div className="archive-main"><Eyebrow tone={project.accent === "ink" ? "ink" : project.accent}>{t(project.category, locale)}</Eyebrow><h2>{t(project.title, locale)}</h2><p>{t(project.subtitle, locale)}</p></div><div className="archive-meta"><span className="coord">{project.period}</span><span className="archive-status">{project.status === "primary" ? (zh ? "主檔案" : "Primary") : project.status === "secondary" ? (zh ? "次級檔案" : "Secondary") : (zh ? "待補檔" : "Pending archive")}</span><div className="tag-row">{project.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div></div><Arrow /></Link>)}</div>
    {visibleProjects.length === 0 && <p className="placeholder-note">{zh ? "沒有符合的檔案。試試全部。" : "No matching archive. Try ALL."}</p>}
  </>;
}
