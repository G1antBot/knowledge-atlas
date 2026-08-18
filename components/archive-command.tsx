"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { Command } from "cmdk";
import type { ProjectArchive } from "@/data/content";
import { useLocale } from "@/components/locale-context";
import { t } from "@/lib/i18n";
import {
  createArchiveSearchIndex,
  getArchiveSourceLabel,
  getArchiveSuggestions,
  searchArchive,
  type ArchiveSearchHit,
} from "@/lib/archive-search";

type ArchiveCommandProps = {
  projects: ProjectArchive[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const keyStyle: CSSProperties = {
  border: "1px solid var(--line)",
  color: "var(--muted)",
  padding: "2px 5px",
  fontSize: 10,
};

const dialogStyle: CSSProperties = {
  width: "min(720px, 100%)",
  overflow: "hidden",
  border: "1px solid var(--ink)",
  background: "var(--paper)",
  color: "var(--ink)",
  boxShadow: "9px 9px 0 rgba(12, 12, 12, .45)",
};

const resultLinkStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "24px minmax(0, 1fr) auto",
  gap: 12,
  width: "100%",
  alignItems: "start",
  padding: "13px 18px",
  borderTop: "1px solid var(--line)",
  color: "inherit",
};

function ResultItem({ hit, locale, onSelect }: { hit: ArchiveSearchHit; locale: "zh" | "en"; onSelect: () => void }) {
  const sectionTitle = hit.sectionTitle ? t(hit.sectionTitle, locale) : null;
  return (
    <Command.Item value={hit.id} keywords={[...hit.tags, t(hit.title, locale), t(hit.summary, locale)]} asChild onSelect={onSelect}>
      <Link href={hit.href} style={resultLinkStyle}>
        <span style={{ color: "var(--blue)", font: '11px "Courier New", monospace' }} aria-hidden="true">{hit.kind === "section" ? "§" : "↳"}</span>
        <span style={{ minWidth: 0, display: "grid", gap: 4 }}>
          <span style={{ fontWeight: 700, lineHeight: 1.25 }}>{sectionTitle ?? t(hit.title, locale)}</span>
          <span style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.35 }}>{sectionTitle ? t(hit.title, locale) : t(hit.subtitle, locale)}</span>
          <span style={{ color: "var(--muted)", font: '10px "Courier New", monospace', overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{getArchiveSourceLabel(hit, locale)}</span>
        </span>
        <span style={{ color: "var(--red)", font: '10px "Courier New", monospace' }}>{hit.sectionId ? `#${hit.sectionId}` : "PROJECT"}</span>
      </Link>
    </Command.Item>
  );
}

export function ArchiveCommand({ projects, open, onOpenChange }: ArchiveCommandProps) {
  const { locale } = useLocale();
  const [query, setQuery] = useState("");
  const index = useMemo(() => createArchiveSearchIndex(projects), [projects]);
  const trimmedQuery = query.trim();
  const hits = useMemo(
    () => trimmedQuery ? searchArchive(index, trimmedQuery) : getArchiveSuggestions(index),
    [index, trimmedQuery],
  );
  const zh = locale === "zh";

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const close = () => onOpenChange(false);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label={zh ? "全局档案搜索" : "Global archive search"}
      shouldFilter={false}
      loop
      id="archive-command-dialog"
      className="archive-command-root"
      contentClassName="archive-command-content"
      overlayClassName="archive-command-overlay"
      style={dialogStyle}
    >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 18px 10px", borderBottom: "1px solid var(--line)" }}>
                <span id="archive-command-title" style={{ color: "var(--blue)", font: '11px "Courier New", monospace', letterSpacing: ".1em" }}>{zh ? "全局档案 / SEARCH" : "GLOBAL ARCHIVE / SEARCH"}</span>
                <button type="button" onClick={close} aria-label={zh ? "关闭搜索" : "Close search"} style={{ ...keyStyle, background: "transparent", cursor: "pointer" }}>ESC</button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", borderBottom: "1px solid var(--ink)" }}>
                <span aria-hidden="true" style={{ color: "var(--red)", fontSize: 20 }}>⌕</span>
                <Command.Input
                  autoFocus
                  value={query}
                  onValueChange={setQuery}
                  placeholder={zh ? "输入标题、章节、标签或来源…" : "Search titles, sections, tags, or sources…"}
                  aria-label={zh ? "搜索公开档案" : "Search public archive"}
                  style={{ width: "100%", border: 0, outline: 0, background: "transparent", color: "var(--ink)", font: '16px/1.4 "Helvetica Neue", "Noto Sans SC", sans-serif' }}
                />
              </div>
              <Command.List label={zh ? "档案搜索结果" : "Archive search results"} style={{ maxHeight: "min(52vh, 440px)", overflowY: "auto", padding: "5px 0 9px" }}>
                <div style={{ padding: "8px 18px 6px", color: "var(--muted)", font: '10px "Courier New", monospace', letterSpacing: ".08em" }}>
                  {trimmedQuery ? (zh ? "匹配节点" : "MATCHED NODES") : (zh ? "建议入口" : "SUGGESTED ENTRIES")}
                </div>
                {hits.map((hit) => <ResultItem key={hit.id} hit={hit} locale={locale} onSelect={close} />)}
                <Command.Empty style={{ padding: "28px 18px", color: "var(--muted)", textAlign: "center" }}>
                  {zh ? "没有匹配的公开档案。试试项目名、章节或标签。" : "No public archive matches. Try a project, section, or tag."}
                </Command.Empty>
              </Command.List>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "10px 18px", borderTop: "1px solid var(--line)", color: "var(--muted)", font: '10px "Courier New", monospace' }}>
                <span>{zh ? "↑↓ 选择 · Enter 打开" : "↑↓ select · Enter open"}</span>
                <span>{zh ? "仅公开前端档案" : "Public frontend archive only"}</span>
              </div>
    </Command.Dialog>
  );
}
