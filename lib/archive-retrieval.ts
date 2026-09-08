import * as OpenCC from "opencc-js/core";
import * as OpenCCLocale from "opencc-js/preset";

import {
  archiveProjects,
  curriculumGroups,
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
  "复合问题先回答资料明确支持的部分，再清楚列出未收录的部分及其限制。",
  "资料写“尚无证据”“公开记录未确认”或“未收录”时，只能说“无法由公开资料确认”，不得推断成“未进行”“没有做过”或事实上的否定。室内实机联调不自动等于硬件在环，也不得自动断言它不是硬件在环；分类未说明就保留未确认。",
  "只回答用户实际询问的内容；资料缺口只指出与该问题直接相关的部分，不额外列举未询问的姓名、联系方式、业绩或经历。直接说明事实，避免重复的“根据资料”开场及多次重复同一限制。",
  "以纯文本短段落作答，必要时使用简单编号；不要使用 Markdown 标题、粗体星号、表格或代码围栏。保留资料引用标记。简单问题通常用二至四句话，复合问题可以适当展开。",
  "个人第一方分工陈述与独立核验必须分开表述；不得从实习经历推断业绩，不得把课程项目写成生产上线，不得把软件在环写成室外实飞或硬件在环，也不得仅凭学历评价学校质量。",
  "当资料类型是个人简介时，使用客观叙述，不要求网站主人使用第一人称；资料明确提供姓名时可以称呼该姓名，严禁把模型自身的身份或经历混入网站主人的资料。",
  "只有下方明确提供联络方式资料时，才可以回答电话或邮箱；否则不得提供、猜测或补全联络方式。",
].join("\n");

const IGNORED_QUERY_FRAGMENTS = new Set([
  "如何", "為什", "什麼", "哪些", "這裡", "這份", "具體", "各自", "準備",
  "the", "what", "why", "how", "does", "this", "about", "into", "from", "with", "is", "in", "to", "of", "on", "or", "an",
].map(normalizeText));

