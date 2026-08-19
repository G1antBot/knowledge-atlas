"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Locale } from "@/data/content";

type LocaleContextValue = { locale: Locale; setLocale: (locale: Locale) => void; toggleLocale: () => void };
const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh");

  useEffect(() => {
    const stored = window.localStorage.getItem("knowledge-atlas-locale");
    if (stored === "zh" || stored === "en") setLocaleState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-Hant" : "en";
  }, [locale]);

  const value = useMemo<LocaleContextValue>(() => ({
    locale,
    setLocale: (next) => { setLocaleState(next); window.localStorage.setItem("knowledge-atlas-locale", next); },
    toggleLocale: () => { const next = locale === "zh" ? "en" : "zh"; setLocaleState(next); window.localStorage.setItem("knowledge-atlas-locale", next); },
  }), [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used inside LocaleProvider");
  return context;
}
