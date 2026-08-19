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
  async function copyAnswer(text: string) {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(text);
      setFeedback(zh ? "已複製" : "Copied");
    } catch {
      setFeedback(zh ? "複製失敗，請手動選取文字" : "Copy failed. Select the text manually.");
    }
  }

  return <div className="ask-layout">
    <section className="ask-console" aria-label={zh ? "AI 知識系統模擬問答" : "AI knowledge system mock chat"}>
      <div className="console-bar"><span>ASK / STATIC MOCK CHANNEL</span><span className="console-status"><i className={`status-dot ${streaming ? "live" : ""}`} />{streaming ? "STREAMING" : "READY"}</span></div>
      <div className="conversation">
        <div className="sr-only" role="status" aria-live="polite">{streaming ? (zh ? "正在產生回答" : "Generating answer") : messages.some((message) => message.role === "assistant" && message.text) ? (zh ? "回答已完成" : "Answer complete") : ""}</div>
        <p className="console-disclaimer">{zh ? "前端 Mock：非即時回答，不連接外部服務" : "Front-end mock: no live answer or external service connection."}</p>
        {messages.length === 0 && <p className="console-intro">{zh ? "可以詢問架構、控制流程、資料來源，或某項設計為何這樣安排。回答會引用對應的專案章節。" : "Ask about the architecture, control flow, sources, or why a design choice was made. Answers cite the relevant project sections."}</p>}
        {messages.map((message, index) => <div className="message" key={`${message.role}-${index}`}>
          <div className="message-label">{message.role === "user" ? (zh ? "YOU / 訪客" : "YOU / Visitor") : (zh ? "ATLAS / 靜態檔案" : "ATLAS / Static archive")}</div>
          <div className={message.role === "user" ? "message-user" : "message-assistant"}>{message.text}{message.role === "assistant" && streaming && index === messages.length - 1 && <span className="cursor" />}</div>
          {message.role === "assistant" && !streaming && message.text && <div className="feedback-row"><button className="tiny-action" type="button" onClick={() => void copyAnswer(message.text)}>{zh ? "複製回答" : "Copy"}</button><button className="tiny-action" type="button" onClick={() => setFeedback(zh ? "感謝回饋" : "Thanks")}>{zh ? "有幫助" : "Helpful"}</button><button className="tiny-action" type="button" onClick={() => setFeedback(zh ? "已記錄" : "Noted")}>{zh ? "需修正" : "Needs correction"}</button></div>}
        </div>)}
        {streaming && <button className="tiny-action" type="button" onClick={stopStream}>{zh ? "停止生成" : "Stop"}</button>}
        {error && <div className="console-error">{error === "rate-limit" ? (zh ? "429 / RATE_LIMIT — 目前示範額度已用盡，請稍後再試。" : "429 / RATE_LIMIT — Demo quota is exhausted. Try again later.") : (zh ? "500 / MOCK_ERROR — 模擬知識索引暫時無法使用。" : "500 / MOCK_ERROR — Mock knowledge index is unavailable.")}</div>}
        {feedback && <div className="message-label">{feedback}</div>}
      </div>
      <form className="console-controls" onSubmit={(event) => { event.preventDefault(); submit(); }}><textarea className="console-input" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={zh ? "輸入問題 / Ask a question..." : "Ask a question..."} aria-label={zh ? "輸入問題" : "Question input"} rows={2} disabled={streaming} /><button className="console-button" type="submit" disabled={streaming || !question.trim()}>{zh ? "送出" : "Send"}</button><button className="console-button secondary" type="button" onClick={clearConversation}>{zh ? "清空" : "Clear"}</button></form>
    </section>
    <aside>
      <div className="question-bank"><h2>{zh ? "可以從這些問題開始" : "Questions to start with"}</h2><p>{zh ? "每個回答都會附上對應的檔案章節。" : "Each answer includes the archive section it comes from."}</p><div className="question-list">{recommendedQuestions.map((item) => <button className="question-button" type="button" key={item.zh} onClick={() => submit(t(item, locale))} disabled={streaming}>{t(item, locale)}<span className="arrow">↗</span></button>)}</div></div>
      {messages.some((message) => message.role === "assistant" && message.text) && <div className="source-cards"><h2>{zh ? "回答引用 / Sources" : "Sources / 回答引用"}</h2>{messages.filter((message) => message.role === "assistant").slice(-1).flatMap((message) => message.sources ?? []).map((source, index) => <div className="source-card" key={`${source.title.zh}-${index}`}><span>{source.type.toUpperCase()} / SOURCE {String(index + 1).padStart(2, "0")}</span><strong>{t(source.title, locale)}</strong><span>{t(source.detail, locale)}</span></div>)}</div>}
      {chatAnswers.length > 0 && <p className="coord" style={{ marginTop: 28 }}>MOCK INDEX / {chatAnswers.length} ANSWER PATTERNS / NO EXTERNAL SERVICE</p>}
    </aside>
  </div>;
}
