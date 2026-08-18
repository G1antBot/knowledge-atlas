"use client";

import { useLocale } from "@/components/locale-context";
import { t } from "@/lib/i18n";

export function ArchitectureDiagram() {
  const { locale } = useLocale();
  const labels = locale === "zh" ? {
    input: "自然语言任务",
    watchdog: "看门狗",
    decision: "决策层",
    perception: "感知层",
    control: "控制层",
    safety: "安全层",
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
  return <div className="architecture-diagram" role="img" aria-label={locale === "zh" ? "无人机四层架构数据流示意" : "UAV four-layer architecture data-flow diagram"}>
    <div className="diagram-top"><span className="diagram-node node-input">{labels.input}</span><span className="diagram-arrow">→</span><span className="diagram-node node-watchdog">{labels.watchdog}</span></div>
    <svg className="diagram-lines" viewBox="0 0 760 100" aria-hidden="true" preserveAspectRatio="none"><path d="M88 50 H672" /><path d="M204 50 V10 H350" /><path d="M204 50 V90 H350" /><path d="M502 10 V50" /><path d="M502 90 V50" /></svg>
    <div className="diagram-grid"><div className="diagram-node node-perception">{labels.perception}</div><div className="diagram-node node-decision">{labels.decision}</div><div className="diagram-node node-control">{labels.control}</div><div className="diagram-node node-safety">{labels.safety}</div></div>
    <div className="diagram-bottom"><span className="diagram-node node-output">{labels.output}</span></div>
    <p className="diagram-note">{t({ zh: "红线代表输入侧的安全短路，蓝线代表普通任务向下流动。最终动作都必须经过安全层。", en: "The red path marks an input-side safety short-circuit; the blue flow carries ordinary tasks downward. Every final action passes the safety layer." }, locale)}</p>
  </div>;
}
