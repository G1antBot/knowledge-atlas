import type { ReactNode } from "react";
import type { Bilingual, Locale } from "@/data/content";
import { t } from "@/lib/i18n";

export function Eyebrow({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "red" | "ink" }) {
  return <div className={`eyebrow eyebrow-${tone}`}><span className="eyebrow-mark" />{children}</div>;
}

export function SectionHeading({ id, eyebrow, title, description, locale }: { id?: string; eyebrow: Bilingual; title: Bilingual; description?: Bilingual; locale: Locale }) {
  return <div className="section-heading"><Eyebrow>{t(eyebrow, locale)}</Eyebrow><h2 id={id}>{t(title, locale)}</h2>{description && <p>{t(description, locale)}</p>}</div>;
}

export function SourceTag({ children }: { children: ReactNode }) {
  return <span className="source-tag"><span className="source-dot" />{children}</span>;
}

export function Arrow() {
  return <span className="arrow" aria-hidden="true">↗</span>;
}

export function Coord({ children }: { children: ReactNode }) {
  return <span className="coord">{children}</span>;
}
