"use client";

import { Eyebrow } from "@/components/ui";
import { AskInterface } from "@/components/ask-interface";
import { useLocale } from "@/components/locale-context";

export default function AskPage() {
  const { locale } = useLocale();
  return <div className="page-frame"><section className="page-intro"><Eyebrow>Ask / 04</Eyebrow><h1>ASK THE<br /><span style={{ color: "var(--blue)" }}>ARCHIVE.</span></h1><p>{locale === "zh" ? "可以用自己的問題翻閱目前公開的檔案。回答會逐字顯示並附上引用；內容仍由前端靜態資料提供。" : "Use your own questions to browse the public archive. Answers appear progressively with citations and still come from static front-end data."}</p></section><AskInterface /></div>;
}
