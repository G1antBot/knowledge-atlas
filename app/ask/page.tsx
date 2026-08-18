"use client";

import { Eyebrow } from "@/components/ui";
import { AskInterface } from "@/components/ask-interface";
import { useLocale } from "@/components/locale-context";

export default function AskPage() {
  const { locale } = useLocale();
  return <div className="page-frame"><section className="page-intro"><Eyebrow>Ask / 04</Eyebrow><h1>ASK THE<br /><span style={{ color: "var(--blue)" }}>ARCHIVE.</span></h1><p>{locale === "zh" ? "完整的前端 Mock 问答页：回答来自当前项目档案，支持逐字流式、引用、复制、停止与错误状态演示。" : "The full front-end mock: answers come from current project records, with streaming, citations, copy, stop, and error states."}</p></section><AskInterface /></div>;
}
