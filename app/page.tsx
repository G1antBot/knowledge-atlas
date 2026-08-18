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
        <div><h1 id="home-title">KNOWLEDGE<br /><span>ARCHIVE</span></h1><p className="swiss-hero-cn">{zh ? "个人知识系统" : "Personal knowledge system"}</p></div>
        <div className="swiss-hero-note"><p>{zh ? "以项目、论文和实验记录为基本单元。先浏览档案，再从引用明确的问答进入细节。" : "Projects, thesis material, and experiment records are the base units. Browse the archive first, then enter details through source-aware questions."}</p><SourceTag>{zh ? "当前主档案：无人机控制算法" : "Primary record: UAV control algorithm"}</SourceTag></div>
      </div>
    </section>

    <section className="section archive-first" aria-labelledby="archive-heading">
      <SectionHeading id="archive-heading" eyebrow={{ zh: "档案索引 / 01", en: "Archive index / 01" }} title={{ zh: "先看项目，再认识这个人。", en: "Projects first. Person second." }} description={{ zh: "首页只保留便于识别与比较的信息；论文图例、图表和演示媒体全部归入对应档案。", en: "The home page keeps only what helps identify and compare records. Figures, charts, and media live inside their archive." }} locale={locale} />
      <ArchiveIndexMotion projects={archiveProjects} />
    </section>

    <section className="section home-ask" aria-labelledby="ask-heading"><SectionHeading id="ask-heading" eyebrow={{ zh: "档案问答 / 02", en: "Archive Q&A / 02" }} title={{ zh: "问题是另一种索引。", en: "A question is another index." }} description={{ zh: "回答来自静态档案，并标注对应章节；当前仍是前端 Mock。", en: "Answers come from static records and point back to specific sections; this remains a front-end mock." }} locale={locale} /><AskInterface /></section>

    <section className="section topic-section" aria-labelledby="topics-heading"><SectionHeading id="topics-heading" eyebrow={{ zh: "主题索引 / 03", en: "Topic index / 03" }} title={{ zh: "让资料按概念互相指向。", en: "Connect records by concept." }} description={{ zh: "主题来自论文与实验说明，不扩写为能力排名。", en: "Topics come from thesis and experiment notes, not personal capability rankings." }} locale={locale} /><div className="topic-index">{topicIndex.map((topic, index) => <span className="topic-item" key={topic.zh}><b>{String(index + 1).padStart(2, "0")}</b>{t(topic, locale)}</span>)}</div></section>
  </div>;
}
