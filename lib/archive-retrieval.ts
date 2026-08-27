import * as OpenCC from "opencc-js/core";
import * as OpenCCLocale from "opencc-js/preset";

import {
  archiveProjects,
  publicContact,
  publicProfile,
  type ArchiveSection,
  type ArchiveSubsection,
  type Bilingual,
  type ChatSource,
  type ProjectArchive,
  type SourceRef,
} from "@/data/content";
import type { AskLocale } from "@/lib/ask-protocol";

const toTraditional = OpenCC.ConverterFactory(OpenCCLocale.from.cn, OpenCCLocale.to.tw);

function normalizeText(value: string): string {
  return toTraditional(value.normalize("NFKC").trim().toLocaleLowerCase());
}

const SYSTEM_PROMPT_RULES = [
  "只根据下方提供的资料回答问题。",
  "回答必须标注引用了哪一项公开资料。",
  "如果资料中没有相关内容，必须明确说明“档案中未收录”，不得编造。",
  "当资料类型是个人简介时，以网站主人第一人称介绍，不要把模型自身的身份或经历写成网站主人的资料。",
  "只有下方明确提供联络方式资料时，才可以回答电话或邮箱；否则不得提供、猜测或补全联络方式。",
].join("\n");

const IGNORED_QUERY_FRAGMENTS = new Set([
  "如何", "為什", "什麼", "哪些", "這裡", "這份", "具體", "各自", "準備",
  "the", "what", "why", "how", "does", "this", "about", "into", "from", "with", "is", "in", "to", "of", "on", "or", "an",
].map(normalizeText));

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
].map((intent) => ({ ...intent, terms: intent.terms.map(normalizeText) }));

const PROFILE_INTENT_TERMS = [
  "簡單介紹一下你自己",
  "介绍一下你自己",
  "介紹你自己",
  "自我介紹",
  "自我介绍",
  "你是誰",
  "你是谁",
  "你的背景",
  "個人背景",
  "个人背景",
  "個人資料",
  "个人资料",
  "教育背景",
  "教育經歷",
  "教育经历",
  "實習經歷",
  "实习经历",
  "about you",
  "introduce yourself",
  "who are you",
  "tell me about yourself",
  "your background",
].map(normalizeText);

const EXPLICIT_CONTACT_INTENT_TERMS = [
  "聯絡方式",
  "联系方式",
  "聯繫方式",
  "联系方法",
  "如何聯絡",
  "怎么联系",
  "怎麼聯絡",
  "聯絡你",
  "聯繫你",
  "你的電話",
  "你的手机",
  "你的郵箱",
  "你的邮箱",
  "你的電子郵件",
  "聯絡電話",
  "电话号码",
  "手機號碼",
  "邮箱地址",
  "your phone",
  "your mobile",
  "your email",
  "phone number",
  "mobile number",
  "email address",
  "contact you",
  "reach you",
  "how can i contact",
  "how do i contact",
].map(normalizeText);

type CandidateBase = {
  kind: "project" | "profile" | "contact";
  titleText: string;
  tagText: string;
  bodyText: string;
};

type ArchiveCandidate = CandidateBase & {
  kind: "project";
  project: ProjectArchive;
  section: ArchiveSection;
  subsection?: ArchiveSubsection;
};

type ProfileCandidate = CandidateBase & { kind: "profile" };
type ContactCandidate = CandidateBase & { kind: "contact" };
type RetrievalCandidate = ArchiveCandidate | ProfileCandidate | ContactCandidate;
type ScoredCandidate = RetrievalCandidate & { score: number };

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
  return normalizeText([
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
  ].join("\n"));
}

function archiveCandidate(project: ProjectArchive, section: ArchiveSection, subsection?: ArchiveSubsection): ArchiveCandidate {
  const node = subsection ?? section;
  return {
    kind: "project",
    project,
    section,
    subsection,
    titleText: normalizeText(`${bilingualText(project.title)}\n${bilingualText(project.subtitle)}\n${bilingualText(node.title)}`),
    tagText: normalizeText(project.tags.join("\n")),
    bodyText: candidateText(project, section, subsection),
  };
}

const ARCHIVE_CANDIDATES = archiveProjects.flatMap((project) => project.sections.flatMap((section) => [
  archiveCandidate(project, section),
  ...(section.subsections ?? []).map((subsection) => archiveCandidate(project, section, subsection)),
]));

const PROFILE_CANDIDATE: ProfileCandidate = {
  kind: "profile",
  titleText: normalizeText(bilingualText(publicProfile.title)),
  tagText: normalizeText("profile about education background internship experience 專案方向 教育背景 公開經歷"),
  bodyText: normalizeText([
    bilingualText(publicProfile.intro),
    bilingualText(publicProfile.background),
    ...publicProfile.focusAreas.map(bilingualText),
    ...publicProfile.education.flatMap((item) => [item.period, bilingualText(item.school), bilingualText(item.detail)]),
    ...publicProfile.internships.flatMap((item) => [item.period, bilingualText(item.company), bilingualText(item.detail), bilingualText(item.note)]),
  ].join("\n")),
};

const CONTACT_CANDIDATE: ContactCandidate = {
  kind: "contact",
  titleText: normalizeText(bilingualText(publicContact.title)),
  tagText: normalizeText("contact phone telephone email 聯絡方式 電話 郵箱"),
  bodyText: normalizeText([
    bilingualText(publicContact.phone.label),
    publicContact.phone.value,
    bilingualText(publicContact.email.label),
    publicContact.email.value,
  ].join("\n")),
};

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

function includesIntent(normalizedQuestion: string, terms: string[]): boolean {
  return terms.some((term) => normalizedQuestion.includes(term));
}

