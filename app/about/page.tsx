"use client";

import { curriculumGroups, education, internships } from "@/data/content";
import { useLocale } from "@/components/locale-context";
import { t } from "@/lib/i18n";
import { Eyebrow, SourceTag } from "@/components/ui";

export default function AboutPage() {
  const { locale } = useLocale();
  const zh = locale === "zh";

  return <div className="page-frame">
    <section className="page-intro">
      <Eyebrow>About / 03</Eyebrow>
      <h1>ABOUT<br /><span style={{ color: "var(--red)" }}>THE ARCHIVE.</span></h1>
      <p>{zh
        ? "這一頁補上檔案之外的脈絡：學習背景、實習記錄，以及我持續關注的問題。"
        : "This page adds the context around the archive: education, internship records, and the questions I continue to follow."}</p>
    </section>

    <div className="about-grid">
      <div>
        <section className="about-block">
          <h2>{zh ? "背景 / Background" : "Background / 背景"}</h2>
          <p>{zh
            ? "我已完成中南大學計算機科學與技術本科學習並取得學位。幾年的學習與專案大致沿著兩條線展開：一條是大型語言模型、視覺感知與無人機控制研究；另一條是 Web、移動端與服務端系統實作。這個網站按照來源整理每個專案的設計、實驗、分工與限制。"
            : "I completed a BSc in Computer Science and Technology at Central South University. My recent work follows two broad lines: language models, visual perception, and UAV control; and practical web, mobile, and server systems. This site organizes each project's design, experiments, responsibilities, and limits around its sources."}</p>
        </section>

        <section className="about-block">
          <h2>{zh ? "教育 / Education" : "Education / 教育"}</h2>
          <div className="education-grid">{education.map((item) => <div className="education-item" key={item.period}>
            <span className="education-year">{item.period}</span>
            <div><strong>{t(item.school, locale)}</strong><span>{t(item.detail, locale)}</span></div>
          </div>)}</div>
        </section>
      </div>

      <div>
        <section className="about-block">
          <h2>{zh ? "實習 / Internships" : "Internships / 實習"}</h2>
          <div className="education-grid">{internships.map((item) => <div className="education-item internship-item" key={item.period}>
            <span className="education-year">{item.period}</span>
            <div><strong>{t(item.company, locale)}</strong><span>{t(item.detail, locale)}</span><p>{t(item.note, locale)}</p></div>
          </div>)}</div>
        </section>

        <section className="about-block">
          <h2>{zh ? "關注領域 / Areas of attention" : "Areas of attention / 關注領域"}</h2>
          <div className="topic-index about-topics">
            <span className="topic-item"><b>01</b>{zh ? "大型語言模型進入真實系統" : "Language models in real systems"}</span>
            <span className="topic-item"><b>02</b>{zh ? "可追溯的系統評測" : "Traceable system evaluation"}</span>
            <span className="topic-item"><b>03</b>{zh ? "跨端系統、內容與權限" : "Cross-platform systems, content, and permissions"}</span>
          </div>
        </section>

        <section className="about-block contact-block" id="contact">
          <h2>{zh ? "聯絡方式 / Contact" : "Contact / 聯絡方式"}</h2>
          <address className="contact-details">
            <span>{zh ? "個人電話" : "Personal phone"}: <a href="tel:68257662">68257662</a></span>
            <i aria-hidden="true">|</i>
            <span>{zh ? "個人郵箱" : "Personal email"}: <a href="mailto:b524462682@gmail.com">b524462682@gmail.com</a></span>
          </address>
          <SourceTag>{zh ? "公開聯絡方式" : "Public contact"}</SourceTag>
        </section>
      </div>
    </div>

    <section className="curriculum-section" aria-labelledby="curriculum-heading">
      <div className="curriculum-heading">
        <Eyebrow tone="blue">Curriculum / 04</Eyebrow>
        <h2 id="curriculum-heading">{zh ? "本科培養脈絡" : "Undergraduate curriculum"}</h2>
        <p>{zh
          ? "以下內容依計算機科學與技術專業培養方案的課程清單整理，用來說明本科培養範圍，不代表成績、排名或熟練度自評。"
          : "The groups below are organized from the Computer Science and Technology curriculum. They describe the scope of undergraduate study, not grades, rankings, or self-assessed mastery."}</p>
      </div>

      <div className="curriculum-grid">{curriculumGroups.map((group) => <article className="curriculum-card" key={group.index}>
        <div className="curriculum-card-meta"><span>{group.index}</span><SourceTag>{zh ? "培養方案" : "Curriculum"}</SourceTag></div>
        <h3>{t(group.title, locale)}</h3>
        <p>{t(group.summary, locale)}</p>
        <ul>{group.courses.map((course) => <li key={course.zh}>{t(course, locale)}</li>)}</ul>
        <small>{t(group.source.label, locale)}</small>
      </article>)}</div>
    </section>
  </div>;
}
