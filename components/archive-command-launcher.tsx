"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { ProjectArchive } from "@/data/content";
import { useLocale } from "@/components/locale-context";

const ArchiveCommand = dynamic(
  () => import("@/components/archive-command").then((module) => module.ArchiveCommand),
  { ssr: false },
);

const triggerStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  border: "1px solid var(--line)",
  background: "var(--paper)",
  color: "var(--ink)",
  padding: "9px 12px",
  font: '11px "Courier New", monospace',
  letterSpacing: ".04em",
  cursor: "pointer",
};

const keyStyle: CSSProperties = {
  border: "1px solid var(--line)",
  color: "var(--muted)",
  padding: "2px 5px",
  fontSize: 10,
};

export function ArchiveCommandLauncher({ projects }: { projects: ProjectArchive[] }) {
  const { locale } = useLocale();
  const [activated, setActivated] = useState(false);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const zh = locale === "zh";

  const show = () => {
    setActivated(true);
    setOpen(true);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        show();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (wasOpen.current && !open) requestAnimationFrame(() => triggerRef.current?.focus());
    wasOpen.current = open;
  }, [open]);

  return <>
    <button
      ref={triggerRef}
      type="button"
      style={triggerStyle}
      onClick={show}
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls="archive-command-dialog"
    >
      <span aria-hidden="true" style={{ color: "var(--blue)", fontSize: 15 }}>⌕</span>
      <span>{zh ? "搜索档案" : "Search archive"}</span>
      <span style={keyStyle}>⌘ / Ctrl K</span>
    </button>
    {activated && <ArchiveCommand projects={projects} open={open} onOpenChange={setOpen} />}
  </>;
}
