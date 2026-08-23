import {
  archiveProjects,
  type ArchiveSection,
  type ArchiveSubsection,
  type Bilingual,
  type ChatSource,
  type ProjectArchive,
  type SourceRef,
} from "@/data/content";

import type { AskLocale } from "@/lib/ask-protocol";

const SYSTEM_PROMPT_RULES = [
  "只根据下方提供的资料回答问题。",
  "回答必须标注引用了哪一篇档案。",
  "如果资料中没有相关内容，必须明确说明“档案中未收录”，不得编造。",
].join("\n");

const IGNORED_QUERY_FRAGMENTS = new Set([
  "如何", "為什", "什么", "什麼", "哪些", "這裡", "这里", "這份", "这份", "具體", "具体", "各自", "準備", "准备",
  "the", "what", "why", "how", "does", "this", "about", "into", "from", "with", "is", "in", "to", "of", "on", "or", "an",
]);

const RETRIEVAL_INTENTS = [
  { terms: ["高層決策", "高层决策", "high-level decision"], projectSlug: "uav-recognition-strike-control", targets: ["architecture"] },
  { terms: ["混合路由", "hybrid routing"], projectSlug: "uav-recognition-strike-control", targets: ["hybrid-routing", "architecture"] },
  { terms: ["看門狗", "看门狗", "watchdog", "急停", "emergency stop"], projectSlug: "uav-recognition-strike-control", targets: ["watchdog", "architecture"] },
  { terms: ["安全防護", "安全防护", "safety boundary", "safety guard"], projectSlug: "uav-recognition-strike-control", targets: ["safety-guards", "safety-ablation"] },
  { terms: ["yoloe", "感知結果", "感知结果", "observation"], projectSlug: "uav-recognition-strike-control", targets: ["perception", "autonomous-loop"] },
  { terms: ["視覺伺服", "视觉伺服", "visual servo"], projectSlug: "uav-recognition-strike-control", targets: ["visual-servo-loop", "autonomous-loop"] },
  { terms: ["strike", "終端穿越", "终端穿越", "terminal traverse"], projectSlug: "uav-recognition-strike-control", targets: ["terminal-precision", "visual-servo-loop"] },
  { terms: ["限制與下一步", "限制与下一步", "archive's limits"], projectSlug: "uav-recognition-strike-control", targets: ["limitations", "future-outlook"] },
  { terms: ["掃碼登入", "扫码登录", "qr login"], projectSlug: "image-management-system", targets: ["authentication"] },
  { terms: ["四人團隊", "四人团队", "four-person team"], projectSlug: "image-management-system", targets: ["plain-summary"] },
  { terms: ["組織專案", "组织项目", "organize projects"], projectSlug: "knowledge-atlas", targets: ["content-model", "information-architecture", "retrieval"] },
  { terms: ["下一階段", "下一阶段", "next stage"], projectSlug: "knowledge-atlas", targets: ["delivery-state", "limits"] },
] as const;

type ArchiveCandidate = {
  project: ProjectArchive;
  section: ArchiveSection;
  subsection?: ArchiveSubsection;
  titleText: string;
  tagText: string;
  bodyText: string;
};

type ScoredArchiveCandidate = ArchiveCandidate & {
  score: number;
};

export type ArchiveRetrievalResult = {
  sources: ChatSource[];
  prompt: string;
  fallbackText?: Bilingual;
};

function bilingualText(value: Bilingual): string {
  return `${value.zh}\n${value.en}`;
}

function sourceText(sources: SourceRef[] | undefined): string {
  return (sources ?? [])
    .map((source) => [source.label.zh, source.label.en, source.note?.zh, source.note?.en].filter(Boolean).join("\n"))
    .join("\n");
}

function candidateText(project: ProjectArchive, section: ArchiveSection, subsection?: ArchiveSubsection): string {
  const node = subsection ?? section;
  const points = node.points?.flatMap((point) => [point.zh, point.en]) ?? [];
  return [
    bilingualText(project.title),
    bilingualText(project.subtitle),
    bilingualText(project.summary),
    project.tags.join("\n"),
    bilingualText(section.title),
    bilingualText(node.title),
    bilingualText(node.body),
    ...points,
    sourceText(section.sources),
    sourceText(subsection?.sources),
  ].join("\n").toLocaleLowerCase();
}

function archiveCandidate(project: ProjectArchive, section: ArchiveSection, subsection?: ArchiveSubsection): ArchiveCandidate {
  const node = subsection ?? section;
  return {
    project,
    section,
    subsection,
    titleText: `${bilingualText(project.title)}\n${bilingualText(project.subtitle)}\n${bilingualText(node.title)}`.toLocaleLowerCase(),
    tagText: project.tags.join("\n").toLocaleLowerCase(),
    bodyText: candidateText(project, section, subsection),
  };
}

const ARCHIVE_CANDIDATES = archiveProjects.flatMap((project) => project.sections.flatMap((section) => [
  archiveCandidate(project, section),
  ...(section.subsections ?? []).map((subsection) => archiveCandidate(project, section, subsection)),
]));