const RETRIEVAL_INTENTS = [
  { terms: ["高層決策", "高层决策", "high-level decision"], projectSlug: "uav-recognition-strike-control", targets: ["architecture"] },
  { terms: ["架構", "架构", "architecture"], projectSlug: "knowledge-atlas", targets: ["information-architecture", "content-model"] },
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

const PROJECT_ALIASES: Record<string, string[]> = {
  "uav-recognition-strike-control": ["無人機", "uav", "打擊", "strike", "飛行", "flight", "識別", "drone"],
  "image-management-system": ["圖片管理", "圖片系統", "image management", "image system", "圖片", "qr login", "掃碼登入", "spring boot", "docker"],
  "knowledge-atlas": ["knowledge atlas", "知識 atlas", "個人網站", "personal site", "向量資料庫", "vector database", "檢索資料"],
};

const OWNERSHIP_INTENT_TERMS = [
  "負責", "负责", "分工", "contribute", "contribution", "personally", "role", "supervisor", "provide", "provided",
  "responsible", "responsibility", "owner", "ownership", "誰完成", "谁完成", "誰負責", "谁负责", "由誰", "由谁", "提供者", "provider",
].map(normalizeText);

const RECRUITMENT_INTENT_TERMS = [
  "built", "build", "deliver", "delivered",
  "完成", "交付", "成果", "實作", "实现", "功能", "feature", "result", "outcome", "演示", "demo", "environment", "環境", "环境", "模擬", "模拟", "simulation",
  "實機", "实机", "hardware", "physical", "證據", "证据", "evidence", "依據", "依据", "限制", "limits", "boundary",
  "上線", "上线", "production", "營運", "运营", "效能", "性能", "performance", "驗收", "验收", "室外", "outdoor", "檢索", "检索", "retrieval", "向量", "vector",
].map(normalizeText);

const TECHNICAL_INTENT_TERMS = [
  "架構", "架构", "architecture", "路由", "routing", "看門狗", "看门狗", "watchdog", "急停", "emergency stop",
  "感知", "perception", "視覺伺服", "视觉伺服", "visual servo", "yoloe", "mavlink", "px4", "rflysim", "限幅", "fence",
].map(normalizeText);

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

type ProfileCandidate = CandidateBase & {
  kind: "profile";
  scope: "profile" | "curriculum";
};
type ContactCandidate = CandidateBase & { kind: "contact" };
type RetrievalCandidate = ArchiveCandidate | ProfileCandidate | ContactCandidate;
type ScoredCandidate = RetrievalCandidate & { score: number };
type ScoredArchiveCandidate = ArchiveCandidate & { score: number };

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

function projectSections(project: ProjectArchive): ArchiveSection[] {
  return [
    ...(project.overview ? [project.overview] : []),
    ...project.sections,
  ];
}

const ARCHIVE_CANDIDATES = archiveProjects.flatMap((project) => projectSections(project).flatMap((section) => [
  archiveCandidate(project, section),
  ...(section.subsections ?? []).map((subsection) => archiveCandidate(project, section, subsection)),
]));

const PROFILE_CANDIDATE: ProfileCandidate = {
  kind: "profile",
  scope: "profile",
  titleText: normalizeText(`${bilingualText(publicProfile.title)}\n${bilingualText(publicProfile.name)}`),
  tagText: normalizeText("profile about education background internship experience 專案方向 教育背景 公開經歷"),
  bodyText: normalizeText([
    bilingualText(publicProfile.name),
    bilingualText(publicProfile.intro),
    bilingualText(publicProfile.background),
    ...publicProfile.focusAreas.map(bilingualText),
    ...publicProfile.education.flatMap((item) => [item.period, bilingualText(item.school), bilingualText(item.detail)]),
    ...publicProfile.internships.flatMap((item) => [item.period, bilingualText(item.company), bilingualText(item.detail), bilingualText(item.note)]),
  ].join("\n")),
};

const CURRICULUM_CANDIDATE: ProfileCandidate = {
  kind: "profile",
  scope: "curriculum",
  titleText: normalizeText("本科培養脈絡 Undergraduate curriculum"),
  tagText: normalizeText("curriculum courses 培養方案 課程"),
  bodyText: normalizeText([
    ...curriculumGroups.flatMap((group) => [
      group.index,
      bilingualText(group.title),
      bilingualText(group.summary),
      ...group.courses.map(bilingualText),
      sourceText([group.source]),
    ]),
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

function textIncludesFragment(text: string, fragment: string): boolean {
  if (/^[a-z0-9]+$/.test(fragment)) {
    const escaped = fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`).test(text);
  }
  return text.includes(fragment);
}

function includesIntent(normalizedQuestion: string, terms: string[]): boolean {
  return terms.some((term) => normalizedQuestion.includes(term));
}

function hasExplicitContactIntent(normalizedQuestion: string): boolean {
  return includesIntent(normalizedQuestion, EXPLICIT_CONTACT_INTENT_TERMS);
}

function explicitProjectSlugs(normalizedQuestion: string): string[] {
  return Object.entries(PROJECT_ALIASES)
    .filter(([, aliases]) => aliases.some((alias) => normalizedQuestion.includes(normalizeText(alias))))
    .map(([slug]) => slug);
}

function hasIntent(normalizedQuestion: string, terms: string[]): boolean {
  return terms.some((term) => normalizedQuestion.includes(term));
}

function isOverview(candidate: RetrievalCandidate): candidate is ArchiveCandidate {
  return candidate.kind === "project" && candidate.section.id === "overview" && !candidate.subsection;
}

function technicalNodeText(candidate: ScoredArchiveCandidate): string {
  const node = candidate.subsection ?? candidate.section;
  return normalizeText([
    candidate.section.id,
    candidate.subsection?.id,
    bilingualText(candidate.section.title),
    bilingualText(node.title),
    bilingualText(node.body),
    ...(node.points ?? []).map(bilingualText),
  ].join("\n"));
}

function technicalTitleText(candidate: ScoredArchiveCandidate): string {
  const node = candidate.subsection ?? candidate.section;
  return normalizeText(`${candidate.section.id}\n${candidate.subsection?.id}\n${bilingualText(candidate.section.title)}\n${bilingualText(node.title)}`);
}

function hasTechnicalMaterial(normalizedQuestion: string, candidate: ScoredArchiveCandidate): boolean {
  const target = candidate.subsection?.id ?? candidate.section.id;
  const hasTargetedIntent = RETRIEVAL_INTENTS.some((intent) =>
    intent.projectSlug === candidate.project.slug
      && intent.targets.includes(target)
      && intent.terms.some((term) => normalizedQuestion.includes(term)));
  const hasTechnicalTerm = TECHNICAL_INTENT_TERMS
    .filter((term) => normalizedQuestion.includes(term))
    .some((term) => textIncludesFragment(technicalNodeText(candidate), term));
  return hasTargetedIntent || hasTechnicalTerm;
}

function intentBoost(normalizedQuestion: string, candidate: RetrievalCandidate): number {
  if (candidate.kind === "profile") {
    return candidate.scope === "profile" && includesIntent(normalizedQuestion, PROFILE_INTENT_TERMS) ? 64 : 0;
  }
  if (candidate.kind === "contact") return hasExplicitContactIntent(normalizedQuestion) ? 96 : 0;

  const target = candidate.subsection?.id ?? candidate.section.id;
  return RETRIEVAL_INTENTS.some((intent) =>
    intent.projectSlug === candidate.project.slug
    && intent.targets.some((candidateTarget) => candidateTarget === target)
    && intent.terms.some((term) => normalizedQuestion.includes(term))) ? 32 : 0;
}

function scoreCandidate(normalizedQuestion: string, fragments: string[], candidate: RetrievalCandidate): number {
  let lexicalScore = normalizedQuestion.length >= 2 && candidate.bodyText.includes(normalizedQuestion) ? 12 : 0;

  for (const fragment of fragments) {
    if (textIncludesFragment(candidate.titleText, fragment)) lexicalScore += fragment.length >= 3 ? 5 : 2;
    else if (textIncludesFragment(candidate.tagText, fragment)) lexicalScore += 4;
    else if (textIncludesFragment(candidate.bodyText, fragment)) lexicalScore += fragment.length >= 3 ? 2 : 1;
  }

  if (candidate.kind === "project" && isOverview(candidate)) {
    // Overview is the authoritative role/result/environment/evidence summary;
    // technical questions should continue to land on their precise chapters.
    lexicalScore += lexicalScore > 0 && hasIntent(normalizedQuestion, [...OWNERSHIP_INTENT_TERMS, ...RECRUITMENT_INTENT_TERMS]) ? 22 : 0;
  }

  // An intent label is only a ranking hint. It must not make an otherwise
  // unmatched project chapter eligible on its own.
  if (candidate.kind === "project" && lexicalScore === 0) return 0;
  return lexicalScore + intentBoost(normalizedQuestion, candidate);
}

function sourceFor(candidate: ScoredCandidate): ChatSource {
  if (candidate.kind === "profile") {
    const isCurriculum = candidate.scope === "curriculum";
    return {
      title: isCurriculum
        ? { zh: "本科培養脈絡", en: "Undergraduate curriculum" }
        : publicProfile.title,
      detail: {
        zh: isCurriculum ? "About · 本科培養脈絡與課程" : "About · 教育背景、專案方向與公開經歷",
        en: isCurriculum ? "About · Undergraduate curriculum and courses" : "About · Education, project directions, and public experience",
      },
      type: "archive",
      href: isCurriculum ? "/about#curriculum" : "/about#profile",
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
    `姓名：${publicProfile.name[locale]}`,
    "回答口吻：客观叙述；不得将模型自身身份或经历混入资料",
    `简介：${publicProfile.intro[locale]}`,
    `背景：${publicProfile.background[locale]}`,
    `关注方向：${publicProfile.focusAreas.map((area) => area[locale]).join("；")}`,
    `教育背景：${education}`,
    `公开经历：${internships}`,
    "引用链接：/about#profile",
  ].join("\n");
}

function curriculumMaterial(locale: AskLocale): string {
  const curriculum = curriculumGroups
    .map((group) => `${group.index}｜${group.title[locale]}｜${group.summary[locale]}｜${group.courses.map((course) => course[locale]).join("、")}`)
    .join("\n");
  return [
    "资料类型：本科培养方案",
    `培养方案：${curriculum}`,
    "引用链接：/about#curriculum",
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
  if (candidate.kind === "profile") {
    return candidate.scope === "curriculum" ? curriculumMaterial(locale) : profileMaterial(locale);
  }
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
    if (candidate.scope === "curriculum") {
      const composeCurriculum = (locale: AskLocale) => curriculumGroups
        .map((group) => `${group.title[locale]}：${group.courses.map((course) => course[locale]).join("、")}`)
        .join("\n");
      return { zh: composeCurriculum("zh"), en: composeCurriculum("en") };
    }
    const compose = (locale: AskLocale) => {
      return [
        publicProfile.name[locale],
        publicProfile.intro[locale],
        publicProfile.background[locale],
        publicProfile.internships.map((item) => `${item.company[locale]} · ${item.detail[locale]}`).join("\n"),
      ].filter(Boolean).join("\n\n");
    };
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
  const projects = explicitProjectSlugs(normalizedQuestion);
  const technicalIntent = hasIntent(normalizedQuestion, TECHNICAL_INTENT_TERMS);
  const ownershipIntent = hasIntent(normalizedQuestion, OWNERSHIP_INTENT_TERMS);
  const candidates: RetrievalCandidate[] = [
    ...ARCHIVE_CANDIDATES,
    PROFILE_CANDIDATE,
    CURRICULUM_CANDIDATE,
    ...(contactIntent ? [CONTACT_CANDIDATE] : []),
  ];
  const scoredAll = candidates
    .map((candidate): ScoredCandidate => ({ ...candidate, score: scoreCandidate(normalizedQuestion, fragments, candidate) }));
  const scored = scoredAll
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score);
  const minimumScore = Math.max(4, (scored[0]?.score ?? 0) * 0.55);
  const eligible = scored
    .filter((candidate) => candidate.score >= minimumScore)
    // A named project is a stronger scope signal than shared technology words
    // (for example, Docker occurs in more than one archive).
    .filter((candidate) => projects.length === 0
      || (candidate.kind === "project" && projects.includes(candidate.project.slug))
      || (candidate.kind === "contact" && contactIntent));

  const maxSources = projects.length > 1 ? 4 : 2;
  const selected: ScoredCandidate[] = [];
  const add = (candidate: ScoredCandidate | undefined) => {
    if (!candidate || selected.some((item) => item.kind === candidate.kind && sourceFor(item).href === sourceFor(candidate).href)) return;
    selected.push(candidate);
  };

  const projectCandidates = (slug: string): ScoredArchiveCandidate[] => scoredAll
    .filter((candidate) => candidate.score > 0 && candidate.kind === "project" && candidate.project.slug === slug)
    .map((candidate) => candidate as ScoredArchiveCandidate)
    .sort((left, right) => right.score - left.score);
  const bestTechnicalCandidate = (slug: string) => {
    const matchedTargets = RETRIEVAL_INTENTS
      .filter((intent) => intent.projectSlug === slug && intent.terms.some((term) => normalizedQuestion.includes(term)))
      .flatMap((intent) => intent.targets);
    return projectCandidates(slug)
      .filter((candidate) => (candidate.section.id !== "overview" || Boolean(candidate.subsection))
        && hasTechnicalMaterial(normalizedQuestion, candidate))
      .sort((left, right) => {
        const leftRank = matchedTargets.indexOf(left.subsection?.id ?? left.section.id);
        const rightRank = matchedTargets.indexOf(right.subsection?.id ?? right.section.id);
        const leftHasTarget = leftRank >= 0;
        const rightHasTarget = rightRank >= 0;
        if (leftHasTarget !== rightHasTarget) return leftHasTarget ? -1 : 1;
        if (leftHasTarget && leftRank !== rightRank) return leftRank - rightRank;
        const leftExactTitle = TECHNICAL_INTENT_TERMS.some((term) => normalizedQuestion.includes(term) && textIncludesFragment(technicalTitleText(left), term));
        const rightExactTitle = TECHNICAL_INTENT_TERMS.some((term) => normalizedQuestion.includes(term) && textIncludesFragment(technicalTitleText(right), term));
        if (leftExactTitle !== rightExactTitle) return leftExactTitle ? -1 : 1;
        return right.score - left.score;
      })[0];
  };
  const bestProjectCandidate = (slug: string) => projectCandidates(slug)[0];

  // Explicitly named projects each get their best matching source before global
  // fill. This keeps a cross-project comparison from being swallowed by one
  // project's shared vocabulary (for example, "architecture").
  if (projects.length > 0 && (!technicalIntent || ownershipIntent)) {
    for (const slug of projects) {
      if (ownershipIntent) {
        add(projectCandidates(slug).find((candidate) => isOverview(candidate)));
      } else {
        add(bestProjectCandidate(slug));
      }
    }
  }

  // A mixed ownership + technical question needs both the authoritative role
  // summary and the precise technical chapter for each named project.
  if (projects.length > 0 && ownershipIntent && technicalIntent) {
    for (const slug of projects) add(bestTechnicalCandidate(slug));
  } else if (projects.length > 0 && technicalIntent) {
    for (const slug of projects) add(bestTechnicalCandidate(slug));
  }

  for (const candidate of eligible) {
    if (selected.length >= maxSources) break;
    if (technicalIntent && candidate.kind === "project" && !isOverview(candidate)
      && !hasTechnicalMaterial(normalizedQuestion, candidate)) continue;
    if (technicalIntent && isOverview(candidate)) continue;
    // Keep exact technical anchors ahead of a broad overview.
    add(candidate);
  }

  const ranked = selected.slice(0, maxSources);
  const sources = ranked.map(sourceFor);
  const material = ranked.length > 0
    ? ranked.map((candidate, index) => `资料 ${index + 1}\n${materialFor(candidate, locale)}`).join("\n\n")
    : "资料中没有与问题匹配的公开内容。";

  return {
    sources,
    prompt: buildArchivePrompt(material, locale, ranked.length),
    fallbackText: ranked[0] ? fallbackFor(ranked[0]) : undefined,
  };
}

function inferReferenceCount(material: string): number {
  const references = Array.from(material.matchAll(/(?:資料|资料)\s+(\d+)/g), (match) => Number(match[1]));
  return references.length > 0 ? Math.max(...references) : 1;
}

export function buildArchivePrompt(material: string, locale: AskLocale = "zh", maxReferences?: number): string {
  const responseLanguage = locale === "zh"
    ? "请使用繁体中文回答，保持简洁、平实。"
    : "Answer in English using concise, plain language.";
  const referenceCount = Math.max(1, maxReferences ?? inferReferenceCount(material));
  const citationExamples = Array.from({ length: referenceCount }, (_, index) => `[资料 ${index + 1}]`).join(" 或 ");
  return `${SYSTEM_PROMPT_RULES}\n${responseLanguage}\n引用相关内容时，在句末使用 ${citationExamples}。先回答问题中资料支持的部分，再明确指出档案未收录的部分及其边界。区分个人第一方分工陈述与独立核验；不得从实习经历推断业绩，不得把课程项目写成生产上线，不得把软件在环写成室外实飞或硬件在环，也不得仅凭学历评价学校质量。\n\n下方提供的资料：\n${material}`;
}
