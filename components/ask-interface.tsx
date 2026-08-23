"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { chatAnswers, recommendedQuestions, type ChatSource } from "@/data/content";
import { useLocale } from "@/components/locale-context";
import { t } from "@/lib/i18n";
import { ASK_ERROR_STATUS, isAskErrorCode, type AskErrorCode, type AskErrorResponse, type AskStreamEvent } from "@/lib/ask-protocol";

type Message = { role: "user" | "assistant"; text: string; sources?: ChatSource[]; index?: number };
type AskInterfaceProps = { variant?: "panel" | "full" };
type AskErrorState = { code: AskErrorCode; message: string };

const MAX_CONVERSATION_MESSAGES = 16;

const archiveLinks = [
  { index: "01", href: "/projects/uav-recognition-strike-control", zh: "無人機辨識與控制", en: "UAV recognition & control" },
  { index: "02", href: "/projects/image-management-system", zh: "圖片管理系統", en: "Image management system" },
  { index: "03", href: "/projects/knowledge-atlas", zh: "個人知識系統", en: "Knowledge Atlas" },
];

function getSourceHref(source: ChatSource) {
  if (source.href) return source.href;
  const title = `${source.title.zh} ${source.title.en}`.toLowerCase();
  if (title.includes("knowledge atlas") || title.includes("檔案與章節")) return "/projects/knowledge-atlas";
  if (title.includes("圖片") || title.includes("掃碼") || title.includes("團隊角色")) return "/projects/image-management-system";
  return "/projects/uav-recognition-strike-control";
}

function errorStatus(code: AskErrorCode) {
  return String(ASK_ERROR_STATUS[code]);
}

function isChatSource(value: unknown): value is ChatSource {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const source = value as Record<string, unknown>;
  const title = source.title as Record<string, unknown> | undefined;
  const detail = source.detail as Record<string, unknown> | undefined;
  return Boolean(
    title && typeof title.zh === "string" && typeof title.en === "string"
    && detail && typeof detail.zh === "string" && typeof detail.en === "string"
    && (source.type === "project" || source.type === "archive" || source.type === "system")
    && (source.href === undefined || typeof source.href === "string"),
  );
}

function parseStreamEvent(line: string): AskStreamEvent | null {
  try {
    const event = JSON.parse(line) as Record<string, unknown>;
    if (event.type === "sources" && Array.isArray(event.sources) && event.sources.every(isChatSource)) return { type: "sources", sources: event.sources };
    if (event.type === "delta" && typeof event.text === "string") return { type: "delta", text: event.text };
    if (event.type === "done") return { type: "done" };
    if (event.type === "error" && isAskErrorCode(event.code) && typeof event.message === "string") {
      return { type: "error", code: event.code, message: event.message };
    }
    return null;
  } catch {
    return null;
  }
}

