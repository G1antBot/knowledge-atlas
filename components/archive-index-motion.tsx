"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll } from "motion/react";
import { useRef, type CSSProperties, type RefObject } from "react";
import type { ProjectArchive } from "@/data/content";
import { useLocale } from "@/components/locale-context";
import { t } from "@/lib/i18n";
import { Arrow, Eyebrow } from "@/components/ui";

export type ArchiveIndexMotionProps = {
  projects: ProjectArchive[];
  id?: string;
};

function ArchiveProgress({ target }: { target: RefObject<HTMLDivElement | null> }) {
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start 90%", "end 15%"],
  });

  return <motion.div className="swiss-archive-progress" aria-hidden="true" style={{ scaleX: scrollYProgress }} />;
}

export function ArchiveIndexMotion({ projects, id }: ArchiveIndexMotionProps) {
  const { locale } = useLocale();
  const reduceMotion = useReducedMotion();
  const zh = locale === "zh";
  const indexRef = useRef<HTMLDivElement>(null);

  return <div className="swiss-archive-motion" id={id} ref={indexRef}>
    {!reduceMotion && <ArchiveProgress target={indexRef} />}
    <div className="swiss-archive-grid" role="list" aria-label={zh ? "專案檔案" : "Project archive"}>
      {projects.map((project, index) => <div
        className="swiss-archive-motion-item"
        role="listitem"
        style={{ "--archive-index": index } as CSSProperties}
        key={project.slug}
      >
        <Link className={`swiss-archive-card swiss-archive-${project.status}`} href={`/projects/${project.slug}`}>
          <div className="swiss-card-index">{project.index}</div>
          <div className="swiss-card-main">
            <Eyebrow tone={project.accent === "ink" ? "ink" : project.accent}>{t(project.category, locale)}</Eyebrow>
            <h2>{t(project.title, locale)}</h2>
            <p>{t(project.subtitle, locale)}</p>
          </div>
          <div className="swiss-card-meta">
            <span>{project.period}</span>
            <span>{project.tags.slice(0, 3).join(" · ")}</span>
            <span className="swiss-card-open">{zh ? "開啟檔案" : "Open record"} <Arrow /></span>
          </div>
        </Link>
      </div>)}
    </div>
  </div>;
}
