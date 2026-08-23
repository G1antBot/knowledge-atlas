import { create, insertMultiple, search, type Results } from "@orama/orama";
import type { ArchiveFigure, ArchiveSection, ArchiveSubsection, Bilingual, MediaAsset, ProjectArchive, SourceRef } from "@/data/content";

export const ARCHIVE_SEARCH_LIMIT = 12;

type ArchiveSearchSchema = {
  title: "string";
  subtitle: "string";
  summary: "string";
  tags: "string[]";
  sectionTitle: "string";
  sectionBody: "string";
  source: "string";
  searchText: "string";
  projectSlug: "string";
  sectionId: "string";
  subsectionId: "string";
  targetId: "string";
  nodeType: "string";
  order: "number";
};

const archiveSearchSchema: ArchiveSearchSchema = {
  title: "string",
  subtitle: "string",
  summary: "string",
  tags: "string[]",
  sectionTitle: "string",
  sectionBody: "string",
  source: "string",
  searchText: "string",
  projectSlug: "string",
  sectionId: "string",
  subsectionId: "string",
  targetId: "string",
  nodeType: "string",
  order: "number",
};

export type ArchiveSearchNodeType = "project" | "section" | "subsection" | "figure" | "media";

export type ArchiveSearchDocument = {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  tags: string[];
  sectionTitle: string;
  sectionBody: string;
  source: string;
  searchText: string;
  projectSlug: string;
  sectionId: string;
  subsectionId: string;
  targetId: string;
  nodeType: ArchiveSearchNodeType;
  order: number;
};

export type ArchiveSearchHit = {
  id: string;
  href: string;
  kind: ArchiveSearchNodeType;
  projectSlug: string;
  sectionId?: string;
  subsectionId?: string;
  title: Bilingual;
  subtitle: Bilingual;
  summary: Bilingual;
  sectionTitle?: Bilingual;
  source: Bilingual;
  tags: string[];
  score: number;
};

type ArchiveSearchDatabase = ReturnType<typeof create<ArchiveSearchSchema>>;

export type ArchiveSearchIndex = {
  readonly database: ArchiveSearchDatabase;
  readonly documents: readonly ArchiveSearchDocument[];
};

function bilingualText(value: Bilingual): string {
  return `${value.zh}\n${value.en}`;
}

function sourceText(sources: SourceRef[]): string {
  const zh = sources.map((source) => [source.kind, source.label.zh, source.note?.zh].filter(Boolean).join(" · ")).join(" · ");
  const en = sources.map((source) => [source.kind, source.label.en, source.note?.en].filter(Boolean).join(" · ")).join(" · ");
  return `${zh}\n${en}`;
}

function searchableText(values: string[]): string {
  const text = values.join("\n");
  const cjkRuns = text.match(/[\u3400-\u9fff]+/g) ?? [];
  const cjkGrams = cjkRuns.flatMap((run) => {
    const characters = Array.from(run);
    const grams = new Set<string>();
    for (let size = 1; size <= Math.min(characters.length, 4); size += 1) {
      for (let start = 0; start <= characters.length - size; start += 1) {
        grams.add(characters.slice(start, start + size).join(""));
      }
    }
    return Array.from(grams);
  });
  return `${text}\n${cjkGrams.join(" ")}`;
}

function documentSearchText(title: string, subtitle: string, summary: string, tags: string[], sectionTitle: string, sectionBody: string, source: string): string {
  return searchableText([title, subtitle, summary, ...tags, sectionTitle, sectionBody, source]);
}

function projectFields(project: ProjectArchive) {
  return {
    title: bilingualText(project.title),
    subtitle: bilingualText(project.subtitle),
    summary: bilingualText(project.summary),
    tags: project.tags,
  };
}

function projectDocument(project: ProjectArchive): ArchiveSearchDocument {
  const { title, subtitle, summary, tags } = projectFields(project);
  const source = sourceText(project.sources);
  return {
    id: `project:${project.slug}`,
    title,
    subtitle,
    summary,
    tags,
    sectionTitle: "",
    sectionBody: "",
    source,
    searchText: documentSearchText(title, subtitle, summary, tags, "", "", source),
    projectSlug: project.slug,
    sectionId: "",
    subsectionId: "",
    targetId: "",
    nodeType: "project",
    order: Number(project.index) * 100,
  };
}

