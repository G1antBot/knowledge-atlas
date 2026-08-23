"use client";

import Link from "next/link";
import { archiveProjects, type ArchiveCapability, type ArchiveFigure, type ArchiveSection, type ArchiveSubsection, type ProjectArchive } from "@/data/content";
import { useLocale } from "@/components/locale-context";
import { t } from "@/lib/i18n";
import { MediaStrip } from "@/components/media-strip";
import { ArchiveDirectory } from "@/components/archive-directory";
import { ArchiveRelations } from "@/components/archive-relations";
import { Arrow, Coord, Eyebrow, SourceTag } from "@/components/ui";

function SourceList({ sources }: { sources: ProjectArchive["sources"] }) {
  const { locale } = useLocale();
  return <div className="source-list">{sources.map((source) => {
    const content = <><SourceTag>{source.kind.toUpperCase()} / {t(source.label, locale)}</SourceTag>{source.note && <p>{t(source.note, locale)}</p>}</>;
    return source.href
      ? <a className="source-card source-card-link" href={source.href} target="_blank" rel="noreferrer" key={source.label.zh}>{content}<span aria-hidden="true">↗</span></a>
      : <div className="source-card" key={source.label.zh}>{content}</div>;
  })}</div>;
}

function FigureGrid({ figures, anchorPrefix }: { figures: ArchiveFigure[]; anchorPrefix: string }) {
  const { locale } = useLocale();
  const sequence = figures.every((figure) => figure.format === "sequence");
  const portrait = figures.every((figure) => figure.format === "portrait");
  return <div className={`archive-figure-grid figure-count-${figures.length} ${sequence ? "figure-sequence" : ""} ${portrait ? "figure-portrait-set" : ""}`}>{figures.map((figure, figureIndex) => <figure className={`archive-figure figure-${figure.format ?? "wide"}`} id={`${anchorPrefix}--figure-${figureIndex + 1}`} key={figure.path}>
    <div className="archive-figure-image"><img src={figure.path} alt={t(figure.alt, locale)} loading="lazy" decoding="async" /></div>
    <figcaption>{t(figure.caption, locale)}</figcaption>
  </figure>)}</div>;
}

function AliasAnchors({ anchors, exclude }: { anchors?: string[]; exclude?: string[] }) {
  if (!anchors?.length) return null;
  const excluded = new Set(exclude ?? []);
  return <>{anchors.filter((anchor) => !excluded.has(anchor)).map((anchor) => <span className="archive-anchor" id={anchor} key={anchor} aria-hidden="true" />)}</>;
}

function CapabilityLedger({ capabilities }: { capabilities?: ArchiveCapability[] }) {
  const { locale } = useLocale();
  const zh = locale === "zh";
  if (!capabilities?.length) return null;
  return <div className="capability-ledger">{capabilities.map((capability, capabilityIndex) => <article className={`capability-item is-${capability.status}`} key={capability.title.zh}>
    <div className="capability-meta"><span>{String(capabilityIndex + 1).padStart(2, "0")}</span><b>{capability.status === "implemented" ? (zh ? "已實作" : "Implemented") : (zh ? "規劃中" : "Planned")}</b></div>
    <h3>{t(capability.title, locale)}</h3><p>{t(capability.detail, locale)}</p>
  </article>)}</div>;
}

function SubsectionView({ section, subsection }: { section: ArchiveSection; subsection: ArchiveSubsection }) {
  const { locale } = useLocale();
  return <section className="archive-subsection" id={subsection.id}>
    <AliasAnchors anchors={subsection.anchors} exclude={[subsection.id]} />
    <div className="archive-subsection-copy"><h3>{t(subsection.title, locale)}</h3><p>{t(subsection.body, locale)}</p>
      {subsection.points && <ul className="archive-points">{subsection.points.map((point) => <li key={point.zh}>{t(point, locale)}</li>)}</ul>}
      <CapabilityLedger capabilities={subsection.capabilities} />
      {subsection.sources?.length ? <div className="section-sources"><SourceList sources={subsection.sources} /></div> : null}
    </div>
    {subsection.figures?.length ? <div className="editorial-section-figures"><FigureGrid figures={subsection.figures} anchorPrefix={`${section.id}--${subsection.id}`} /></div> : null}
  </section>;
}

function ArchiveSectionView({ section, index }: { section: ArchiveSection; index: number }) {
  const { locale } = useLocale();
  const zh = locale === "zh";
  return <section className={`editorial-section ${section.layout === "centered" ? "is-centered" : ""}`} id={section.id}>
    <AliasAnchors anchors={section.anchors} exclude={[section.id]} />
    <div className="editorial-section-index"><span>{String(index + 1).padStart(2, "0")}</span><small>{section.id.replaceAll("-", " / ")}</small></div>
    <div className="editorial-section-copy"><h2>{t(section.title, locale)}</h2><p>{t(section.body, locale)}</p>
      {section.points && <ul className="archive-points">{section.points.map((point) => <li key={point.zh}>{t(point, locale)}</li>)}</ul>}
      <CapabilityLedger capabilities={section.capabilities} />
      <div className="section-sources"><SourceList sources={section.sources} /></div>
      {section.subsections?.length ? <div className="archive-subsections">{section.subsections.map((subsection) => <SubsectionView key={subsection.id} section={section} subsection={subsection} />)}</div> : null}
    </div>
    {section.figures?.length ? <div className="editorial-section-figures"><FigureGrid figures={section.figures} anchorPrefix={section.id} /></div> : null}
    {section.media?.length ? <div className="editorial-section-figures editorial-section-media"><div className="archive-media-anchors" aria-hidden="true">{section.media.map((asset) => <span id={`${section.id}--media--${asset.id}`} key={asset.id} />)}</div><div className="archive-media-heading"><h3>{zh ? "演示媒體" : "Demonstration media"}</h3><p>{zh ? "四段畫面依序記下自主起飛、視覺對準、平順逼近與終端穿越。預設先顯示靜態縮圖，點擊後再載入 GIF。" : "Four clips record takeoff, visual alignment, smooth approach, and terminal traversal in sequence. Static posters appear first; GIFs load on demand."}</p></div><MediaStrip assets={section.media} /></div> : null}
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
      <ArchiveDirectory sections={project.sections} locale={locale} />
      <article className="editorial-article">{project.sections.map((section, index) => <ArchiveSectionView key={section.id} section={section} index={index} />)}
        <section className="project-source-ledger"><div><Eyebrow>{zh ? "引用與來源" : "Citations and sources"}</Eyebrow><h2>{zh ? "這一頁使用的資料" : "Material used on this page"}</h2></div><SourceList sources={project.sources} /></section>
        <ArchiveRelations project={project} projects={archiveProjects} />
        <Link className="related-link" href="/projects"><span>{zh ? "返回檔案索引" : "Back to archive index"}</span><Arrow /></Link>
      </article>
    </> : <div className="pending-archive"><Eyebrow tone={project.accent === "ink" ? "ink" : project.accent}>{project.status === "pending" ? (zh ? "待補檔" : "Archive pending") : (zh ? "次級檔案" : "Secondary archive")}</Eyebrow><h2>{t(project.subtitle, locale)}</h2><p>{t(project.summary, locale)}</p><SourceList sources={project.sources} /><Link className="related-link" href="/projects"><span>{zh ? "返回檔案索引" : "Back to archive index"}</span><Arrow /></Link></div>}
  </div>;
}
