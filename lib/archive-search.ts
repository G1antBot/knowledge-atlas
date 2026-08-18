import { create, insertMultiple, search, type Results } from "@orama/orama";
import type { Bilingual, ProjectArchive, SourceRef } from "@/data/content";

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
  nodeType: "string",
  order: "number",
};

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
  nodeType: "project" | "section";
  order: number;
};

export type ArchiveSearchHit = {
  id: string;
  href: string;
  kind: "project" | "section";
  projectSlug: string;
  sectionId?: string;
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

function projectDocument(project: ProjectArchive): ArchiveSearchDocument {
  const title = bilingualText(project.title);
  const subtitle = bilingualText(project.subtitle);
  const summary = bilingualText(project.summary);
  const source = sourceText(project.sources);
  return {
    id: `project:${project.slug}`,
    title,
    subtitle,
    summary,
    tags: project.tags,
    sectionTitle: "",
    sectionBody: "",
    source,
    searchText: documentSearchText(title, subtitle, summary, project.tags, "", "", source),
    projectSlug: project.slug,
    sectionId: "",
    nodeType: "project",
    order: Number(project.index) * 100,
  };
}

function sectionDocument(project: ProjectArchive, sectionIndex: number): ArchiveSearchDocument {
  const section = project.sections[sectionIndex];
  const points = section.points?.flatMap((point) => [point.zh, point.en]) ?? [];
  const title = bilingualText(project.title);
  const subtitle = bilingualText(project.subtitle);
  const summary = bilingualText(project.summary);
  const sectionTitle = bilingualText(section.title);
  const sectionBody = [bilingualText(section.body), ...points].join("\n");
  const source = sourceText(section.sources);

  return {
    id: `section:${project.slug}:${section.id}`,
    title,
    subtitle,
    summary,
    tags: project.tags,
    sectionTitle,
    sectionBody,
    source,
    searchText: documentSearchText(title, subtitle, summary, project.tags, sectionTitle, sectionBody, source),
    projectSlug: project.slug,
    sectionId: section.id,
    nodeType: "section",
    order: Number(project.index) * 100 + sectionIndex + 1,
  };
}

function documentList(projects: ProjectArchive[]): ArchiveSearchDocument[] {
  return projects.flatMap((project) => [
    projectDocument(project),
    ...project.sections.map((_, sectionIndex) => sectionDocument(project, sectionIndex)),
  ]);
}

export function createArchiveSearchIndex(projects: ProjectArchive[]): ArchiveSearchIndex {
  const documents = documentList(projects);
  const database = create<ArchiveSearchSchema>({ schema: archiveSearchSchema, language: "english" });
  insertMultiple(database, documents);

  return { database, documents };
}

function toHit(result: { id: string; score: number; document: ArchiveSearchDocument }): ArchiveSearchHit {
  const document = result.document;
  const [titleZh, titleEn] = document.title.split("\n");
  const [subtitleZh, subtitleEn] = document.subtitle.split("\n");
  const [summaryZh, summaryEn] = document.summary.split("\n");
  const [sectionTitleZh, sectionTitleEn] = document.sectionTitle.split("\n");
  const [sourceZh, sourceEn] = document.source.split("\n");

  return {
    id: result.id,
    href: document.sectionId ? `/projects/${document.projectSlug}#${document.sectionId}` : `/projects/${document.projectSlug}`,
    kind: document.nodeType,
    projectSlug: document.projectSlug,
    sectionId: document.sectionId || undefined,
    title: { zh: titleZh ?? "", en: titleEn ?? titleZh ?? "" },
    subtitle: { zh: subtitleZh ?? "", en: subtitleEn ?? subtitleZh ?? "" },
    summary: { zh: summaryZh ?? "", en: summaryEn ?? summaryZh ?? "" },
    sectionTitle: document.sectionId ? { zh: sectionTitleZh ?? "", en: sectionTitleEn ?? sectionTitleZh ?? "" } : undefined,
    source: { zh: sourceZh ?? "", en: sourceEn ?? sourceZh ?? "" },
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
  return hit.source[locale] || hit.sectionTitle?.[locale] || (locale === "zh" ? "项目档案" : "Project archive");
}
