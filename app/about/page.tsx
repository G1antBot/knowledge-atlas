"use client";

import { curriculumGroups, publicContact, publicProfile } from "@/data/content";
import { useLocale } from "@/components/locale-context";
import { t } from "@/lib/i18n";
import { Eyebrow, SourceTag } from "@/components/ui";

export default function AboutPage() {
  const { locale } = useLocale();
  const zh = locale === "zh";

  return <div className="page-frame">
    <section className="page-intro about-reveal">
      <Eyebrow>About / 03</Eyebrow>
      <h1>ABOUT<br /><span style={{ color: "var(--red)" }}>THE ARCHIVE.</span></h1>
      <p>{t(publicProfile.intro, locale)}</p>
    </section>

    <div className="about-grid about-reveal about-reveal-delay-1">
      <div>
        <section className="about-block" id="profile">
          <h2>{zh ? "背景 / Background" : "Background / 背景"}</h2>
          <p>{t(publicProfile.background, locale)}</p>
        </section>

        <section className="about-block">
          <h2>{zh ? "教育 / Education" : "Education / 教育"}</h2>
          <div className="education-grid">{publicProfile.education.map((item) => <div className="education-item" key={item.period}>
            <span className="education-year">{item.period}</span>
            <div><strong>{t(item.school, locale)}</strong><span>{t(item.detail, locale)}</span></div>
          </div>)}</div>
        </section>
      </div>

      <div>
        <section className="about-block">
          <h2>{zh ? "實習 / Internships" : "Internships / 實習"}</h2>
          <div className="education-grid">{publicProfile.internships.map((item) => <div className="education-item internship-item" key={item.period}>
            <span className="education-year">{item.period}</span>
            <div><strong>{t(item.company, locale)}</strong><span>{t(item.detail, locale)}</span><p>{t(item.note, locale)}</p></div>
          </div>)}</div>
        </section>

        <section className="about-block">
          <h2>{zh ? "關注領域 / Areas of attention" : "Areas of attention / 關注領域"}</h2>
          <div className="topic-index about-topics">{publicProfile.focusAreas.map((area, index) => <span className="topic-item" key={area.zh}>
            <b>{String(index + 1).padStart(2, "0")}</b>{t(area, locale)}
          </span>)}</div>
        </section>

        <section className="about-block contact-block" id="contact">
          <h2>{zh ? "聯絡方式 / Contact" : "Contact / 聯絡方式"}</h2>
          <address className="contact-details">
            <span>{t(publicContact.phone.label, locale)}: <a href={publicContact.phone.href}>{publicContact.phone.value}</a></span>
            <i aria-hidden="true">|</i>
            <span>{t(publicContact.email.label, locale)}: <a href={publicContact.email.href}>{publicContact.email.value}</a></span>
          </address>
          <SourceTag>{zh ? "公開聯絡方式" : "Public contact"}</SourceTag>
        </section>
      </div>
    </div>

    <section className="curriculum-section about-reveal about-reveal-delay-2" aria-labelledby="curriculum-heading">
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
