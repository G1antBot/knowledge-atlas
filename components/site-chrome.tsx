"use client";

import { useEffect, useRef } from "react";

export function ReadingProgress() {
  const progressRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const update = () => {
      const documentHeight = document.documentElement.scrollHeight;
      const scrollableHeight = Math.max(documentHeight - window.innerHeight, 0);
      const value = scrollableHeight === 0 ? 0 : Math.min(Math.max(window.scrollY / scrollableHeight, 0), 1);
      const percentage = Math.round(value * 100);
      const node = progressRef.current;
      const valueNode = valueRef.current;
      if (!node || !valueNode) return;
      node.style.setProperty("--reading-progress", String(value));
      node.setAttribute("aria-valuenow", String(percentage));
      node.setAttribute("aria-valuetext", `${percentage}%`);
      valueNode.textContent = String(percentage).padStart(2, "0");
    };

    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("load", schedule);
    schedule();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("load", schedule);
    };
  }, []);

  return <div ref={progressRef} className="reading-progress" role="progressbar" aria-label="Page reading progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0} aria-valuetext="0%">
    <span className="reading-progress-track" aria-hidden="true"><i /></span>
    <span ref={valueRef} className="reading-progress-value" aria-hidden="true">00</span>
  </div>;
}

export function DesktopCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = cursorRef.current;
    if (!node) return;
    const finePointer = window.matchMedia("(pointer: fine) and (min-width: 1024px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const root = document.documentElement;

    const updateAvailability = () => {
      const enabled = finePointer.matches && !reducedMotion.matches;
      root.classList.toggle("cursor-enabled", enabled);
      if (!enabled) node.classList.remove("is-visible", "is-interactive", "is-text");
    };
    const onMove = (event: PointerEvent) => {
      if (!root.classList.contains("cursor-enabled")) return;
      node.style.setProperty("--cursor-x", `${event.clientX}px`);
      node.style.setProperty("--cursor-y", `${event.clientY}px`);
      node.classList.add("is-visible");
      const target = event.target instanceof Element ? event.target : null;
      const interactive = Boolean(target?.closest("a[href], button:not(:disabled), summary, label[for], [role='button']:not([aria-disabled='true']), [data-cursor='interactive']"));
      const textInput = Boolean(target?.closest("input, textarea, select, [contenteditable='true'], [data-cursor='text'], [data-cursor='native']"));
      node.classList.toggle("is-interactive", interactive && !textInput);
      node.classList.toggle("is-text", textInput);
    };
    const onLeave = () => node.classList.remove("is-visible", "is-interactive", "is-text");

    updateAvailability();
    finePointer.addEventListener("change", updateAvailability);
    reducedMotion.addEventListener("change", updateAvailability);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      finePointer.removeEventListener("change", updateAvailability);
      reducedMotion.removeEventListener("change", updateAvailability);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      root.classList.remove("cursor-enabled");
    };
  }, []);

  return <div ref={cursorRef} className="site-cursor" aria-hidden="true">
    <svg className="site-cursor-arrow" viewBox="0 0 24 24" width="22" height="22" focusable="false">
      <path d="M5.5 3.2 18.8 11.4 12.6 12.8 9.9 19.6Z" />
    </svg>
    <i className="site-cursor-dot" />
  </div>;
}
