"use client";

import Link from "next/link";
import type { ProjectArchive, SourceRef } from "@/data/content";
import { useLocale } from "@/components/locale-context";
import { t } from "@/lib/i18n";
import { Arrow, Eyebrow, SourceTag } from "@/components/ui";

type SourceBacklink = {
  source: SourceRef;
  sections: Array<{ id: string; index: string; title: ProjectArchive["title"] }>;
};

function getSourceBacklinks(project: ProjectArchive): SourceBacklink[] {
  const links = new Map<string, SourceBacklink>();

  project.sections.forEach((section, sectionIndex) => {
    section.sources.forEach((source) => {
      const key = `${source.kind}:${source.label.zh}:${source.label.en}`;
      const entry = links.get(key) ?? { source, sections: [] };
      entry.sections.push({
        id: section.id,
        index: String(sectionIndex + 1).padStart(2, "0"),
        title: section.title,
      });
      links.set(key, entry);
    });
  });

  return Array.from(links.values()).sort((a, b) => b.sections.length - a.sections.length);
}

export function ArchiveRelations({ project, projects }: { project: ProjectArchive; projects: ProjectArchive[] }) {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const backlinks = getSourceBacklinks(project);
  const neighbours = projects.filter((item) => item.slug !== project.slug);

  return <section className="archive-relations" aria-labelledby="archive-relations-heading">
    <div className="archive-relations-heading">
      <Eyebrow>{zh ? "章節與來源 / Backlinks" : "Sections and sources / Backlinks"}</Eyebrow>
      <h2 id="archive-relations-heading">{zh ? "哪些章節引用了哪些資料" : "Which sections cite which sources"}</h2>
      <p>{zh ? "以下連結依照這份檔案現有的引用關係整理，點擊章節即可回到正文。" : "These links follow the citations already present in this record. Select a section to return to the text."}</p>
    </div>

    <div className="source-backlink-grid">
      {backlinks.map(({ source, sections }) => <article className="source-backlink-card" key={`${source.kind}-${source.label.en}`}>
        <SourceTag>{source.kind.toUpperCase()} / {t(source.label, locale)}</SourceTag>
        <span className="backlink-count">{String(sections.length).padStart(2, "0")}</span>
        <div className="backlink-section-list">{sections.map((section) => <a href={`#${section.id}`} key={section.id}><span>{section.index}</span>{t(section.title, locale)}</a>)}</div>
      </article>)}
    </div>

    {neighbours.length > 0 && <div className="archive-neighbours">
      <span className="archive-neighbours-label">{zh ? "檔案網絡" : "Archive network"}</span>
      {neighbours.map((item) => <Link href={`/projects/${item.slug}`} key={item.slug}>
        <span>{item.index}</span><b>{t(item.title, locale)}</b><small>{item.status}</small><Arrow />
      </Link>)}
    </div>}
  </section>;
}