function queryFragments(normalized: string): string[] {
  const fragments = new Set<string>();

  for (const word of normalized.match(/[a-z0-9]+/g) ?? []) {
    if (word.length >= 2 && !IGNORED_QUERY_FRAGMENTS.has(word)) fragments.add(word);
  }

  for (const run of normalized.match(/[\u3400-\u9fff]+/g) ?? []) {
    const characters = Array.from(run);
    if (characters.length === 1) {
      fragments.add(characters[0]);
      continue;
    }
    for (let size = 2; size <= Math.min(4, characters.length); size += 1) {
      for (let start = 0; start <= characters.length - size; start += 1) {
        const fragment = characters.slice(start, start + size).join("");
        if (!IGNORED_QUERY_FRAGMENTS.has(fragment)) fragments.add(fragment);
      }
    }
  }

  return Array.from(fragments);
}

function intentBoost(normalizedQuestion: string, candidate: ArchiveCandidate): number {
  const target = candidate.subsection?.id ?? candidate.section.id;
  return RETRIEVAL_INTENTS.some((intent) =>
    intent.projectSlug === candidate.project.slug
    && intent.targets.some((candidate) => candidate === target)
    && intent.terms.some((term) => normalizedQuestion.includes(term))) ? 32 : 0;
}

function scoreCandidate(normalizedQuestion: string, fragments: string[], candidate: ArchiveCandidate): number {
  if (fragments.length === 0) return 0;

  let score = normalizedQuestion.length >= 2 && candidate.bodyText.includes(normalizedQuestion) ? 12 : 0;

  for (const fragment of fragments) {
    if (candidate.titleText.includes(fragment)) score += fragment.length >= 3 ? 5 : 2;
    else if (candidate.tagText.includes(fragment)) score += 4;
    else if (candidate.bodyText.includes(fragment)) score += fragment.length >= 3 ? 2 : 1;
  }

  return score + intentBoost(normalizedQuestion, candidate);
}

function sourceFor(candidate: ScoredArchiveCandidate): ChatSource {
  const title = candidate.subsection?.title ?? candidate.section.title;
  const sectionLabel = candidate.subsection
    ? `${bilingualText(candidate.section.title)}\n${bilingualText(candidate.subsection.title)}`
    : bilingualText(candidate.section.title);
  const target = candidate.subsection?.id ?? candidate.section.id;

  return {
    title,
    detail: {
      zh: `${candidate.project.title.zh} · ${sectionLabel.split("\n")[0]}`,
      en: `${candidate.project.title.en} · ${sectionLabel.split("\n")[1] ?? sectionLabel.split("\n")[0]}`,
    },
    type: "project",
    href: `/projects/${candidate.project.slug}#${target}`,
  };
}

function materialFor(candidate: ScoredArchiveCandidate, locale: AskLocale): string {
  const node = candidate.subsection ?? candidate.section;
  const points = node.points?.map((point) => point[locale]).join("\n") ?? "";
  const sources = (candidate.subsection?.sources ?? candidate.section.sources)
    .map((source) => source.label[locale])
    .join("；");

  return [
    `档案：${candidate.project.title[locale]}`,
    `章节：${candidate.section.title[locale]}`,
    candidate.subsection ? `子章节：${candidate.subsection.title[locale]}` : "",
    `正文：${node.body[locale]}`,
    points ? `要点：${points}` : "",
    sources ? `来源：${sources}` : "",
    `引用链接：/projects/${candidate.project.slug}#${candidate.subsection?.id ?? candidate.section.id}`,
  ].filter(Boolean).join("\n");
}

function fallbackFor(candidate: ScoredArchiveCandidate): Bilingual {
  const node = candidate.subsection ?? candidate.section;
  const compose = (locale: AskLocale) => {
    const points = node.points?.slice(0, 3).map((point) => `• ${point[locale]}`).join("\n");
    return [node.body[locale], points].filter(Boolean).join("\n\n");
  };
  return { zh: compose("zh"), en: compose("en") };
}

export function retrieveArchive(question: string, locale: AskLocale = "zh"): ArchiveRetrievalResult {
  const normalizedQuestion = question.normalize("NFKC").trim().toLocaleLowerCase();
  const fragments = queryFragments(normalizedQuestion);
  const scored = ARCHIVE_CANDIDATES
    .map((candidate): ScoredArchiveCandidate => ({ ...candidate, score: scoreCandidate(normalizedQuestion, fragments, candidate) }))
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score);
  const minimumScore = Math.max(4, (scored[0]?.score ?? 0) * 0.55);
  const ranked = scored
    .filter((candidate) => candidate.score >= minimumScore)
    .slice(0, 2);
  const sources = ranked.map(sourceFor);
  const material = ranked.length > 0
    ? ranked.map((candidate, index) => `资料 ${index + 1}\n${materialFor(candidate, locale)}`).join("\n\n")
    : "资料中没有与问题匹配的公开档案章节。";

  return {
    sources,
    prompt: buildArchivePrompt(material, locale),
    fallbackText: ranked[0] ? fallbackFor(ranked[0]) : undefined,
  };
}

export function buildArchivePrompt(material: string, locale: AskLocale = "zh"): string {
  const responseLanguage = locale === "zh"
    ? "请使用繁体中文回答，保持简洁、平实。"
    : "Answer in English using concise, plain language.";
  return `${SYSTEM_PROMPT_RULES}\n${responseLanguage}\n引用相关内容时，在句末使用 [资料 1] 或 [资料 2]。\n\n下方提供的资料：\n${material}`;
}