function sectionDocument(project: ProjectArchive, section: ArchiveSection, sectionIndex: number): ArchiveSearchDocument {
  const { title, subtitle, summary, tags } = projectFields(project);
  const sectionTitle = bilingualText(section.title);
  const points = section.points?.flatMap((point) => [point.zh, point.en]) ?? [];
  const sectionBody = [bilingualText(section.body), ...points].join("\n");
  const source = sourceText(section.sources);
  return {
    id: `section:${project.slug}:${section.id}`,
    title,
    subtitle,
    summary,
    tags,
    sectionTitle,
    sectionBody,
    source,
    searchText: documentSearchText(title, subtitle, summary, tags, sectionTitle, sectionBody, source),
    projectSlug: project.slug,
    sectionId: section.id,
    subsectionId: "",
    targetId: section.id,
    nodeType: "section",
    order: Number(project.index) * 100 + sectionIndex + 1,
  };
}

function subsectionTargetId(section: ArchiveSection, subsection: ArchiveSubsection): string {
  return subsection.id || `${section.id}-subsection`;
}

function subsectionDocument(project: ProjectArchive, section: ArchiveSection, subsection: ArchiveSubsection, sectionIndex: number, subsectionIndex: number): ArchiveSearchDocument {
  const { title, subtitle, summary, tags } = projectFields(project);
  const sectionTitle = bilingualText(section.title);
  const subsectionTitle = bilingualText(subsection.title);
  const points = subsection.points?.flatMap((point) => [point.zh, point.en]) ?? [];
  const sectionBody = [subsectionTitle, bilingualText(subsection.body), ...points].join("\n");
  const source = sourceText(subsection.sources ?? section.sources);
  return {
    id: `subsection:${project.slug}:${section.id}:${subsection.id}`,
    title: subsectionTitle,
    subtitle,
    summary,
    tags,
    sectionTitle,
    sectionBody,
    source,
    searchText: documentSearchText(title, subtitle, summary, tags, sectionTitle, sectionBody, source),
    projectSlug: project.slug,
    sectionId: section.id,
    subsectionId: subsection.id,
    targetId: subsectionTargetId(section, subsection),
    nodeType: "subsection",
    order: Number(project.index) * 100 + sectionIndex + 1 + (subsectionIndex + 1) / 100,
  };
}

function figureTargetId(section: ArchiveSection, figureIndex: number, subsection?: ArchiveSubsection): string {
  const prefix = subsection ? `${section.id}--${subsection.id}` : section.id;
  return `${prefix}--figure-${figureIndex + 1}`;
}

function figureDocument(project: ProjectArchive, section: ArchiveSection, figure: ArchiveFigure, sectionIndex: number, figureIndex: number, subsection?: ArchiveSubsection): ArchiveSearchDocument {
  const { title, subtitle, summary, tags } = projectFields(project);
  const sectionTitle = bilingualText(section.title);
  const figureTitle = bilingualText(figure.caption);
  const sectionBody = [figureTitle, bilingualText(figure.alt), figure.path].join("\n");
  const source = sourceText(subsection?.sources ?? section.sources);
  return {
    id: `figure:${project.slug}:${section.id}:${subsection?.id ?? "section"}:${figureIndex + 1}`,
    title: figureTitle,
    subtitle,
    summary,
    tags,
    sectionTitle,
    sectionBody,
    source,
    searchText: documentSearchText(title, subtitle, summary, tags, sectionTitle, sectionBody, source),
    projectSlug: project.slug,
    sectionId: section.id,
    subsectionId: subsection?.id ?? "",
    targetId: figureTargetId(section, figureIndex, subsection),
    nodeType: "figure",
    order: Number(project.index) * 100 + sectionIndex + 1 + 0.2 + figureIndex / 1000,
  };
}

function mediaTargetId(section: ArchiveSection, asset: MediaAsset): string {
  return `${section.id}--media--${asset.id}`;
}

function mediaDocument(project: ProjectArchive, section: ArchiveSection, asset: MediaAsset, sectionIndex: number, mediaIndex: number): ArchiveSearchDocument {
  const { title, subtitle, summary, tags } = projectFields(project);
  const sectionTitle = bilingualText(section.title);
  const mediaTitle = bilingualText(asset.title);
  const sectionBody = [mediaTitle, bilingualText(asset.caption), bilingualText(asset.alt)].join("\n");
  const source = sourceText([asset.source]);
  return {
    id: `media:${project.slug}:${section.id}:${asset.id}`,
    title: mediaTitle,
    subtitle,
    summary,
    tags,
    sectionTitle,
    sectionBody,
    source,
    searchText: documentSearchText(title, subtitle, summary, tags, sectionTitle, sectionBody, source),
    projectSlug: project.slug,
    sectionId: section.id,
    subsectionId: "",
    targetId: mediaTargetId(section, asset),
    nodeType: "media",
    order: Number(project.index) * 100 + sectionIndex + 1 + 0.3 + mediaIndex / 1000,
  };
}

