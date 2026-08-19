"use client";

import Link from "next/link";
import { archiveProjects, type ArchiveFigure, type ArchiveSection, type ProjectArchive } from "@/data/content";
import { useLocale } from "@/components/locale-context";
import { t } from "@/lib/i18n";
import { MediaStrip } from "@/components/media-strip";
import { ArchiveDirectory } from "@/components/archive-directory";
import { ArchiveRelations } from "@/components/archive-relations";
import { Arrow, Coord, Eyebrow, SourceTag } from "@/components/ui";

function SourceList({ sources }: { sources: ProjectArchive["sources"] }) {
  const { locale } = useLocale();
  return <div className="source-list">{sources.map((source) => <div className="source-card" key={source.label.zh}><SourceTag>{source.kind.toUpperCase()} / {t(source.label, locale)}</SourceTag>{source.note && <p>{t(source.note, locale)}</p>}</div>)}</div>;
}

function FigureGrid({ figures }: { figures: ArchiveFigure[] }) {
  const { locale } = useLocale();
  const sequence = figures.every((figure) => figure.format === "sequence");
  const portrait = figures.every((figure) => figure.format === "portrait");
  return <div className={`archive-figure-grid figure-count-${figures.length} ${sequence ? "figure-sequence" : ""} ${portrait ? "figure-portrait-set" : ""}`}>{figures.map((figure) => <figure className={`archive-figure figure-${figure.format ?? "wide"}`} key={figure.path}>
    <div className="archive-figure-image"><img src={figure.path} alt={t(figure.alt, locale)} loading="lazy" decoding="async" /></div>
    <figcaption>{t(figure.caption, locale)}</figcaption>
  </figure>)}</div>;
}

function ArchiveSectionView({ section, index }: { section: ArchiveSection; index: number }) {
  const { locale } = useLocale();
  return <section className="editorial-section" id={section.id}>
    <div className="editorial-section-index"><span>{String(index + 1).padStart(2, "0")}</span><small>{section.id.replaceAll("-", " / ")}</small></div>
    <div className="editorial-section-copy"><h2>{t(section.title, locale)}</h2><p>{t(section.body, locale)}</p>{section.points && <ul className="archive-points">{section.points.map((point) => <li key={point.zh}>{t(point, locale)}</li>)}</ul>}<div className="section-sources"><SourceList sources={section.sources} /></div></div>
    {section.figures && <div className="editorial-section-figures"><FigureGrid figures={section.figures} /></div>}
  </section>;
}

export function ProjectDetail({ project }: { project: ProjectArchive }) {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const hasCompleteArchive = project.sections.length > 0;

  return <div className="page-frame project-editorial">
    <section className="project-editorial-hero">
      <div className="project-hero-meta"><Eyebrow tone={project.accent === "ink" ? "ink" : project.accent}>Archive / {project.index}</Eyebrow><Coord>{project.period}</Coord></div>
      <div className="project-hero-grid"><span className="project-hero-index">{project.index}</span><div><p className="project-hero-category">{t(project.category, locale)}</p><h1>{t(project.title, locale)}</h1></div></div>
      <div className="project-hero-summary"><p>{t(project.summary, locale)}</p><div className="project-hero-tags">{project.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div></div>
    </section>

    {hasCompleteArchive ? <>
      <ArchiveDirectory sections={project.sections} hasMedia={Boolean(project.media?.length)} locale={locale} />
      <article className="editorial-article">{project.sections.map((section, index) => <ArchiveSectionView key={section.id} section={section} index={index} />)}
        {project.media && <section className="editorial-section editorial-media" id="media"><div className="editorial-section-index"><span>{String(project.sections.length + 1).padStart(2, "0")}</span><small>media / record</small></div><div className="editorial-section-copy"><h2>{zh ? "媒體記錄" : "Media record"}</h2><p>{zh ? "四段畫面依序記下自主起飛、視覺對準、平順逼近與終端穿越。預設先顯示靜態縮圖，點擊後再載入 GIF。" : "Four clips record takeoff, visual alignment, smooth approach, and terminal traversal in sequence. Static posters appear first; GIFs load on demand."}</p></div><div className="editorial-section-figures"><MediaStrip assets={project.media} /></div></section>}
        <section className="project-source-ledger"><div><Eyebrow>{zh ? "引用與來源" : "Citations and sources"}</Eyebrow><h2>{zh ? "這一頁使用的資料" : "Material used on this page"}</h2></div><SourceList sources={project.sources} /></section>
        <ArchiveRelations project={project} projects={archiveProjects} />
        <Link className="related-link" href="/projects"><span>{zh ? "返回檔案索引" : "Back to archive index"}</span><Arrow /></Link>
      </article>
    </> : <div className="pending-archive"><Eyebrow tone={project.accent === "ink" ? "ink" : project.accent}>{project.status === "pending" ? (zh ? "待補檔" : "Archive pending") : (zh ? "次級檔案" : "Secondary archive")}</Eyebrow><h2>{t(project.subtitle, locale)}</h2><p>{t(project.summary, locale)}</p><SourceList sources={project.sources} /><Link className="related-link" href="/projects"><span>{zh ? "返回檔案索引" : "Back to archive index"}</span><Arrow /></Link></div>}
  </div>;
}
