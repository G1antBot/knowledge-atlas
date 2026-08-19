"use client";

import { useState } from "react";
import type { MediaAsset } from "@/data/content";
import { useLocale } from "@/components/locale-context";
import { t } from "@/lib/i18n";

function MediaStage({ asset }: { asset: MediaAsset }) {
  const { locale } = useLocale();
  const [active, setActive] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const zh = locale === "zh";
  const actionLabel = active ? (zh ? `暫停${t(asset.title, locale)}示範` : `Pause ${t(asset.title, locale)} demo`) : (zh ? `播放${t(asset.title, locale)}示範` : `Play ${t(asset.title, locale)} demo`);
  return <figure className={`media-stage ${videoReady ? "has-video" : ""}`} data-media-mode={active ? (asset.videoPath ? "video" : "animated-gif") : "static-poster"}>
    <div className="media-visual">
      <picture className="media-picture"><img src={active && !asset.videoPath ? asset.fallbackPath : asset.posterPath} alt={t(asset.alt, locale)} loading="lazy" decoding="async" /></picture>
      {active && asset.videoPath && <video className="media-video" controls muted autoPlay playsInline preload="metadata" poster={asset.posterPath} onCanPlay={() => setVideoReady(true)}><source src={asset.videoPath} type="video/mp4" /></video>}
      <button className="media-play" type="button" onClick={() => { setActive((current) => !current); setVideoReady(false); }} aria-pressed={active} aria-label={actionLabel}><span aria-hidden="true">{active ? "Ⅱ" : "▶"}</span><b>{active ? (zh ? "靜態" : "Poster") : (zh ? "播放" : "Play")}</b></button>
      <span className="media-stage-mark">{t(asset.stage, locale)}</span>
    </div>
    <figcaption><span className="media-title">{t(asset.title, locale)}</span><span>{t(asset.caption, locale)}</span></figcaption>
  </figure>;
}

export function MediaStrip({ assets }: { assets: MediaAsset[] }) {
  const { locale } = useLocale();
  return <div className="media-strip" aria-label={locale === "zh" ? "無人機實驗媒體列" : "UAV experiment media strip"}>{assets.map((asset) => <MediaStage asset={asset} key={asset.id} />)}</div>;
}
