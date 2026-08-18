import type { Bilingual, Locale } from "@/data/content";

export function t(value: Bilingual, locale: Locale): string {
  return value[locale];
}