function hasExplicitContactIntent(normalizedQuestion: string): boolean {
  return includesIntent(normalizedQuestion, EXPLICIT_CONTACT_INTENT_TERMS);
}

function intentBoost(normalizedQuestion: string, candidate: RetrievalCandidate): number {
  if (candidate.kind === "profile") return includesIntent(normalizedQuestion, PROFILE_INTENT_TERMS) ? 64 : 0;
  if (candidate.kind === "contact") return hasExplicitContactIntent(normalizedQuestion) ? 96 : 0;

  const target = candidate.subsection?.id ?? candidate.section.id;
  return RETRIEVAL_INTENTS.some((intent) =>
    intent.projectSlug === candidate.project.slug
    && intent.targets.some((candidateTarget) => candidateTarget === target)
    && intent.terms.some((term) => normalizedQuestion.includes(term))) ? 32 : 0;
}

function scoreCandidate(normalizedQuestion: string, fragments: string[], candidate: RetrievalCandidate): number {
  let score = normalizedQuestion.length >= 2 && candidate.bodyText.includes(normalizedQuestion) ? 12 : 0;

  for (const fragment of fragments) {
    if (candidate.titleText.includes(fragment)) score += fragment.length >= 3 ? 5 : 2;
    else if (candidate.tagText.includes(fragment)) score += 4;
    else if (candidate.bodyText.includes(fragment)) score += fragment.length >= 3 ? 2 : 1;
  }

  return score + intentBoost(normalizedQuestion, candidate);
}

function sourceFor(candidate: ScoredCandidate): ChatSource {
  if (candidate.kind === "profile") {
    return {
      title: publicProfile.title,
      detail: {
        zh: "About · 教育背景、專案方向與公開經歷",
        en: "About · Education, project directions, and public experience",
      },
      type: "archive",
      href: "/about#profile",
    };
  }

  if (candidate.kind === "contact") {
    return {
      title: publicContact.title,
      detail: { zh: "About · 公開聯絡方式", en: "About · Public contact details" },
      type: "archive",
      href: "/about#contact",
    };
  }

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

function profileMaterial(locale: AskLocale): string {
  const education = publicProfile.education
    .map((item) => `${item.period}｜${item.school[locale]}｜${item.detail[locale]}`)
    .join("\n");
  const internships = publicProfile.internships
    .map((item) => `${item.period}｜${item.company[locale]}｜${item.detail[locale]}｜${item.note[locale]}`)
    .join("\n");
  return [
    "资料类型：个人简介",
    "回答身份：网站主人第一人称",
    `简介：${publicProfile.intro[locale]}`,
    `背景：${publicProfile.background[locale]}`,
    `关注方向：${publicProfile.focusAreas.map((area) => area[locale]).join("；")}`,
    `教育背景：${education}`,
    `公开经历：${internships}`,
    "引用链接：/about#profile",
  ].join("\n");
}

function contactMaterial(locale: AskLocale): string {
  return [
    "资料类型：联络方式",
    `${publicContact.phone.label[locale]}：${publicContact.phone.value}`,
    `${publicContact.email.label[locale]}：${publicContact.email.value}`,
    "引用链接：/about#contact",
  ].join("\n");
}

function materialFor(candidate: ScoredCandidate, locale: AskLocale): string {
  if (candidate.kind === "profile") return profileMaterial(locale);
  if (candidate.kind === "contact") return contactMaterial(locale);

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

function fallbackFor(candidate: ScoredCandidate): Bilingual {
  if (candidate.kind === "profile") {
    const compose = (locale: AskLocale) => [
      publicProfile.intro[locale],
      publicProfile.background[locale],
      publicProfile.internships.map((item) => `${item.company[locale]} · ${item.detail[locale]}`).join("\n"),
    ].filter(Boolean).join("\n\n");
    return { zh: compose("zh"), en: compose("en") };
  }

  if (candidate.kind === "contact") {
    const compose = (locale: AskLocale) => [
      `${publicContact.phone.label[locale]}：${publicContact.phone.value}`,
      `${publicContact.email.label[locale]}：${publicContact.email.value}`,
    ].join("\n");
    return { zh: compose("zh"), en: compose("en") };
  }

  const node = candidate.subsection ?? candidate.section;
  const compose = (locale: AskLocale) => {
    const points = node.points?.slice(0, 3).map((point) => `• ${point[locale]}`).join("\n");
    return [node.body[locale], points].filter(Boolean).join("\n\n");
  };
  return { zh: compose("zh"), en: compose("en") };
}

export function retrieveArchive(question: string, locale: AskLocale = "zh"): ArchiveRetrievalResult {
  const normalizedQuestion = normalizeText(question);
  const fragments = queryFragments(normalizedQuestion);
  const contactIntent = hasExplicitContactIntent(normalizedQuestion);
  const candidates: RetrievalCandidate[] = [
    ...ARCHIVE_CANDIDATES,
    PROFILE_CANDIDATE,
    ...(contactIntent ? [CONTACT_CANDIDATE] : []),
  ];
  const scored = candidates
    .map((candidate): ScoredCandidate => ({ ...candidate, score: scoreCandidate(normalizedQuestion, fragments, candidate) }))
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score);
  const minimumScore = Math.max(4, (scored[0]?.score ?? 0) * 0.55);
  const ranked = scored
    .filter((candidate) => candidate.score >= minimumScore)
    .slice(0, 2);
  const sources = ranked.map(sourceFor);
  const material = ranked.length > 0
    ? ranked.map((candidate, index) => `资料 ${index + 1}\n${materialFor(candidate, locale)}`).join("\n\n")
    : "资料中没有与问题匹配的公开内容。";

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
