"use client";

import { archiveProjects, topicIndex } from "@/data/content";
import { AskInterface } from "@/components/ask-interface";
import { ArchiveIndexMotion } from "@/components/archive-index-motion";
import { useLocale } from "@/components/locale-context";
import { t } from "@/lib/i18n";
import { Eyebrow, SectionHeading, SourceTag } from "@/components/ui";

export default function HomePage() {
  const { locale } = useLocale();
  const zh = locale === "zh";

  return <div className="page-frame swiss-home">
    <section className="swiss-hero" aria-labelledby="home-title">
      <div className="swiss-hero-meta"><Eyebrow>Personal knowledge system / Index 00</Eyebrow><span className="coord">CS · UAV · AI / 2026</span></div>
      <div className="swiss-hero-grid">
        <div className="swiss-hero-number">00</div>
        <div><h1 id="home-title">KNOWLEDGE<br /><span>ARCHIVE</span></h1><p className="swiss-hero-cn">{zh ? "個人知識系統" : "Personal knowledge system"}</p></div>
        <div className="swiss-hero-note"><p>{zh ? "這裡整理我做過的專案、讀過的論文與實驗記錄。可以先閱讀檔案，也可以直接提出問題。" : "Projects, thesis material, and experiment records are the base units. Browse the archive first, then enter details through source-aware questions."}</p><SourceTag>{zh ? "目前主檔案：無人機控制演算法" : "Primary record: UAV control algorithm"}</SourceTag></div>
      </div>
    </section>

    <section className="section archive-first home-reveal home-reveal-delay-1" aria-labelledby="archive-heading">
      <SectionHeading id="archive-heading" eyebrow={{ zh: "檔案索引 / 01", en: "Archive index / 01" }} title={{ zh: "從專案開始。", en: "Start with the projects." }} description={{ zh: "每份檔案都保留問題、取捨與證據；圖表和演示保留在對應的專案章節。", en: "Each record keeps the problem, trade-offs, and evidence together. Figures, charts, and media remain inside the record they belong to." }} locale={locale} />
      <ArchiveIndexMotion projects={archiveProjects} />
    </section>

    <section className="section home-ask" aria-labelledby="ask-heading"><SectionHeading id="ask-heading" eyebrow={{ zh: "向檔案提問 / 02", en: "Archive Q&A / 02" }} title={{ zh: "如果好奇，就直接問。", en: "Ask what you are curious about." }} description={{ zh: "回答會先檢索目前公開的檔案，再由 Kimi 整理並帶你回到引用章節。", en: "Answers retrieve the current public archive before Kimi organizes a response and links back to cited sections." }} locale={locale} /><AskInterface /></section>

    <section className="section topic-section" aria-labelledby="topics-heading"><SectionHeading id="topics-heading" eyebrow={{ zh: "主題索引 / 03", en: "Topic index / 03" }} title={{ zh: "幾條理解專案的線索。", en: "A few ways into the projects." }} description={{ zh: "主題把控制研究、跨端系統與檔案設計連在一起，用來找到內容，不用來替能力打分。", en: "Topics connect control research, cross-platform systems, and archive design. They are entry points into the material, not capability scores." }} locale={locale} /><div className="topic-index">{topicIndex.map((topic, index) => <span className="topic-item" key={topic.zh}><b>{String(index + 1).padStart(2, "0")}</b>{t(topic, locale)}</span>)}</div></section>
  </div>;
}