export function AskInterface({ variant = "panel" }: AskInterfaceProps) {
  const { locale, toggleLocale } = useLocale();
  const zh = locale === "zh";
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<AskErrorState | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const answerRef = useRef(0);
  const endRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    if (variant === "full" && window.matchMedia("(min-width: 981px)").matches) setSidebarOpen(true);
  }, [variant]);

  useEffect(() => {
    if (variant === "full" && messages.length > 0) endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, variant]);

  useEffect(() => {
    if (!question && textareaRef.current) textareaRef.current.style.height = "auto";
  }, [question]);

  function stopStream() {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
  }

  async function submit(value = question) {
    const clean = value.trim();
    if (!clean || streaming) return;
    stopStream();
    setError(null);
    setFeedback(null);
    setQuestion("");
    answerRef.current += 1;
    const messageIndex = answerRef.current;
    setMessages((current) => {
      const next: Message[] = [
        ...current,
        { role: "user", text: clean },
        { role: "assistant", text: "", sources: [], index: messageIndex },
      ];
      const limited = next.slice(-MAX_CONVERSATION_MESSAGES);
      return limited[0]?.role === "assistant" ? limited.slice(1) : limited;
    });
    setStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;
    const ownsRequest = () => abortRef.current === controller && !controller.signal.aborted;
    let pendingText = "";
    let frameId: number | null = null;

    const flushPendingText = () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      frameId = null;
      if (!pendingText || !ownsRequest()) {
        pendingText = "";
        return;
      }
      const text = pendingText;
      pendingText = "";
      setMessages((current) => current.map((message) => message.index === messageIndex ? { ...message, text: message.text + text } : message));
    };

    const queueText = (text: string) => {
      pendingText += text;
      if (frameId === null) frameId = window.requestAnimationFrame(flushPendingText);
    };

    const cancelPendingText = () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      frameId = null;
      pendingText = "";
    };

    const removeEmptyAnswer = () => setMessages((current) => current.filter((message) => message.index !== messageIndex || message.text));

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: clean, locale }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let payload: AskErrorResponse | null = null;
        try {
          payload = await response.json() as AskErrorResponse;
        } catch {
          // Keep the public fallback below when an upstream response is malformed.
        }
        if (!ownsRequest()) return;
        removeEmptyAnswer();
        setError(payload?.error ?? {
          code: "service-unavailable",
          message: zh ? "檔案索引暫時無法使用，請稍後再試。" : "The archive index is temporarily unavailable. Try again later.",
        });
        return;
      }

      if (!response.body) throw new Error("Missing response stream");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value: chunk } = await reader.read();
        if (!ownsRequest()) {
          await reader.cancel();
          return;
        }
        buffer += decoder.decode(chunk, { stream: !done });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          const event = parseStreamEvent(line);
          if (!event || !ownsRequest()) continue;
          if (event.type === "sources") {
            setMessages((current) => current.map((message) => message.index === messageIndex ? { ...message, sources: event.sources } : message));
          } else if (event.type === "delta") {
            queueText(event.text);
          } else if (event.type === "done") {
            flushPendingText();
          } else if (event.type === "error") {
            flushPendingText();
            setError({ code: event.code, message: event.message });
          }
        }

        if (done) break;
      }
    } catch {
      if (!ownsRequest()) return;
      flushPendingText();
      removeEmptyAnswer();
      setError({
        code: "service-unavailable",
        message: zh ? "無法連接檔案服務，請稍後再試。" : "The archive service could not be reached. Try again later.",
      });
    } finally {
      if (abortRef.current === controller) {
        flushPendingText();
        if (frameId !== null) window.cancelAnimationFrame(frameId);
        abortRef.current = null;
        setStreaming(false);
      } else {
        cancelPendingText();
      }
    }
  }

  function clearConversation() {
    stopStream();
    setMessages([]);
    setQuestion("");
    setError(null);
    setFeedback(null);
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  }

  async function copyAnswer(text: string) {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(text);
      setFeedback(zh ? "回答已複製" : "Answer copied");
    } catch {
      setFeedback(zh ? "無法自動複製，請手動選取文字" : "Copy failed. Select the text manually.");
    }
  }

  if (variant === "full") {
    const sessionTitle = messages.find((message) => message.role === "user")?.text ?? (zh ? "尚未開始的對話" : "New conversation");
    const latestAssistantIndex = messages.length - 1;

    return <div className={`llm-shell ${sidebarOpen ? "" : "sidebar-closed"}`}>
      <button className={`llm-sidebar-scrim ${sidebarOpen ? "is-visible" : ""}`} type="button" aria-label={zh ? "關閉側欄" : "Close sidebar"} onClick={() => setSidebarOpen(false)} />
      <aside id="ask-sidebar" className={`llm-sidebar ${sidebarOpen ? "is-open" : ""}`} aria-label={zh ? "對話與檔案" : "Conversation and archives"}>
        <div className="llm-sidebar-brand">
          <Link href="/" aria-label={zh ? "返回首頁" : "Back to home"}><span>KA</span><strong>KNOWLEDGE<br />ATLAS</strong></Link>
          <button className="llm-icon-button llm-sidebar-close" type="button" onClick={() => setSidebarOpen(false)} aria-label={zh ? "收起側欄" : "Collapse sidebar"}>×</button>
        </div>
        <button className="llm-new-chat" type="button" onClick={clearConversation}><span aria-hidden="true">＋</span>{zh ? "新增對話" : "New conversation"}<kbd>⌘ K</kbd></button>

        <div className="llm-sidebar-block">
          <p className="llm-sidebar-label">{zh ? "目前對話" : "Current conversation"}</p>
          <button className="llm-session is-active" type="button">
            <span className="llm-session-mark" aria-hidden="true" />
            <span>{sessionTitle}</span>
          </button>
        </div>

        <div className="llm-sidebar-block llm-archive-scope">
          <p className="llm-sidebar-label">{zh ? "可查閱的檔案" : "Archive scope"}</p>
          {archiveLinks.map((item) => <Link href={item.href} key={item.href}><b>{item.index}</b><span>{zh ? item.zh : item.en}</span><i aria-hidden="true">↗</i></Link>)}
        </div>

        <div className="llm-sidebar-foot">
          <div><span className={`llm-live-dot ${streaming ? "is-streaming" : ""}`} /><b>{streaming ? (zh ? "正在整理回答" : "Composing answer") : (zh ? "檔案索引已就緒" : "Archive index ready")}</b></div>
          <p>{zh ? "回答先檢索公開檔案；啟用 Kimi 時由模型整理，並保留引用章節。" : "Answers retrieve public archive sections first; when Kimi is enabled, it organizes the response with citations."}</p>
        </div>
      </aside>

      <section className="llm-workspace" aria-label={zh ? "檔案提問" : "Ask the archive"}>
        <header className="llm-topbar">
          <div className="llm-topbar-title">
            <button className="llm-icon-button llm-menu-button" type="button" onClick={() => setSidebarOpen((open) => !open)} aria-expanded={sidebarOpen} aria-controls="ask-sidebar" aria-label={zh ? "切換側欄" : "Toggle sidebar"}><span /><span /><span /></button>
            <div><strong>{zh ? "檔案問答" : "Archive Q&A"}</strong><span>KNOWLEDGE ATLAS / 04</span></div>
          </div>
          <div className="llm-topbar-actions"><span className="llm-mode"><i />{zh ? "公開檔案" : "Public archive"}</span><button type="button" onClick={toggleLocale} aria-label={zh ? "切換為英文" : "切換為繁體中文"}>{zh ? "中 / EN" : "EN / 中"}</button>{messages.length > 0 && <button type="button" onClick={clearConversation}>{zh ? "清空對話" : "Clear"}</button>}</div>
        </header>

        <div className="llm-thread" aria-live="off">
          <div className="sr-only" role="status" aria-live="polite">{streaming ? (zh ? "正在整理回答" : "Generating answer") : messages.some((message) => message.role === "assistant" && message.text) ? (zh ? "回答已完成" : "Answer complete") : ""}</div>

          {messages.length === 0 ? <div className="llm-empty-state">
            <div className="llm-empty-index"><b>04</b><span>ASK THE ARCHIVE</span></div>
            <h1>{zh ? <>想從哪一份<br /><em>檔案</em>開始？</> : <>Where should we<br /><em>start reading?</em></>}</h1>
            <p>{zh ? "可以直接詢問專案如何運作、某項設計為何這樣安排，或我在團隊中負責哪些部分。回答會附上可以繼續閱讀的檔案章節。" : "Ask how a project works, why a design choice was made, or which parts I owned. Each answer points to archive sections you can continue reading."}</p>
            <div className="llm-suggestion-grid" aria-label={zh ? "建議問題" : "Suggested questions"}>
              {recommendedQuestions.slice(0, 4).map((item, index) => <button type="button" key={item.zh} onClick={() => submit(t(item, locale))}><b>{String(index + 1).padStart(2, "0")}</b><span>{t(item, locale)}</span><i aria-hidden="true">↗</i></button>)}
            </div>
          </div> : <div className="llm-message-list">
            {messages.map((message, index) => <article className={`llm-message llm-message-${message.role}`} key={`${message.role}-${index}`}>
              <div className="llm-avatar" aria-hidden="true">{message.role === "user" ? (zh ? "訪" : "V") : "KA"}</div>
              <div className="llm-message-body">
                <div className="llm-message-name"><strong>{message.role === "user" ? (zh ? "訪客" : "Visitor") : "Knowledge Atlas"}</strong>{message.role === "assistant" && <span>{zh ? "根據公開檔案" : "From public archives"}</span>}</div>
                <div className="llm-message-copy">{message.text}{message.role === "assistant" && streaming && index === latestAssistantIndex && <span className="cursor" />}</div>
                {message.role === "assistant" && !streaming && message.text && <>
                  {message.sources && message.sources.length > 0 && <div className="llm-citations"><p>{zh ? "引用章節" : "Cited sections"}</p>{message.sources.map((source, sourceIndex) => <Link href={getSourceHref(source)} key={`${source.title.zh}-${sourceIndex}`}><b>{String(sourceIndex + 1).padStart(2, "0")}</b><span><strong>{t(source.title, locale)}</strong><small>{t(source.detail, locale)}</small></span><i aria-hidden="true">↗</i></Link>)}</div>}
                  <div className="llm-response-actions"><button type="button" onClick={() => void copyAnswer(message.text)}>{zh ? "複製" : "Copy"}</button><button type="button" onClick={() => setFeedback(zh ? "已記錄：這份回答有幫助" : "Recorded as helpful")}>{zh ? "有幫助" : "Helpful"}</button><button type="button" onClick={() => setFeedback(zh ? "已記錄：這份回答需要修正" : "Recorded for correction")}>{zh ? "需要修正" : "Needs correction"}</button></div>
                </>}
              </div>
            </article>)}
            {error && <div className="llm-notice" role="alert"><b>{errorStatus(error.code)}</b><span>{error.message}</span></div>}
            {feedback && <p className="llm-feedback" role="status">{feedback}</p>}
            {!streaming && !error && <div className="llm-followups">{recommendedQuestions.slice(4, 8).map((item) => <button type="button" key={item.zh} onClick={() => submit(t(item, locale))}>{t(item, locale)}<span aria-hidden="true">↗</span></button>)}</div>}
            <div ref={endRef} />
          </div>}
        </div>

        <div className="llm-composer-dock">
          <form className="llm-composer" onSubmit={(event) => { event.preventDefault(); submit(); }}>
            <textarea ref={textareaRef} value={question} onChange={(event) => setQuestion(event.target.value)} onInput={(event) => { event.currentTarget.style.height = "auto"; event.currentTarget.style.height = `${Math.min(event.currentTarget.scrollHeight, 160)}px`; }} onKeyDown={handleComposerKeyDown} placeholder={zh ? "詢問專案、設計選擇或檔案來源……" : "Ask about a project, design choice, or source..."} aria-label={zh ? "輸入問題" : "Question input"} rows={1} disabled={streaming} />
            <div className="llm-composer-meta"><span><i />{zh ? "檢索範圍：3 份專案檔案" : "Scope: 3 project archives"}</span><span>{zh ? "Enter 送出 · Shift + Enter 換行" : "Enter to send · Shift + Enter for a new line"}</span></div>
            <button className={`llm-send ${streaming ? "is-stop" : ""}`} type={streaming ? "button" : "submit"} onClick={streaming ? stopStream : undefined} disabled={!streaming && !question.trim()} aria-label={streaming ? (zh ? "停止整理" : "Stop") : (zh ? "送出問題" : "Send question")}><span aria-hidden="true">{streaming ? "■" : "↑"}</span></button>
          </form>
          <p>{zh ? "啟用模型時，問題會傳送至 Kimi API；請勿輸入個人或機密資訊，並以引用章節為準。" : "When the model is enabled, questions are sent to the Kimi API. Do not enter personal or confidential information; verify answers against cited sections."}</p>
        </div>
      </section>
    </div>;
  }

  return <div className="ask-layout">
    <section className="ask-console" aria-label={zh ? "知識檔案問答" : "Knowledge archive Q&A"}>
      <div className="console-bar"><span>ASK / ARCHIVE CHANNEL</span><span className="console-status"><i className={`status-dot ${streaming ? "live" : ""}`} />{streaming ? "STREAMING" : "READY"}</span></div>
      <div className="conversation">
        <div className="sr-only" role="status" aria-live="polite">{streaming ? (zh ? "正在整理回答" : "Generating answer") : messages.some((message) => message.role === "assistant" && message.text) ? (zh ? "回答已完成" : "Answer complete") : ""}</div>
        <p className="console-disclaimer">{zh ? "啟用模型時，問題會傳送至 Kimi API，並只使用檢索到的公開檔案片段整理回答；請勿輸入個人或機密資訊。" : "When the model is enabled, questions are sent to the Kimi API and answered only from retrieved public archive excerpts. Do not enter personal or confidential information."}</p>
        {messages.length === 0 && <p className="console-intro">{zh ? "可以詢問架構、控制流程、資料來源，或某項設計為何這樣安排。回答會引用對應的專案章節。" : "Ask about the architecture, control flow, sources, or why a design choice was made. Answers cite the relevant project sections."}</p>}
        {messages.map((message, index) => <div className="message" key={`${message.role}-${index}`}>
          <div className="message-label">{message.role === "user" ? (zh ? "YOU / 訪客" : "YOU / Visitor") : (zh ? "ATLAS / 公開檔案" : "ATLAS / Public archive")}</div>
          <div className={message.role === "user" ? "message-user" : "message-assistant"}>{message.text}{message.role === "assistant" && streaming && index === messages.length - 1 && <span className="cursor" />}</div>
          {message.role === "assistant" && !streaming && message.text && <div className="feedback-row"><button className="tiny-action" type="button" onClick={() => void copyAnswer(message.text)}>{zh ? "複製回答" : "Copy"}</button><button className="tiny-action" type="button" onClick={() => setFeedback(zh ? "感謝回饋" : "Thanks")}>{zh ? "有幫助" : "Helpful"}</button><button className="tiny-action" type="button" onClick={() => setFeedback(zh ? "已記錄" : "Noted")}>{zh ? "需修正" : "Needs correction"}</button></div>}
        </div>)}
        {streaming && <button className="tiny-action" type="button" onClick={stopStream}>{zh ? "停止整理" : "Stop"}</button>}
        {error && <div className="console-error" role="alert">{error.message}</div>}
        {feedback && <div className="message-label">{feedback}</div>}
      </div>
      <form className="console-controls" onSubmit={(event) => { event.preventDefault(); submit(); }}><textarea className="console-input" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={zh ? "輸入問題……" : "Ask a question..."} aria-label={zh ? "輸入問題" : "Question input"} rows={2} disabled={streaming} /><button className="console-button" type="submit" disabled={streaming || !question.trim()}>{zh ? "送出" : "Send"}</button><button className="console-button secondary" type="button" onClick={clearConversation}>{zh ? "清空" : "Clear"}</button></form>
    </section>
    <aside>
      <div className="question-bank"><h2>{zh ? "可以從這些問題開始" : "Questions to start with"}</h2><p>{zh ? "每個回答都會附上對應的檔案章節。" : "Each answer includes the archive section it comes from."}</p><div className="question-list">{recommendedQuestions.map((item) => <button className="question-button" type="button" key={item.zh} onClick={() => submit(t(item, locale))} disabled={streaming}>{t(item, locale)}<span className="arrow">↗</span></button>)}</div></div>
      {messages.some((message) => message.role === "assistant" && message.text) && <div className="source-cards"><h2>{zh ? "回答引用 / Sources" : "Sources / 回答引用"}</h2>{messages.filter((message) => message.role === "assistant").slice(-1).flatMap((message) => message.sources ?? []).map((source, index) => <div className="source-card" key={`${source.title.zh}-${index}`}><span>{source.type.toUpperCase()} / SOURCE {String(index + 1).padStart(2, "0")}</span><strong>{t(source.title, locale)}</strong><span>{t(source.detail, locale)}</span></div>)}</div>}
      {chatAnswers.length > 0 && <p className="coord" style={{ marginTop: 28 }}>LOCAL INDEX / {chatAnswers.length} ANSWER PATTERNS / ARCHIVE SOURCES</p>}
    </aside>
  </div>;
}
