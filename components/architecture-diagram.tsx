"use client";

import { useLocale } from "@/components/locale-context";
import { t } from "@/lib/i18n";

export function ArchitectureDiagram() {
  const { locale } = useLocale();
  const labels = locale === "zh" ? {
    input: "自然語言任務",
    watchdog: "看門狗",
    decision: "決策層",
    perception: "感知層",
    control: "控制層",
    safety: "安全層",
    output: "MAVLink / PX4",
  } : {
    input: "Natural-language mission",
    watchdog: "Watchdog",
    decision: "Decision",
    perception: "Perception",
    control: "Control",
    safety: "Safety",
    output: "MAVLink / PX4",
  };
  return <div className="architecture-diagram" role="img" aria-label={locale === "zh" ? "無人機四層架構資料流示意" : "UAV four-layer architecture data-flow diagram"}>
    <div className="diagram-top"><span className="diagram-node node-input">{labels.input}</span><span className="diagram-arrow">→</span><span className="diagram-node node-watchdog">{labels.watchdog}</span></div>
    <svg className="diagram-lines" viewBox="0 0 760 100" aria-hidden="true" preserveAspectRatio="none"><path d="M88 50 H672" /><path d="M204 50 V10 H350" /><path d="M204 50 V90 H350" /><path d="M502 10 V50" /><path d="M502 90 V50" /></svg>
    <div className="diagram-grid"><div className="diagram-node node-perception">{labels.perception}</div><div className="diagram-node node-decision">{labels.decision}</div><div className="diagram-node node-control">{labels.control}</div><div className="diagram-node node-safety">{labels.safety}</div></div>
    <div className="diagram-bottom"><span className="diagram-node node-output">{labels.output}</span></div>
    <p className="diagram-note">{t({ zh: "紅線代表輸入側的安全短路，藍線代表普通任務向下流動。最終動作都必須經過安全層。", en: "The red path marks an input-side safety short-circuit; the blue flow carries ordinary tasks downward. Every final action passes the safety layer." }, locale)}</p>
  </div>;
}
