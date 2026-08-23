import type { Metadata } from "next";

export const SITE_NAME = "Knowledge Atlas";
export const DEFAULT_TITLE = "Knowledge Atlas｜個人 AI 知識系統";
export const DEFAULT_DESCRIPTION = "整理我做過的專案、讀過的論文與實驗片段，保留問題、取捨、證據與來源，並提供基於公開檔案的提問入口。";

function completeTitle(title: string) {
  return title === SITE_NAME ? SITE_NAME : `${title}｜${SITE_NAME}`;
}

export const rootMetadata: Metadata = {
  title: {
    default: DEFAULT_TITLE,
    template: `%s｜${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    locale: "zh_TW",
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
};

export function createZhPageMetadata(title: string, description: string): Metadata {
  const fullTitle = completeTitle(title);

  return {
    title: { absolute: fullTitle },
    description,
    openGraph: {
      title: fullTitle,
      description,
      locale: "zh_TW",
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: fullTitle,
      description,
    },
  };
}
