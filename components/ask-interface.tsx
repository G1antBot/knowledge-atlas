"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
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
  { index: "P", href: "/about#profile", zh: "個人資料", en: "Profile" },
];

const introSuggestion = {
  zh: "請介紹你的教育背景與專案方向。",
  en: "Tell me about your education and project direction.",
};

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

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
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const answerRef = useRef(0);
  const threadRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const sidebarRef = useRef<HTMLElement | null>(null);
  const shouldAutoScrollRef = useRef(true);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 980px)");
    const syncViewport = () => {
      const mobile = mediaQuery.matches;
      setIsMobileViewport(mobile);
      if (variant === "full") setSidebarOpen(!mobile);
    };
    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);
    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, [variant]);

  const mobileSidebarOpen = variant === "full" && isMobileViewport && sidebarOpen;

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
    window.requestAnimationFrame(() => menuButtonRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!mobileSidebarOpen) return;
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const getFocusable = () => Array.from(sidebar.querySelectorAll<HTMLElement>(focusableSelector)).filter((element) => element.getClientRects().length > 0);
    const focusFirst = () => getFocusable()[0]?.focus();
    const focusFrame = window.requestAnimationFrame(focusFirst);
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSidebar();
        return;
      }
      if (event.key !== "Tab") return;

      const nodes = getFocusable();
      if (!nodes.length) return;
      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];
      if (!sidebar.contains(document.activeElement)) {
        event.preventDefault();
        firstNode.focus();
      } else if (event.shiftKey && document.activeElement === firstNode) {
        event.preventDefault();
        lastNode.focus();
      } else if (!event.shiftKey && document.activeElement === lastNode) {
        event.preventDefault();
        firstNode.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeSidebar, mobileSidebarOpen]);

  useEffect(() => {
    if (variant !== "full" || messages.length === 0 || !shouldAutoScrollRef.current) return;
    const thread = threadRef.current;
    if (thread) thread.scrollTo({ top: thread.scrollHeight, behavior: "auto" });
  }, [messages, variant]);

  useEffect(() => {
    if (!question && textareaRef.current) textareaRef.current.style.height = "auto";
  }, [question]);

  function stopStream() {
    const wasStreaming = abortRef.current !== null;
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
    if (wasStreaming) setLiveMessage(zh ? "已停止回答" : "Answer stopped");
  }

  async function submit(value = question) {
    const clean = value.trim();
    if (!clean || streaming) return;
    stopStream();
    setError(null);
    setFeedback(null);
    setLiveMessage(zh ? "正在整理回答" : "Generating answer");
    setQuestion("");
    shouldAutoScrollRef.current = true;
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
    let completed = false;
    let streamFailed = false;

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
          message: zh ? "公開資料索引暫時無法使用，請稍後再試。" : "The public materials index is temporarily unavailable. Try again later.",
        });
        setLiveMessage(zh ? "回答暫時無法完成" : "Answer could not be completed");
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
            completed = true;
            setLiveMessage(zh ? "回答已完成" : "Answer complete");
          } else if (event.type === "error") {
            flushPendingText();
            streamFailed = true;
            setError({ code: event.code, message: event.message });
            setLiveMessage(zh ? "回答暫時無法完成" : "Answer could not be completed");
          }
        }

        if (done) break;
      }
      if (ownsRequest() && !completed && !streamFailed) setLiveMessage(zh ? "回答已完成" : "Answer complete");
    } catch {
      if (!ownsRequest()) return;
      flushPendingText();
      removeEmptyAnswer();
      setError({
        code: "service-unavailable",
        message: zh ? "無法連接公開資料服務，請稍後再試。" : "The public materials service could not be reached. Try again later.",
      });
      setLiveMessage(zh ? "回答暫時無法完成" : "Answer could not be completed");
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
    setLiveMessage("");
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
      {mobileSidebarOpen && <button className="llm-sidebar-scrim is-visible" type="button" aria-label={zh ? "關閉側欄" : "Close sidebar"} onClick={closeSidebar} />}
      <aside ref={sidebarRef} id="ask-sidebar" className={`llm-sidebar ${sidebarOpen ? "is-open" : ""}`} role={mobileSidebarOpen ? "dialog" : undefined} aria-modal={mobileSidebarOpen ? true : undefined} aria-hidden={!sidebarOpen ? true : undefined} inert={!sidebarOpen} aria-label={zh ? "對話與檔案" : "Conversation and archives"}>
        <div className="llm-sidebar-brand">
          <Link href="/" aria-label={zh ? "返回首頁" : "Back to home"}><span>KA</span><strong>KNOWLEDGE<br />ATLAS</strong></Link>
          <button className="llm-icon-button llm-sidebar-close" type="button" onClick={closeSidebar} aria-label={zh ? "收起側欄" : "Collapse sidebar"}>×</button>
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
          <p className="llm-sidebar-label">{zh ? "可查閱的公開資料" : "Public materials"}</p>
          {archiveLinks.map((item) => <Link href={item.href} key={item.href}><b>{item.index}</b><span>{zh ? item.zh : item.en}</span><i aria-hidden="true">↗</i></Link>)}
        </div>

        <div className="llm-sidebar-foot">
          <div><span className={`llm-live-dot ${streaming ? "is-streaming" : ""}`} /><b>{streaming ? (zh ? "正在整理回答" : "Composing answer") : (zh ? "公開資料已就緒" : "Public materials ready")}</b></div>
          <p>{zh ? "回答先檢索公開資料；啟用 Kimi 時由模型整理，並保留引用章節。" : "Answers retrieve public materials first; when Kimi is enabled, it organizes the response with citations."}</p>
        </div>
      </aside>

      <section className="llm-workspace" aria-hidden={mobileSidebarOpen ? true : undefined} inert={mobileSidebarOpen} aria-label={zh ? "檔案提問" : "Ask the archive"}>
        <header className="llm-topbar">
          <div className="llm-topbar-title">
            <button ref={menuButtonRef} className="llm-icon-button llm-menu-button" type="button" onClick={() => sidebarOpen ? closeSidebar() : setSidebarOpen(true)} aria-expanded={sidebarOpen} aria-controls="ask-sidebar" aria-label={zh ? "切換側欄" : "Toggle sidebar"}><span /><span /><span /></button>
            <div><strong>{zh ? "檔案問答" : "Archive Q&A"}</strong><span>KNOWLEDGE ATLAS / 04</span></div>
          </div>
          <div className="llm-topbar-actions"><span className="llm-mode"><i />{zh ? "公開資料" : "Public materials"}</span><button type="button" onClick={toggleLocale} aria-label={zh ? "切換為英文" : "切換為繁體中文"}>{zh ? "中 / EN" : "EN / 中"}</button>{messages.length > 0 && <button type="button" onClick={clearConversation}>{zh ? "清空對話" : "Clear"}</button>}</div>
        </header>

        <div ref={threadRef} className="llm-thread" aria-live="off" onScroll={(event) => { const element = event.currentTarget; shouldAutoScrollRef.current = element.scrollHeight - element.scrollTop - element.clientHeight <= 96; }}>
          <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{liveMessage}</div>

          {messages.length === 0 ? <div className="llm-empty-state">
            <div className="llm-empty-index"><b>04</b><span>ASK THE ARCHIVE</span></div>
            <h1>{zh ? <>想從哪一份<br /><em>檔案</em>開始？</> : <>Where should we<br /><em>start reading?</em></>}</h1>
            <p>{zh ? "可以直接詢問專案如何運作、某項設計為何這樣安排，或我在團隊中負責哪些部分。回答會附上可以繼續閱讀的公開資料章節。" : "Ask how a project works, why a design choice was made, or which parts I owned. Each answer points to public material sections you can continue reading."}</p>
            <div className="llm-intro-links"><Link className="llm-profile-link" href="/about#profile">{zh ? "先了解我的背景" : "Read my profile"}<span aria-hidden="true">↗</span></Link><button className="llm-intro-suggestion" type="button" onClick={() => submit(t(introSuggestion, locale))}><span>{t(introSuggestion, locale)}</span><i aria-hidden="true">↗</i></button></div>
            <div className="llm-suggestion-grid" aria-label={zh ? "建議問題" : "Suggested questions"}>
              {recommendedQuestions.slice(0, 4).map((item, index) => <button type="button" key={item.zh} onClick={() => submit(t(item, locale))}><b>{String(index + 1).padStart(2, "0")}</b><span>{t(item, locale)}</span><i aria-hidden="true">↗</i></button>)}
            </div>
          </div> : <div className="llm-message-list">
            {messages.map((message, index) => <article className={`llm-message llm-message-${message.role}`} key={`${message.role}-${index}`}>
              <div className="llm-avatar" aria-hidden="true">{message.role === "user" ? (zh ? "訪" : "V") : "KA"}</div>
              <div className="llm-message-body">
                <div className="llm-message-name"><strong>{message.role === "user" ? (zh ? "訪客" : "Visitor") : "Knowledge Atlas"}</strong>{message.role === "assistant" && <span>{zh ? "根據公開資料" : "From public materials"}</span>}</div>
                <div className="llm-message-copy">{message.text}{message.role === "assistant" && streaming && index === latestAssistantIndex && <span className="cursor" />}</div>
                {message.role === "assistant" && !streaming && message.text && <>
                  {message.sources && message.sources.length > 0 && <div className="llm-citations"><p>{zh ? "引用資料" : "Sources"}</p>{message.sources.map((source, sourceIndex) => <Link href={getSourceHref(source)} key={`${source.title.zh}-${sourceIndex}`}><b>{String(sourceIndex + 1).padStart(2, "0")}</b><span><strong>{t(source.title, locale)}</strong><small>{t(source.detail, locale)}</small></span><i aria-hidden="true">↗</i></Link>)}</div>}
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
            <div className="llm-composer-meta"><span><i />{zh ? "檢索範圍：專案檔案與個人資料" : "Scope: project archives and profile"}</span><span>{zh ? "Enter 送出 · Shift + Enter 換行" : "Enter to send · Shift + Enter for a new line"}</span></div>
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
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{liveMessage}</div>
        <p className="console-disclaimer">{zh ? "啟用模型時，問題會傳送至 Kimi API，並只使用檢索到的公開資料片段整理回答；請勿輸入個人或機密資訊。" : "When the model is enabled, questions are sent to the Kimi API and answered only from retrieved public material excerpts. Do not enter personal or confidential information."}</p>
        {messages.length === 0 && <><p className="console-intro">{zh ? "可以詢問架構、控制流程、資料來源，或某項設計為何這樣安排。回答會引用對應的專案章節。" : "Ask about the architecture, control flow, sources, or why a design choice was made. Answers cite the relevant project sections."} <Link href="/about#profile">{zh ? "先了解我的背景" : "Read my profile"} ↗</Link></p><button className="console-intro-suggestion" type="button" onClick={() => submit(t(introSuggestion, locale))}>{t(introSuggestion, locale)}<span aria-hidden="true">↗</span></button></>}
        {messages.map((message, index) => <div className="message" key={`${message.role}-${index}`}>
          <div className="message-label">{message.role === "user" ? (zh ? "YOU / 訪客" : "YOU / Visitor") : (zh ? "ATLAS / 公開資料" : "ATLAS / Public materials")}</div>
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
      <div className="question-bank"><h2>{zh ? "可以從這些問題開始" : "Questions to start with"}</h2><p>{zh ? "每個回答都會附上對應的公開資料章節。" : "Each answer includes the public material section it comes from."}</p><div className="question-list">{recommendedQuestions.map((item) => <button className="question-button" type="button" key={item.zh} onClick={() => submit(t(item, locale))} disabled={streaming}>{t(item, locale)}<span className="arrow">↗</span></button>)}</div></div>
      {messages.some((message) => message.role === "assistant" && message.text) && <div className="source-cards"><h2>{zh ? "回答引用 / Sources" : "Sources / 回答引用"}</h2>{messages.filter((message) => message.role === "assistant").slice(-1).flatMap((message) => message.sources ?? []).map((source, index) => <div className="source-card" key={`${source.title.zh}-${index}`}><span>{source.type.toUpperCase()} / SOURCE {String(index + 1).padStart(2, "0")}</span><strong>{t(source.title, locale)}</strong><span>{t(source.detail, locale)}</span></div>)}</div>}
      {chatAnswers.length > 0 && <p className="coord" style={{ marginTop: 28 }}>LOCAL INDEX / {chatAnswers.length} ANSWER PATTERNS / PUBLIC MATERIALS</p>}
    </aside>
  </div>;
}