function sectionDocuments(project: ProjectArchive, section: ArchiveSection, sectionIndex: number): ArchiveSearchDocument[] {
  const documents: ArchiveSearchDocument[] = [sectionDocument(project, section, sectionIndex)];
  section.subsections?.forEach((subsection, subsectionIndex) => {
    documents.push(subsectionDocument(project, section, subsection, sectionIndex, subsectionIndex));
    subsection.figures?.forEach((figure, figureIndex) => documents.push(figureDocument(project, section, figure, sectionIndex, figureIndex, subsection)));
  });
  section.figures?.forEach((figure, figureIndex) => documents.push(figureDocument(project, section, figure, sectionIndex, figureIndex)));
  section.media?.forEach((asset, mediaIndex) => documents.push(mediaDocument(project, section, asset, sectionIndex, mediaIndex)));
  return documents;
}

function documentList(projects: ProjectArchive[]): ArchiveSearchDocument[] {
  return projects.flatMap((project) => [
    projectDocument(project),
    ...project.sections.flatMap((section, sectionIndex) => sectionDocuments(project, section, sectionIndex)),
  ]);
}

export function createArchiveSearchIndex(projects: ProjectArchive[]): ArchiveSearchIndex {
  const documents = documentList(projects);
  const database = create<ArchiveSearchSchema>({ schema: archiveSearchSchema, language: "english" });
  insertMultiple(database, documents);

  return { database, documents };
}

function splitBilingual(value: string): Bilingual {
  const [zh, en] = value.split("\n");
  return { zh: zh ?? "", en: en ?? zh ?? "" };
}

function toHit(result: { id: string; score: number; document: ArchiveSearchDocument }): ArchiveSearchHit {
  const document = result.document;
  const sectionTitle = document.sectionId ? splitBilingual(document.sectionTitle) : undefined;
  const target = document.targetId || document.sectionId;
  return {
    id: result.id,
    href: `/projects/${document.projectSlug}${target ? `#${target}` : ""}`,
    kind: document.nodeType,
    projectSlug: document.projectSlug,
    sectionId: document.sectionId || undefined,
    subsectionId: document.subsectionId || undefined,
    title: splitBilingual(document.title),
    subtitle: splitBilingual(document.subtitle),
    summary: splitBilingual(document.summary),
    sectionTitle,
    source: splitBilingual(document.source),
    tags: document.tags,
    score: result.score,
  };
}

function resultHits(results: Results<ArchiveSearchDocument>): ArchiveSearchHit[] {
  return results.hits.map(toHit);
}

function fallbackHits(index: ArchiveSearchIndex, term: string, limit: number): ArchiveSearchHit[] {
  const normalizedTerm = term.toLocaleLowerCase();
  return index.documents
    .filter((document) => document.searchText.toLocaleLowerCase().includes(normalizedTerm))
    .slice(0, limit)
    .map((document) => toHit({ id: document.id, score: 0.01, document }));
}

export function searchArchive(index: ArchiveSearchIndex, query: string, limit = ARCHIVE_SEARCH_LIMIT): ArchiveSearchHit[] {
  const term = query.trim();
  if (!term) return [];

  const safeLimit = Math.min(Math.max(limit, 1), ARCHIVE_SEARCH_LIMIT);
  const results = search<ArchiveSearchDatabase, ArchiveSearchDocument>(index.database, {
    term,
    properties: ["title", "subtitle", "summary", "tags", "sectionTitle", "sectionBody", "source", "searchText"],
    limit: safeLimit,
    tolerance: 1,
    boost: { title: 2, sectionTitle: 1.6, tags: 1.4, subtitle: 1.15 },
  });

  const hits = resultHits(results as Results<ArchiveSearchDocument>);
  return hits.length > 0 ? hits : fallbackHits(index, term, safeLimit);
}

export function getArchiveSuggestions(index: ArchiveSearchIndex, limit = 6): ArchiveSearchHit[] {
  const safeLimit = Math.min(Math.max(limit, 1), ARCHIVE_SEARCH_LIMIT);
  return index.documents
    .slice()
    .sort((left, right) => left.order - right.order)
    .slice(0, safeLimit)
    .map((document) => toHit({ id: document.id, score: 0, document }));
}

export function getArchiveSourceLabel(hit: ArchiveSearchHit, locale: "zh" | "en"): string {
  return hit.source[locale] || hit.sectionTitle?.[locale] || (locale === "zh" ? "專案檔案" : "Project archive");
}
