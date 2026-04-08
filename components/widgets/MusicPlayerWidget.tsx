"use client";

import { createElement, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type EmbedParams = Record<string, string | number | boolean | undefined>;

type MusicServer = "netease" | "tencent";
type MusicType = "song" | "playlist" | "album" | "search" | "artist";
type ColorScheme = "light" | "dark" | "auto";
type UiLanguage = "auto" | "en";
type TranslateSource = "auto" | "google" | "mymemory";
type TransparentBgMode = "off" | "dark" | "light";
type SurfaceTheme = "default" | "notion-modern";

type PlayerConfig = {
  server: MusicServer;
  type: MusicType;
  id: string;
  uiLanguage: UiLanguage;
  translateEnabled: boolean;
  translateTarget: string;
  translateUrl: string;
  translateKey?: string | null;
  translateSource: TranslateSource;
  colorscheme: ColorScheme;
  theme: string;
  loop: "all" | "one" | "none";
  order: "list" | "random";
  preload: "none" | "metadata" | "auto";
  volume: string;
  listFolded: boolean;
  listMaxHeight: string;
  width: string;
  storageName: string;
  showBorder: boolean;
  transparentBgMode: TransparentBgMode;
  surfaceTheme: SurfaceTheme;
  fullPage: boolean;
};

function asPx(value: string | null, fallback: string) {
  if (!value) return fallback;
  const normalized = value.trim();
  if (!normalized) return fallback;
  if (/^\d+(\.\d+)?$/.test(normalized)) {
    return `${normalized}px`;
  }
  if (/^\d+(\.\d+)?(px|rem|em|vh|vw|%)$/.test(normalized)) {
    return normalized;
  }
  return fallback;
}

function clampVolume(value: string | null, fallback = "0.7") {
  if (!value) return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return String(Math.max(0, Math.min(1, n)));
}

function parseBool(value: string | null, fallback: boolean) {
  if (value == null) return fallback;
  const v = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(v)) return true;
  if (["0", "false", "no", "off"].includes(v)) return false;
  return fallback;
}

function pick<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  if (!value) return fallback;
  const v = value.toLowerCase();
  return (allowed.includes(v as T) ? v : fallback) as T;
}

