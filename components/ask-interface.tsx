"use client";

import { useEffect, useRef, useState } from "react";
import { chatAnswers, recommendedQuestions, type ChatSource } from "@/data/content";
import { mockAnswer, mockFailure } from "@/lib/mock-chat";
import { useLocale } from "@/components/locale-context";
import { t } from "@/lib/i18n";

type Message = { role: "user" | "assistant"; text: string; sources?: ChatSource[]; index?: number };

export function AskInterface() {
  const { locale } = useLocale();
  const zh = locale === "zh";
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<"rate-limit" | "error" | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answerRef = useRef(0);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  function stopStream() { if (timerRef.current) clearInterval(timerRef.current); timerRef.current = null; setStreaming(false); }

  function submit(value = question) {
    const clean = value.trim();
    if (!clean || streaming) return;
    stopStream(); setError(null); setFeedback(null); setQuestion("");
    const failure = mockFailure(clean);
    setMessages((current) => [...current, { role: "user", text: clean }]);
    if (failure) { setError(failure); return; }
    const answer = mockAnswer(clean);
    answerRef.current += 1;
    const messageIndex = answerRef.current;
    setMessages((current) => [...current, { role: "assistant", text: "", sources: answer.sources, index: messageIndex }]);
    setStreaming(true);
    let cursor = 0;
    const chars = Array.from(t(answer.text, locale));
    timerRef.current = setInterval(() => {
      cursor += 1;
      setMessages((current) => current.map((message) => message.index === messageIndex ? { ...message, text: chars.slice(0, cursor).join("") } : message));
      if (cursor >= chars.length) { stopStream(); }
    }, 22);
  }

  function clearConversation() { stopStream(); setMessages([]); setError(null); setFeedback(null); }
  function copyAnswer(text: string) { void navigator.clipboard?.writeText(text); setFeedback(zh ? "已复制" : "Copied"); }

  return <div className="ask-layout">
    <section className="ask-console" aria-label={zh ? "AI 知识系统模拟问答" : "AI knowledge system mock chat"}>
      <div className="console-bar"><span>ASK / STATIC MOCK CHANNEL</span><span className="console-status"><i className={`status-dot ${streaming ? "live" : ""}`} />{streaming ? "STREAMING" : "READY"}</span></div>
      <div className="conversation" aria-live="polite">
        <p className="console-disclaimer">{zh ? "前端 Mock：非实时回答，不接入外部服务" : "Front-end mock: no live answer or external service connection."}</p>
        {messages.length === 0 && <p className="console-intro">{zh ? "输入问题，系统会从静态项目档案中选取回答，并模拟逐字流式输出。建议问题围绕系统设计、资料来源和项目证据。" : "Ask a question. The system selects from static project records and simulates token streaming. Suggested questions focus on system design, source records, and project evidence."}</p>}
        {messages.map((message, index) => <div className="message" key={`${message.role}-${index}`}>
          <div className="message-label">{message.role === "user" ? (zh ? "YOU / 访客" : "YOU / Visitor") : (zh ? "ATLAS / 静态档案" : "ATLAS / Static archive")}</div>
          <div className={message.role === "user" ? "message-user" : "message-assistant"}>{message.text}{message.role === "assistant" && streaming && index === messages.length - 1 && <span className="cursor" />}</div>
          {message.role === "assistant" && !streaming && message.text && <div className="feedback-row"><button className="tiny-action" type="button" onClick={() => copyAnswer(message.text)}>{zh ? "复制回答" : "Copy"}</button><button className="tiny-action" type="button" onClick={() => setFeedback(zh ? "感谢反馈" : "Thanks")}>{zh ? "有帮助" : "Helpful"}</button><button className="tiny-action" type="button" onClick={() => setFeedback(zh ? "已记录" : "Noted")}>{zh ? "需修正" : "Needs correction"}</button></div>}
        </div>)}
        {streaming && <button className="tiny-action" type="button" onClick={stopStream}>{zh ? "停止生成" : "Stop"}</button>}
        {error && <div className="console-error">{error === "rate-limit" ? (zh ? "429 / RATE_LIMIT — 当前演示额度已用尽，请稍后再试。" : "429 / RATE_LIMIT — Demo quota is exhausted. Try again later.") : (zh ? "500 / MOCK_ERROR — 模拟知识索引暂时不可用。" : "500 / MOCK_ERROR — Mock knowledge index is unavailable.")}</div>}
        {feedback && <div className="message-label">{feedback}</div>}
      </div>
      <form className="console-controls" onSubmit={(event) => { event.preventDefault(); submit(); }}><textarea className="console-input" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={zh ? "输入问题 / Ask a question..." : "Ask a question..."} aria-label={zh ? "输入问题" : "Question input"} rows={2} disabled={streaming} /><button className="console-button" type="submit" disabled={streaming || !question.trim()}>{zh ? "发送" : "Send"}</button><button className="console-button secondary" type="button" onClick={clearConversation}>{zh ? "清空" : "Clear"}</button></form>
    </section>
    <aside>
      <div className="question-bank"><h2>{zh ? "建议问题" : "Suggested questions"}</h2><p>{zh ? "从这些入口开始，查看回答如何引用项目档案。" : "Start with an entry point and see how the answer cites the project archive."}</p><div className="question-list">{recommendedQuestions.map((item) => <button className="question-button" type="button" key={item.zh} onClick={() => submit(t(item, locale))} disabled={streaming}>{t(item, locale)}<span className="arrow">↗</span></button>)}</div></div>
      {messages.some((message) => message.role === "assistant" && message.text) && <div className="source-cards"><h2>{zh ? "回答引用 / Sources" : "Sources / 回答引用"}</h2>{messages.filter((message) => message.role === "assistant").slice(-1).flatMap((message) => message.sources ?? []).map((source, index) => <div className="source-card" key={`${source.title.zh}-${index}`}><span>{source.type.toUpperCase()} / SOURCE {String(index + 1).padStart(2, "0")}</span><strong>{t(source.title, locale)}</strong><span>{t(source.detail, locale)}</span></div>)}</div>}
      {chatAnswers.length > 0 && <p className="coord" style={{ marginTop: 28 }}>MOCK INDEX / {chatAnswers.length} ANSWER PATTERNS / NO EXTERNAL SERVICE</p>}
    </aside>
  </div>;
}
