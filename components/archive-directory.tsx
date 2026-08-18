"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { ArchiveSection, Bilingual, Locale } from "@/data/content";
import { t } from "@/lib/i18n";

type ArchiveDirectoryItem = {
  id: string;
  title: Bilingual;
};

export type ArchiveDirectoryProps = {
  sections: ArchiveSection[];
  hasMedia: boolean;
  locale: Locale;
};

const mediaTitle: Bilingual = { zh: "媒体记录", en: "Media record" };

export function ArchiveDirectory({ sections, hasMedia, locale }: ArchiveDirectoryProps) {
  const zh = locale === "zh";
  const items = useMemo<ArchiveDirectoryItem[]>(() => {
    const sectionItems = sections.map(({ id, title }) => ({ id, title }));
    return hasMedia && !sectionItems.some((item) => item.id === "media")
      ? [...sectionItems, { id: "media", title: mediaTitle }]
      : sectionItems;
  }, [hasMedia, sections]);
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    setActiveId(items[0]?.id ?? null);
  }, [items]);

  useEffect(() => {
    if (!items.length || typeof window === "undefined" || !("IntersectionObserver" in window)) return;

    const observed = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);
    if (!observed.length) return;

    const visibility = new Map<string, number>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        visibility.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
      });

      const next = items
        .map((item, index) => ({ item, index, ratio: visibility.get(item.id) ?? 0 }))
        .filter(({ ratio }) => ratio > 0)
        .sort((a, b) => b.ratio - a.ratio || a.index - b.index)[0];

      if (next) setActiveId(next.item.id);
    }, { rootMargin: "-18% 0px -62% 0px", threshold: [0, 0.2, 0.5, 1] });

    observed.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [items]);

  const activeIndex = Math.max(0, items.findIndex((item) => item.id === activeId));
  const currentStep = items.length ? activeIndex + 1 : 0;
  const progress = items.length ? currentStep / items.length : 0;
  const directoryLabel = zh ? "目录" : "Contents";
  const directoryDescription = zh ? "此档案暂无章节目录。" : "This archive has no section index yet.";

  return <aside
    className={`project-jumpbar archive-directory${items.length ? "" : " archive-directory-empty"}`}
    aria-label={zh ? "项目详情目录" : "Project detail contents"}
  >
    <span className="archive-directory-label">{directoryLabel}</span>
    {items.length ? <>
      <nav className="archive-directory-nav" aria-label={zh ? "项目章节" : "Project sections"}>
        {items.map((item, index) => {
          const isActive = item.id === activeId;
          return <a
            className={`archive-directory-link${isActive ? " is-active" : ""}`}
            href={`#${item.id}`}
            aria-current={isActive ? "location" : undefined}
            onClick={() => setActiveId(item.id)}
            key={item.id}
          >
            {String(index + 1).padStart(2, "0")} {t(item.title, locale)}
          </a>;
        })}
      </nav>
      <div
        className="archive-directory-progress"
        role="progressbar"
        aria-label={zh ? "目录阅读进度" : "Directory reading progress"}
        aria-valuemin={0}
        aria-valuemax={items.length}
        aria-valuenow={currentStep}
        style={{ "--archive-directory-progress": `${progress * 100}%` } as CSSProperties}
      >
        <span aria-hidden="true" />
      </div>
    </> : <p className="archive-directory-empty-copy">{directoryDescription}</p>}
  </aside>;
}
