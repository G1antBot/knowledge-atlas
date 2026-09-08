"use client";

import Link from "next/link";
import { archiveProjects, publicProfile, topicIndex } from "@/data/content";
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
        <div className="swiss-hero-note"><strong className="home-profile-name">{t(publicProfile.name, locale)}</strong><p>{zh ? "中南大學計算機科學與技術本科。專案涉及大模型應用、視覺感知與 Web 系統開發。" : "Computer Science and Technology graduate of Central South University. Projects cover LLM applications, visual perception, and web systems."}</p><SourceTag>{zh ? "專案、論文與實驗記錄" : "Projects, thesis & experiment records"}</SourceTag><div className="home-quick-links"><Link href="/projects/uav-recognition-strike-control#overview">{zh ? "代表專案" : "Featured project"} ↗</Link><Link href="/about#profile">{zh ? "個人背景" : "Background"} ↗</Link></div></div>
      </div>
    </section>

    <section className="section archive-first home-reveal home-reveal-delay-1" aria-labelledby="archive-heading">
      <SectionHeading id="archive-heading" eyebrow={{ zh: "檔案索引 / 01", en: "Archive index / 01" }} title={{ zh: "從專案開始。", en: "Start with the projects." }} description={{ zh: "每份檔案都保留問題、取捨與證據；圖表和演示保留在對應的專案章節。", en: "Each record keeps the problem, trade-offs, and evidence together. Figures, charts, and media remain inside the record they belong to." }} locale={locale} />
      <ArchiveIndexMotion projects={archiveProjects} />
    </section>

    <section className="section home-ask" aria-labelledby="ask-heading"><SectionHeading id="ask-heading" eyebrow={{ zh: "向檔案提問 / 02", en: "Archive Q&A / 02" }} title={{ zh: "如果好奇，就直接問。", en: "Ask what you are curious about." }} description={{ zh: "回答會先檢索目前公開的檔案，再由 Kimi 整理並帶你回到引用章節。", en: "Answers retrieve the current public archive before Kimi organizes a response and links back to cited sections." }} locale={locale} /><AskInterface /></section>

    <section className="section topic-section" aria-labelledby="topics-heading"><SectionHeading id="topics-heading" eyebrow={{ zh: "主題索引 / 03", en: "Topic index / 03" }} title={{ zh: "幾條理解專案的線索。", en: "A few ways into the projects." }} description={{ zh: "從控制研究、跨端系統與檔案設計查找相關內容。", en: "Explore related material across control research, cross-platform systems, and archive design." }} locale={locale} /><div className="topic-index">{topicIndex.map((topic, index) => <span className="topic-item" key={topic.zh}><b>{String(index + 1).padStart(2, "0")}</b>{t(topic, locale)}</span>)}</div></section>
  </div>;
}