function loadScriptOnce(src: string, marker: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[${marker}]`)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.setAttribute(marker, "1");
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

export default function MusicPlayerWidget({ embedParams }: { embedParams?: EmbedParams }) {
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSystemDark, setIsSystemDark] = useState(false);

  const getParam = (keys: string[]) => {
    if (embedParams) {
      for (const key of keys) {
        if (key in embedParams) {
          const value = embedParams[key];
          return value === undefined ? null : String(value);
        }
      }
      return null;
    }

    for (const key of keys) {
      const value = searchParams.get(key);
      if (value !== null) return value;
    }
    return null;
  };

  const server = pick(getParam(["server"]), ["netease", "tencent"] as const, "netease");
  const type = pick(getParam(["type"]), ["song", "playlist", "album", "search", "artist"] as const, "playlist");
  const id = (getParam(["id"]) || "").trim();
  const uiLanguage = pick(getParam(["ui-lang", "uiLang", "uilang"]), ["auto", "en"] as const, "auto");
  const translateEnabled = parseBool(getParam(["translate", "translateSongs"]), uiLanguage === "en");
  const translateTarget = (getParam(["translate-target", "translateTarget"]) || "en").toLowerCase();
  const translateUrl = getParam(["translate-url", "translateUrl"]) || "/api/translate";
  const translateKey = getParam(["translate-key", "translateKey"]);
  const translateSource = pick(
    getParam(["translate-source", "translateSource"]),
    ["auto", "google", "mymemory"] as const,
    uiLanguage === "en" ? "google" : "auto",
  );

  const config: PlayerConfig | null = id
    ? {
        server,
        type,
        id,
        uiLanguage,
        translateEnabled,
        translateTarget,
        translateUrl,
        translateKey,
        translateSource,
        colorscheme: pick(
          getParam(["colorscheme", "colorScheme"]),
          ["light", "dark", "auto"] as const,
          "auto",
        ),
        theme: getParam(["theme"]) || "#2980b9",
        loop: pick(getParam(["loop"]), ["all", "one", "none"] as const, "all"),
        order: pick(getParam(["order"]), ["list", "random"] as const, "list"),
        preload: pick(getParam(["preload"]), ["none", "metadata", "auto"] as const, "auto"),
        volume: clampVolume(getParam(["volume"]), "0.7"),
        listFolded: parseBool(getParam(["list-folded", "listFolded"]), false),
        listMaxHeight: asPx(getParam(["list-max-height", "listMaxHeight"]), "340px"),
        width: asPx(getParam(["width", "w"]), "760px"),
        storageName: getParam(["storage-name", "storageName"]) || "metingjs",
        showBorder: parseBool(getParam(["border"]), true),
        transparentBgMode: pick(
          getParam(["transparentbgmode", "transparentBgMode"]),
          ["off", "dark", "light"] as const,
          parseBool(getParam(["transparentbg", "transparentBg"]), false) ? "dark" : "off",
        ),
        surfaceTheme: pick(
          getParam(["surface-theme", "surfaceTheme"]),
          ["default", "notion-modern"] as const,
          "default",
        ),
        fullPage: parseBool(getParam(["fullpage", "full-page", "fullPage"]), false),
      }
    : null;

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setIsSystemDark(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    let canceled = false;

    async function loadPlayer() {
      try {
        if (!document.querySelector("link[data-aplayer-css]")) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://cdn.jsdelivr.net/npm/aplayer/dist/APlayer.min.css";
          link.setAttribute("data-aplayer-css", "1");
          document.head.appendChild(link);
        }

        const aplayerModule = await import("aplayer");
        const APlayerCtor = (aplayerModule as { default?: unknown }).default ?? aplayerModule;
        (window as Window & { APlayer?: unknown }).APlayer = APlayerCtor;

        await loadScriptOnce("https://cdn.jsdelivr.net/npm/meting@2/dist/Meting.min.js", "data-meting-js");

        if (!canceled) {
          setReady(true);
          setLoadError(null);
        }
      } catch {
        if (!canceled) {
          setReady(false);
          setLoadError("Unable to load APlayer/MetingJS. Check network access and try again.");
        }
      }
    }

    loadPlayer();
    return () => {
      canceled = true;
    };
  }, []);

  const transparentMode: TransparentBgMode = config?.transparentBgMode ?? "off";
  const transparentBgColor = transparentMode === "light" ? "#ffffff" : "#191919";
  const shouldTranslate = config?.translateEnabled ?? false;
  const translateTargetValue = config?.translateTarget ?? "en";
  const translateUrlValue = config?.translateUrl ?? "";
  const translateKeyValue = config?.translateKey ?? null;
  const translateSourceValue = config?.translateSource ?? "auto";
  const storageNameValue = config?.storageName ?? "metingjs";

  useEffect(() => {
    if (transparentMode === "off") return;
    const prevBody = document.body.style.backgroundColor;
    const prevHtml = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = transparentBgColor;
    document.documentElement.style.backgroundColor = transparentBgColor;
    return () => {
      document.body.style.backgroundColor = prevBody;
      document.documentElement.style.backgroundColor = prevHtml;
    };
  }, [transparentMode, transparentBgColor]);

  useEffect(() => {
    if (!ready || !shouldTranslate || !translateUrlValue) return;
    const container = document.querySelector(".music-player-surface .aplayer");
    if (!container) return;

    const cacheKey = `music-translate:${storageNameValue}:${translateTargetValue}`;
    const cache = new Map<string, string>();

    try {
      const raw = window.localStorage.getItem(cacheKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, string>;
        Object.entries(parsed).forEach(([k, v]) => cache.set(k, v));
      }
    } catch {
      // ignore cache errors
    }

    const shouldTranslateText = (text: string) => /[^\x00-\x7F]/.test(text);

    const translateText = async (text: string) => {
      if (!shouldTranslateText(text)) return text;
      if (cache.has(text)) return cache.get(text) || text;
      try {
        const payload: Record<string, string> = {
          q: text,
          target: translateTargetValue,
          source: "auto",
          format: "text",
          engine: translateSourceValue,
        };
        if (translateKeyValue) payload.api_key = translateKeyValue;

        const response = await fetch(translateUrlValue, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) return text;
        const data = (await response.json()) as {
          translatedText?: string;
          responseData?: { translatedText?: string };
          data?: { translatedText?: string };
        };
        const translated =
          data?.translatedText ||
          data?.data?.translatedText ||
          data?.responseData?.translatedText ||
          text;
        if (translated && translated !== text) {
          cache.set(text, translated);
          try {
            const nextCache = Object.fromEntries(cache.entries());
            window.localStorage.setItem(cacheKey, JSON.stringify(nextCache));
          } catch {
            // ignore storage errors
          }
        }
        return translated;
      } catch {
        return text;
      }
    };

    const translateElement = (el: Element) => {
      const node = el as HTMLElement;
      if (node.dataset.translated === "1") return;
      const text = (node.textContent || "").trim();
      if (!text) return;
      translateText(text).then((translated) => {
        if (!translated || translated === text) return;
        node.textContent = translated;
        node.dataset.translated = "1";
      });
    };

    const scan = () => {
      container.querySelectorAll(".aplayer-title, .aplayer-list-title").forEach(translateElement);
    };

    scan();
    const observer = new MutationObserver(() => scan());
    observer.observe(container, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [ready, shouldTranslate, translateTargetValue, translateUrlValue, translateKeyValue, storageNameValue]);

  if (!config) {
    return (
      <main className="w-full max-w-2xl rounded-2xl border border-white/10 bg-zinc-900/85 p-6 text-sm text-zinc-100">
        <h2 className="text-base font-semibold text-white">Music Player Widget</h2>
        <p className="mt-2 text-zinc-300">Missing required query params: server, type, and id.</p>
        <p className="mt-2 break-all text-zinc-400">
          Example: /music-player?server=netease&type=playlist&id=12528089157&embed=1
        </p>
      </main>
    );
  }

  const scheme = config.colorscheme === "auto" ? (isSystemDark ? "dark" : "light") : config.colorscheme;
  const playerBackground = transparentMode !== "off"
    ? transparentBgColor
    : scheme === "dark"
      ? "#191919"
      : "#ffffff";

  const playerKey = [
    config.server,
    config.type,
    config.id,
    config.theme,
    config.loop,
    config.order,
    config.preload,
    config.volume,
    config.listFolded ? "1" : "0",
    config.listMaxHeight,
    config.storageName,
    scheme,
    config.showBorder ? "1" : "0",
    config.transparentBgMode,
    config.surfaceTheme,
  ].join("::");

  const shellClassName = `music-widget-shell w-full rounded-2xl bg-transparent p-3 ${
    config.fullPage ? "min-h-screen flex items-center justify-center" : ""
  }`;

  return (
    <div
      className={shellClassName}
      style={{
        width: config.fullPage ? "100%" : config.width,
        maxWidth: "100%",
      }}
    >
      {!ready && !loadError ? (
        <div className="rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-5 text-sm text-zinc-200">Loading music player...</div>
      ) : null}

      {loadError ? (
        <div className="rounded-xl border border-rose-400/30 bg-rose-950/60 px-4 py-5 text-sm text-rose-100">{loadError}</div>
      ) : null}

      {ready && !loadError ? (
        <div
          data-scheme={scheme}
          data-ui-language={config.uiLanguage}
          data-surface-theme={config.surfaceTheme}
          className="music-player-surface rounded-xl p-2"
          style={{
            width: "100%",
            border: config.showBorder ? "1px solid rgba(255,255,255,0.14)" : "1px solid transparent",
            backgroundColor: playerBackground,
          }}
        >
          {createElement("meting-js", {
            key: playerKey,
            server: config.server,
            type: config.type,
            id: config.id,
            fixed: "false",
            autoplay: "false",
            theme: config.theme,
            loop: config.loop,
            order: config.order,
            preload: config.preload,
            volume: config.volume,
            "list-folded": config.listFolded ? "true" : "false",
            "list-max-height": config.listMaxHeight,
            "storage-name": config.storageName,
            lang: config.uiLanguage === "en" ? "en" : undefined,
          })}
        </div>
      ) : null}

      <style jsx>{`
        .music-player-surface[data-scheme="dark"] :global(.aplayer) {
          background: transparent;
          color: #e5e7eb;
        }

        .music-player-surface[data-scheme="dark"] :global(.aplayer .aplayer-list ol li) {
          border-top-color: rgba(255, 255, 255, 0.06);
          color: rgba(229, 231, 235, 0.88);
        }

        .music-player-surface[data-scheme="dark"] :global(.aplayer .aplayer-list ol li.aplayer-list-light) {
          background: rgba(255, 255, 255, 0.14);
        }

        .music-player-surface[data-scheme="light"] :global(.aplayer) {
          background: transparent;
        }

        .music-player-surface[data-scheme="dark"] :global(.aplayer .aplayer-list ol li:hover) {
          background: rgba(255, 255, 255, 0.1);
        }

        .music-player-surface[data-scheme="dark"] :global(.aplayer .aplayer-list ol li .aplayer-list-title),
        .music-player-surface[data-scheme="dark"] :global(.aplayer .aplayer-list ol li .aplayer-list-author),
        .music-player-surface[data-scheme="dark"] :global(.aplayer .aplayer-list ol li .aplayer-list-index) {
          color: rgba(229, 231, 235, 0.88) !important;
        }

        .music-player-surface[data-scheme="dark"] :global(.aplayer .aplayer-list ol li:hover .aplayer-list-title),
        .music-player-surface[data-scheme="dark"] :global(.aplayer .aplayer-list ol li:hover .aplayer-list-author),
        .music-player-surface[data-scheme="dark"] :global(.aplayer .aplayer-list ol li:hover .aplayer-list-index) {
          color: #ffffff !important;
        }

        .music-player-surface[data-scheme="light"] :global(.aplayer .aplayer-list ol li) {
          color: rgba(30, 41, 59, 0.88);
          border-top-color: rgba(15, 23, 42, 0.08);
        }

        .music-player-surface[data-scheme="light"] :global(.aplayer .aplayer-list ol li:hover) {
          background: rgba(35, 131, 226, 0.1);
        }

        .music-player-surface[data-scheme="light"] :global(.aplayer .aplayer-list ol li .aplayer-list-title),
        .music-player-surface[data-scheme="light"] :global(.aplayer .aplayer-list ol li .aplayer-list-author),
        .music-player-surface[data-scheme="light"] :global(.aplayer .aplayer-list ol li .aplayer-list-index) {
          color: rgba(15, 23, 42, 0.9) !important;
        }

        .music-player-surface[data-scheme="light"] :global(.aplayer .aplayer-list ol li:hover .aplayer-list-title),
        .music-player-surface[data-scheme="light"] :global(.aplayer .aplayer-list ol li:hover .aplayer-list-author),
        .music-player-surface[data-scheme="light"] :global(.aplayer .aplayer-list ol li:hover .aplayer-list-index) {
          color: #0f172a !important;
        }

        .music-player-surface[data-surface-theme="notion-modern"] {
          border-radius: 14px;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
        }

        .music-player-surface[data-surface-theme="notion-modern"] :global(.aplayer) {
          border-radius: 12px;
          box-shadow: none;
          font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .music-player-surface[data-surface-theme="notion-modern"] :global(.aplayer .aplayer-info .aplayer-music) {
          letter-spacing: 0.01em;
        }
      `}</style>
    </div>
  );
}
