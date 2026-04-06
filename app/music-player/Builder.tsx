"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, RefreshCw, Info } from "lucide-react";
import MusicPlayerWidget from "@/components/widgets/MusicPlayerWidget";

type FancyOption = { value: string; label: string };

type MusicServer = "netease" | "tencent";
type MusicType = "song" | "playlist" | "album" | "search" | "artist";
type ColorScheme = "auto" | "dark" | "light";
type UiLanguage = "auto" | "en";
type TransparentBgMode = "off" | "dark" | "light";
type SurfaceTheme = "default" | "notion-modern";
type ThemePreset = "classic" | "notion-modern" | "graphite" | "mint";

const THEME_PRESETS: Record<string, string> = {
  classic: "#2980b9",
  "notion-modern": "#2383e2",
  graphite: "#52525b",
  mint: "#10b981",
};

function FancySelect({
  value,
  onChange,
  options,
  placeholder = "Select",
}: {
  value: string;
  onChange: (value: string) => void;
  options: FancyOption[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  const current = options.find((o) => o.value === value);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-lg border border-white/12 bg-white/10 px-3 py-2 text-sm text-white/90 shadow-[0_1px_0_rgba(255,255,255,0.08)] transition focus:border-white/40 focus:ring-2 focus:ring-white/15 focus:outline-none"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="truncate">{current?.label ?? placeholder}</span>
        <span className="ml-2 text-xs text-white/60">▾</span>
      </button>

      {open ? (
        <div className="absolute left-0 z-20 mt-2 w-full overflow-hidden rounded-lg border border-white/10 bg-zinc-900/95 shadow-2xl backdrop-blur">
          <div className="max-h-56 min-w-[160px] overflow-y-auto scrollbar-hide">
            {options.map((opt) => {
              const active = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`flex w-full items-center justify-between px-3 py-2 text-sm text-white/90 transition hover:bg-white/10 ${
                    active ? "bg-white/10" : ""
                  }`}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  <span className="truncate">{opt.label}</span>
                  {active ? <span className="pl-2 text-xs text-white/70">●</span> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

const defaults = {
  server: "netease" as MusicServer,
  type: "playlist" as MusicType,
  id: "12528089157",
  uiLanguage: "auto" as UiLanguage,
  colorscheme: "auto" as ColorScheme,
  theme: "#2980b9",
  surfaceTheme: "default" as SurfaceTheme,
  loop: "all" as "all" | "one" | "none",
  order: "list" as "list" | "random",
  preload: "auto" as "none" | "metadata" | "auto",
  volume: "0.7",
  width: 760,
  listFolded: false,
  listMaxHeight: "340px",
  storageName: "metingjs",
  showBorder: true,
  transparentBgMode: "off" as TransparentBgMode,
  fullPage: false,
};

export default function MusicPlayerBuilder() {
  const [server, setServer] = useState<MusicServer>(defaults.server);
  const [type, setType] = useState<MusicType>(defaults.type);
  const [id, setId] = useState(defaults.id);
  const [uiLanguage, setUiLanguage] = useState<UiLanguage>(defaults.uiLanguage);
  const [colorscheme, setColorScheme] = useState<ColorScheme>(defaults.colorscheme);
  const [theme, setTheme] = useState(defaults.theme);
  const [themePreset, setThemePreset] = useState<ThemePreset>("classic");
  const [surfaceTheme, setSurfaceTheme] = useState<SurfaceTheme>(defaults.surfaceTheme);
  const [loop, setLoop] = useState<"all" | "one" | "none">(defaults.loop);
  const [order, setOrder] = useState<"list" | "random">(defaults.order);
  const [preload, setPreload] = useState<"none" | "metadata" | "auto">(defaults.preload);
  const [volume, setVolume] = useState(defaults.volume);
  const [width, setWidth] = useState(defaults.width);
  const [listFolded, setListFolded] = useState(defaults.listFolded);
  const [listMaxHeight, setListMaxHeight] = useState(defaults.listMaxHeight);
  const [storageName, setStorageName] = useState(defaults.storageName);
  const [showBorder, setShowBorder] = useState(defaults.showBorder);
  const [transparentBgMode, setTransparentBgMode] = useState<TransparentBgMode>(defaults.transparentBgMode);
  const [fullPage, setFullPage] = useState(defaults.fullPage);
  const [copied, setCopied] = useState(false);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    p.set("embed", "1");
    p.set("server", server);
    p.set("type", type);
    p.set("id", id.trim());
    if (uiLanguage !== "auto") p.set("ui-lang", uiLanguage);
    if (colorscheme !== "auto") p.set("colorscheme", colorscheme);
    p.set("theme", theme.trim() || defaults.theme);
    p.set("surface-theme", surfaceTheme);
    p.set("loop", loop);
    p.set("order", order);
    p.set("preload", preload);
    p.set("volume", volume.trim() || defaults.volume);
    p.set("width", String(width));
    p.set("list-folded", listFolded ? "true" : "false");
    p.set("list-max-height", listMaxHeight.trim() || defaults.listMaxHeight);
    p.set("storage-name", storageName.trim() || defaults.storageName);
    p.set("border", showBorder ? "1" : "0");
    if (fullPage) p.set("fullpage", "1");
    if (transparentBgMode !== "off") {
      p.set("transparentbg", "1");
      p.set("transparentbgmode", transparentBgMode);
    }
    return p;
  }, [server, type, id, uiLanguage, colorscheme, theme, surfaceTheme, loop, order, preload, volume, width, listFolded, listMaxHeight, storageName, showBorder, transparentBgMode, fullPage]);

  const livePreviewParams = useMemo(
    () => ({
      server,
      type,
      id: id.trim(),
      colorscheme,
      theme: theme.trim() || defaults.theme,
      "surface-theme": surfaceTheme,
      loop,
      order,
      preload,
      volume: volume.trim() || defaults.volume,
      width,
      "list-folded": listFolded,
      "list-max-height": listMaxHeight.trim() || defaults.listMaxHeight,
      "storage-name": storageName.trim() || defaults.storageName,
      border: showBorder ? 1 : 0,
      fullpage: fullPage ? 1 : 0,
      transparentbg: transparentBgMode !== "off" ? 1 : 0,
      transparentbgmode: transparentBgMode,
    }),
    [server, type, id, colorscheme, theme, surfaceTheme, loop, order, preload, volume, width, listFolded, listMaxHeight, storageName, showBorder, transparentBgMode, fullPage],
  );

  const previewWidget = useMemo(
    () => <MusicPlayerWidget embedParams={livePreviewParams} />,
    [livePreviewParams],
  );

  const reset = () => {
    setServer(defaults.server);
    setType(defaults.type);
    setId(defaults.id);
    setUiLanguage(defaults.uiLanguage);
    setColorScheme(defaults.colorscheme);
    setTheme(defaults.theme);
    setThemePreset("classic");
    setSurfaceTheme(defaults.surfaceTheme);
    setLoop(defaults.loop);
    setOrder(defaults.order);
    setPreload(defaults.preload);
    setVolume(defaults.volume);
    setWidth(defaults.width);
    setListFolded(defaults.listFolded);
    setListMaxHeight(defaults.listMaxHeight);
    setStorageName(defaults.storageName);
    setShowBorder(defaults.showBorder);
    setTransparentBgMode(defaults.transparentBgMode);
    setFullPage(defaults.fullPage);
  };

  const applyThemePreset = (preset: string) => {
    setThemePreset(preset as ThemePreset);
    const next = THEME_PRESETS[preset];
    if (next) setTheme(next);
    if (preset === "notion-modern") {
      setSurfaceTheme("notion-modern");
    }
  };

  const copyLink = () => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.origin + "/music-player");
    params.forEach((v, k) => url.searchParams.set(k, v));
    navigator.clipboard
      .writeText(url.toString())
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      })
      .catch(() => undefined);
  };

  return (
    <main className="flex min-h-screen w-full items-start justify-center bg-zinc-950 px-4 py-10 text-zinc-100">
      <div className="grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-[340px,1fr]">
        <section className="flex max-h-[88vh] flex-col gap-4 overflow-y-auto scrollbar-hide rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Music Player Builder</h2>
              <p className="text-sm text-zinc-400">Configure APlayer + MetingJS embed links in English.</p>
            </div>
            <button
              className="rounded-full border border-white/10 p-2 text-zinc-200 transition hover:bg-white/10"
              onClick={reset}
              aria-label="Reset"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Server</span>
                <FancySelect
                  value={server}
                  onChange={(v) => setServer(v as MusicServer)}
                  options={[
                    { value: "netease", label: "Netease" },
                    { value: "tencent", label: "Tencent" },
                  ]}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Type</span>
                <FancySelect
                  value={type}
                  onChange={(v) => setType(v as MusicType)}
                  options={[
                    { value: "song", label: "Song" },
                    { value: "playlist", label: "Playlist" },
                    { value: "album", label: "Album" },
                    { value: "search", label: "Search" },
                    { value: "artist", label: "Artist" },
                  ]}
                />
              </label>
            </div>

            <label className="space-y-1 text-sm">
              <span className="text-zinc-300">ID / Keyword (required)</span>
              <input
                className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="Playlist ID, Song ID, or search keyword"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Color scheme</span>
                <FancySelect
                  value={colorscheme}
                  onChange={(v) => setColorScheme(v as ColorScheme)}
                  options={[
                    { value: "auto", label: "Follow System" },
                    { value: "dark", label: "Dark" },
                    { value: "light", label: "Light" },
                  ]}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">UI language</span>
                <FancySelect
                  value={uiLanguage}
                  onChange={(v) => setUiLanguage(v as UiLanguage)}
                  options={[
                    { value: "auto", label: "Auto" },
                    { value: "en", label: "Force English" },
                  ]}
                />
                <span className="text-xs text-zinc-500">Applied on page reload or embed.</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Widget style</span>
                <FancySelect
                  value={surfaceTheme}
                  onChange={(v) => setSurfaceTheme(v as SurfaceTheme)}
                  options={[
                    { value: "default", label: "Default" },
                    { value: "notion-modern", label: "Notion Modern" },
                  ]}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Theme preset</span>
                <FancySelect
                  value={themePreset}
                  onChange={applyThemePreset}
                  options={[
                    { value: "classic", label: "Classic Blue" },
                    { value: "notion-modern", label: "Notion Modern" },
                    { value: "graphite", label: "Graphite" },
                    { value: "mint", label: "Mint" },
                  ]}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Theme color</span>
                <input
                  type="color"
                  className="color-swatch"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                />
              </label>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Loop</span>
                <FancySelect
                  value={loop}
                  onChange={(v) => setLoop(v as "all" | "one" | "none")}
                  options={[
                    { value: "all", label: "All" },
                    { value: "one", label: "One" },
                    { value: "none", label: "None" },
                  ]}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Order</span>
                <FancySelect
                  value={order}
                  onChange={(v) => setOrder(v as "list" | "random")}
                  options={[
                    { value: "list", label: "List" },
                    { value: "random", label: "Random" },
                  ]}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Preload</span>
                <FancySelect
                  value={preload}
                  onChange={(v) => setPreload(v as "none" | "metadata" | "auto")}
                  options={[
                    { value: "none", label: "None" },
                    { value: "metadata", label: "Metadata" },
                    { value: "auto", label: "Auto" },
                  ]}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Volume (0 - 1)</span>
                <input
                  className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  placeholder="0.7"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">List max height</span>
                <input
                  className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                  value={listMaxHeight}
                  onChange={(e) => setListMaxHeight(e.target.value)}
                  placeholder="340px"
                />
              </label>
            </div>

            <label className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-300">Width</span>
                <span className="text-xs text-zinc-400">{width}px</span>
              </div>
              <input
                className="w-full"
                type="range"
                min={320}
                max={1200}
                step={20}
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="text-zinc-300">Storage name</span>
              <input
                className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                value={storageName}
                onChange={(e) => setStorageName(e.target.value)}
                placeholder="metingjs"
              />
            </label>

            <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-white/20 bg-white/10"
                checked={listFolded}
                onChange={(e) => setListFolded(e.target.checked)}
              />
              Fold list by default
            </label>

            <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-white/20 bg-white/10"
                checked={showBorder}
                onChange={(e) => setShowBorder(e.target.checked)}
              />
              Show border
            </label>

            <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-white/20 bg-white/10"
                checked={fullPage}
                onChange={(e) => setFullPage(e.target.checked)}
              />
              Full page mode
            </label>

            <label className="space-y-1 text-sm">
              <span className="text-zinc-300">Transparent background</span>
              <FancySelect
                value={transparentBgMode}
                onChange={(v) => setTransparentBgMode(v as TransparentBgMode)}
                options={[
                  { value: "off", label: "Off" },
                  { value: "dark", label: "Dark (#191919)" },
                  { value: "light", label: "Light (#ffffff)" },
                ]}
              />
            </label>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-zinc-300">
              <div className="mb-2 flex items-start gap-2 text-zinc-200">
                <Info size={14} className="mt-[1px] shrink-0" />
                <span className="font-medium">Provider ID examples</span>
              </div>
              <p>QQ playlist id example: 8063655104</p>
              <p>Netease song id example: 1919891734</p>
              <p>Netease search keyword example: alan</p>
            </div>
          </div>

          <button
            onClick={copyLink}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200"
          >
            <Copy size={16} />
            {copied ? "Copied" : "Copy Embed URL"}
          </button>

          <code className="break-all rounded-xl border border-white/10 bg-zinc-900/70 p-3 text-xs text-zinc-200">
            /music-player?{params.toString()}
          </code>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-200">Live Preview</h3>
            <p className="text-xs text-zinc-400">Matches copied URL settings.</p>
          </div>
          <div className="min-h-[420px] rounded-xl border border-white/10 bg-zinc-900/50 p-2">
            {previewWidget}
          </div>
        </section>
      </div>
    </main>
  );
}
