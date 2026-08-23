"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { ArchiveSection, Locale } from "@/data/content";
import { t } from "@/lib/i18n";

type DirectoryItem = Pick<ArchiveSection, "id" | "title">;

export type ArchiveDirectoryProps = {
  sections: ArchiveSection[];
  locale: Locale;
};

export function ArchiveDirectory({ sections, locale }: ArchiveDirectoryProps) {
  const zh = locale === "zh";
  const items = useMemo<DirectoryItem[]>(() => sections.map(({ id, title }) => ({ id, title })), [sections]);
  const [activeId, setActiveId] = useState(items[0]?.id ?? null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => setActiveId(items[0]?.id ?? null), [items]);

  useEffect(() => {
    if (!items.length || typeof window === "undefined" || !("IntersectionObserver" in window)) return;
    const observed = items.map((item) => document.getElementById(item.id)).filter((element): element is HTMLElement => Boolean(element));
    if (!observed.length) return;
    const visibility = new Map<string, number>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => visibility.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0));
      const next = items.map((item, index) => ({ item, index, ratio: visibility.get(item.id) ?? 0 }))
        .filter(({ ratio }) => ratio > 0)
        .sort((a, b) => b.ratio - a.ratio || a.index - b.index)[0];
      if (next) setActiveId(next.item.id);
    }, { rootMargin: "-22% 0px -58% 0px", threshold: [0, 0.2, 0.5, 1] });
    observed.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    if (!activeId || drawerOpen) return;
    linkRefs.current[activeId]?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeId, drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () => drawerRef.current?.querySelectorAll<HTMLElement>("a, button");
    const first = focusable()?.[0];
    first?.focus();
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setDrawerOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const nodes = focusable();
      if (!nodes?.length) return;
      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === firstNode) {
        event.preventDefault();
        lastNode.focus();
      } else if (!event.shiftKey && document.activeElement === lastNode) {
        event.preventDefault();
        firstNode.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      triggerRef.current?.focus();
    };
  }, [drawerOpen]);

  const selectItem = (id: string) => {
    setActiveId(id);
    setDrawerOpen(false);
  };
  const onLinkKeyDown = (event: KeyboardEvent<HTMLAnchorElement>) => {
    if (event.key === "Enter" || event.key === " ") setDrawerOpen(false);
  };

  if (!items.length) return null;
  const activeIndex = Math.max(0, items.findIndex((item) => item.id === activeId));
  const activeItem = items[activeIndex] ?? items[0];
  const labels = {
    contents: zh ? "目錄" : "Contents",
    sections: zh ? "專案章節" : "Project sections",
    open: zh ? "開啟章節目錄" : "Open section contents",
    close: zh ? "關閉章節目錄" : "Close section contents",
  };

  return <aside className="project-jumpbar archive-directory" aria-label={zh ? "專案詳情目錄" : "Project detail contents"}>
    <span className="archive-directory-label">{labels.contents}</span>
    <div className="archive-directory-mobile-summary" aria-live="polite">
      <span className="archive-directory-count">{String(activeIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
      <strong>{t(activeItem.title, locale)}</strong>
    </div>
    <nav className="archive-directory-nav" aria-label={labels.sections}>
      {items.map((item, index) => {
        const isActive = item.id === activeId;
        return <a
          ref={(node) => { linkRefs.current[item.id] = node; }}
          className={`archive-directory-link${isActive ? " is-active" : ""}`}
          href={`#${item.id}`}
          aria-current={isActive ? "location" : undefined}
          onClick={() => selectItem(item.id)}
          onKeyDown={onLinkKeyDown}
          key={item.id}
        >
          <span className="archive-directory-index">{String(index + 1).padStart(2, "0")}</span>
          <span className="archive-directory-title">{t(item.title, locale)}</span>
        </a>;
      })}
    </nav>
    <button ref={triggerRef} className="archive-directory-toggle" type="button" aria-expanded={drawerOpen} aria-controls="archive-directory-drawer" aria-label={drawerOpen ? labels.close : labels.open} onClick={() => setDrawerOpen(true)}>
      <span>{labels.contents}</span><b aria-hidden="true">+</b>
    </button>
    {drawerOpen && <div className="archive-directory-drawer-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDrawerOpen(false); }}>
      <div ref={drawerRef} id="archive-directory-drawer" className="archive-directory-drawer" role="dialog" aria-modal="true" aria-labelledby="archive-directory-drawer-title">
        <div className="archive-directory-drawer-head"><div><span className="archive-directory-count">{String(activeIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span><h2 id="archive-directory-drawer-title">{labels.contents}</h2></div><button type="button" className="archive-directory-close" onClick={() => setDrawerOpen(false)} aria-label={labels.close}>×</button></div>
        <div className="archive-directory-drawer-list">{items.map((item, index) => <a className={item.id === activeId ? "is-active" : ""} href={`#${item.id}`} aria-current={item.id === activeId ? "location" : undefined} onClick={() => selectItem(item.id)} key={item.id}><span>{String(index + 1).padStart(2, "0")}</span><strong>{t(item.title, locale)}</strong></a>)}</div>
      </div>
    </div>}
  </aside>;
}
