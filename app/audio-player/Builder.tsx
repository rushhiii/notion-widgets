"use client";

import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Copy, RefreshCw } from "lucide-react";
import AudioPlayerWidget from "@/components/widgets/AudioPlayerWidget";

type PlayerLayout = "small" | "medium" | "large";
type LoopMode = "none" | "track" | "playlist";
type AudioThemePreset = {
  id: string;
  label: string;
  accent: string;
  bg: string;
  text: string;
};

const INTERNAL_PLAYLIST_SOURCE = "/api/audio/playlist";
const PUBLIC_FILTER_TYPE_OPTIONS_BY_CATEGORY: Record<string, string[]> = {
  eng: ["normal", "slowed", "speed up"],
  hindi: ["normal", "slowed"],
  otherz: ["normal"],
  punjab: ["normal"],
  nightcore: ["normal"],
  "🎻": ["normal"],
  "🔱": ["normal", "modern"],
};
const ADMIN_EXTRA_FILTER_TYPE_OPTIONS_BY_CATEGORY: Record<string, string[]> = {
  eng: ["speed up"],
};

function buildFilterTypeMap(includeAdminExtras: boolean): Record<string, string[]> {
  const merged: Record<string, string[]> = { ...PUBLIC_FILTER_TYPE_OPTIONS_BY_CATEGORY };
  if (!includeAdminExtras) return merged;
  Object.entries(ADMIN_EXTRA_FILTER_TYPE_OPTIONS_BY_CATEGORY).forEach(([category, types]) => {
    const current = merged[category] ?? [];
    merged[category] = Array.from(new Set([...current, ...types])).sort((a, b) => a.localeCompare(b));
  });
  return merged;
}

function normalizeFilterCategory(value: string): string {
  const token = value.trim().toLowerCase().replace(/\s+/g, " ");
  if (!token) return "";
  if (token === "punjabi") return "punjab";
  if (token === "others") return "otherz";
  return token;
}

function normalizeFilterType(value: string): string {
  const token = value.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  if (!token) return "";
  if (["speed up", "speedup", "sped up", "spedup"].includes(token)) return "speed up";
  if (["morden", "modern"].includes(token)) return "modern";
  return token;
}

function parseMultiFilterValues(value: string, normalizer: (value: string) => string): string[] {
  if (!value.trim()) return [];
  return Array.from(
    new Set(
      value
        .split(",")
        .map((token) => normalizer(token.trim()))
        .filter((token): token is string => Boolean(token)),
    ),
  );
}

function toggleSelection(values: string[], value: string): string[] {
  if (values.includes(value)) {
    return values.filter((token) => token !== value);
  }
  return [...values, value].sort((left, right) => left.localeCompare(right));
}

const defaults = {
  layout: "small" as PlayerLayout,
  src: "",
  title: "",
  artist: "",
  cover: "",
  data: INTERNAL_PLAYLIST_SOURCE,
  accent: "#d54e84",
  bg: "#ececef",
  text: "#253452",
  volume: "0.8",
  start: "0",
  loop: "none" as LoopMode,
  queue: true,
  autoplay: false,
  category: "",
  type: "",
  adminKey: "",
  instance: "",
};

const PREVIEW_DEMO = {
  src: INTERNAL_PLAYLIST_SOURCE,
  title: defaults.title,
  artist: defaults.artist,
  cover: defaults.cover,
};

const layoutPalette: Record<PlayerLayout, { bg: string; text: string; accent: string }> = {
  small: { bg: "#ececef", text: "#253452", accent: "#d54e84" },
  medium: { bg: "#f4b6cd", text: "#7a133e", accent: "#931547" },
  large: { bg: "#081538", text: "#e8edff", accent: "#2ea4ff" },
};

const AUDIO_THEME_PRESETS: AudioThemePreset[] = [
  { id: "petal", label: "Petal", accent: "#d54e84", bg: "#ececef", text: "#253452" },
  { id: "midnight", label: "Midnight", accent: "#60a5fa", bg: "#081538", text: "#e8edff" },
  { id: "sunset", label: "Sunset", accent: "#ff6b35", bg: "#1c1024", text: "#ffe8d6" },
  { id: "forest", label: "Forest", accent: "#18a67a", bg: "#0f1f1a", text: "#d7f7e8" },
  { id: "mono", label: "Mono", accent: "#1f2937", bg: "#f9fafb", text: "#111827" },
  { id: "amber", label: "Amber", accent: "#f59e0b", bg: "#201205", text: "#fff4d6" },
];

const builderSelectClass =
  "w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white outline-none transition focus:border-white/25 focus:bg-white/12 [&>option]:bg-zinc-900 [&>option]:text-zinc-100";

const darkSelectStyle: CSSProperties = {
  colorScheme: "dark",
};

function sanitizeInstance(value: string): string {
  return value.replace(/[^a-z0-9_-]/gi, "");
}

export default function AudioPlayerBuilder() {
  const searchParams = useSearchParams();
  const instanceParam = (searchParams.get("instance") ?? "").trim();
  const categoryParam = parseMultiFilterValues(searchParams.get("category") ?? "", normalizeFilterCategory);
  const typeParam = parseMultiFilterValues(searchParams.get("type") ?? "", normalizeFilterType);
  const adminKeyParam = (searchParams.get("admin-key") ?? "").trim();
  const [layout, setLayout] = useState<PlayerLayout>(defaults.layout);
  const [src, setSrc] = useState(defaults.src);
  const [title, setTitle] = useState(defaults.title);
  const [artist, setArtist] = useState(defaults.artist);
  const [cover, setCover] = useState(defaults.cover);
  const [data, setData] = useState(defaults.data);
  const [accent, setAccent] = useState(defaults.accent);
  const [bg, setBg] = useState(defaults.bg);
  const [text, setText] = useState(defaults.text);
  const [themePresetId, setThemePresetId] = useState<string>("petal");
  const [volume, setVolume] = useState(defaults.volume);
  const [start, setStart] = useState(defaults.start);
  const [loop, setLoop] = useState<LoopMode>(defaults.loop);
  const [queue, setQueue] = useState(defaults.queue);
  const [autoplay, setAutoplay] = useState(defaults.autoplay);
  const [categoryFilters, setCategoryFilters] = useState<string[]>(categoryParam);
  const [typeFilters, setTypeFilters] = useState<string[]>(typeParam);
  const [adminKey, setAdminKey] = useState(adminKeyParam || defaults.adminKey);
  const [instanceDraft, setInstanceDraft] = useState(instanceParam);
  const [instanceId, setInstanceId] = useState(instanceParam);
  const [copied, setCopied] = useState(false);
  const [previewBlend, setPreviewBlend] = useState(false);
  const [previewTransparent, setPreviewTransparent] = useState(false);

  const normalizedInstance = sanitizeInstance(instanceId.trim());
  const normalizedDraft = sanitizeInstance(instanceDraft.trim());
  const normalizedCategoryFilters = categoryFilters.map((value) => normalizeFilterCategory(value)).filter((value): value is string => Boolean(value));
  const normalizedTypeFilters = typeFilters.map((value) => normalizeFilterType(value)).filter((value): value is string => Boolean(value));
  const configuredAdminKey =
    (process.env.NEXT_PUBLIC_AUDIO_ADMIN_KEY || process.env.NEXT_PUBLIC_QUOTES_ADMIN_KEY || "").trim();
  const includeAdminExtras = configuredAdminKey
    ? adminKey.trim() === configuredAdminKey
    : adminKey.trim().length > 0;

  const filterTypeOptionsByCategory = useMemo(
    () => buildFilterTypeMap(includeAdminExtras),
    [includeAdminExtras],
  );

  const availableCategoryOptions = useMemo(
    () => Object.keys(filterTypeOptionsByCategory).sort((a, b) => a.localeCompare(b)),
    [filterTypeOptionsByCategory],
  );

  const allTypeOptions = useMemo(
    () => Array.from(new Set(Object.values(filterTypeOptionsByCategory).flat())).sort((a, b) => a.localeCompare(b)),
    [filterTypeOptionsByCategory],
  );

  const availableTypeOptions = useMemo(() => {
    if (!normalizedCategoryFilters.length) return allTypeOptions;
    const set = new Set<string>();
    normalizedCategoryFilters.forEach((category) => {
      (filterTypeOptionsByCategory[category] ?? []).forEach((type) => set.add(type));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [normalizedCategoryFilters, filterTypeOptionsByCategory, allTypeOptions]);

  useEffect(() => {
    setCategoryFilters((prev) => prev.filter((value) => availableCategoryOptions.includes(value)));
  }, [availableCategoryOptions]);

  useEffect(() => {
    setTypeFilters((prev) => prev.filter((value) => availableTypeOptions.includes(value)));
  }, [availableTypeOptions]);

  useEffect(() => {
    const matchedPreset = AUDIO_THEME_PRESETS.find(
      (preset) => preset.accent.toLowerCase() === accent.toLowerCase()
        && preset.bg.toLowerCase() === bg.toLowerCase()
        && preset.text.toLowerCase() === text.toLowerCase(),
    );
    setThemePresetId(matchedPreset?.id ?? "custom");
  }, [accent, bg, text]);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    p.set("embed", "1");
    p.set("layout", layout);
    if (src.trim()) p.set("src", src.trim());
    if (title.trim()) p.set("title", title.trim());
    if (artist.trim()) p.set("artist", artist.trim());
    if (cover.trim()) p.set("cover", cover.trim());
    if (data.trim()) p.set("data", data.trim());
    p.set("accent", accent.trim() || layoutPalette[layout].accent);
    p.set("bg", bg.trim() || layoutPalette[layout].bg);
    p.set("text", text.trim() || layoutPalette[layout].text);
    p.set("volume", volume.trim() || defaults.volume);
    p.set("start", start.trim() || defaults.start);
    p.set("loop", loop);
    p.set("queue", queue ? "1" : "0");
    if (autoplay) p.set("autoplay", "1");
    if (normalizedCategoryFilters.length) p.set("category", normalizedCategoryFilters.join(","));
    if (normalizedTypeFilters.length) p.set("type", normalizedTypeFilters.join(","));
    if (adminKey.trim()) p.set("admin-key", adminKey.trim());
    if (normalizedInstance) p.set("instance", normalizedInstance);
    if (previewBlend) p.set("blend", "1");
    if (previewTransparent) p.set("transparent", "1");
    return p;
  }, [layout, src, title, artist, cover, data, accent, bg, text, volume, start, loop, queue, autoplay, normalizedCategoryFilters, normalizedTypeFilters, adminKey, normalizedInstance, previewBlend, previewTransparent]);

  const livePreviewParams = useMemo(
    () => ({
      layout,
      src: src.trim() || (data.trim() ? undefined : PREVIEW_DEMO.src),
      title: title.trim() || PREVIEW_DEMO.title,
      artist: artist.trim() || PREVIEW_DEMO.artist,
      cover: cover.trim() || PREVIEW_DEMO.cover,
      data: data.trim() || undefined,
      accent: accent.trim() || layoutPalette[layout].accent,
      bg: bg.trim() || layoutPalette[layout].bg,
      text: text.trim() || layoutPalette[layout].text,
      volume: volume.trim() || defaults.volume,
      start: start.trim() || defaults.start,
      loop,
      queue: queue ? 1 : 0,
      autoplay: autoplay ? 1 : 0,
      category: normalizedCategoryFilters.length ? normalizedCategoryFilters.join(",") : undefined,
      type: normalizedTypeFilters.length ? normalizedTypeFilters.join(",") : undefined,
      "admin-key": adminKey.trim() || undefined,
      instance: normalizedInstance || undefined,
    }),
    [layout, src, title, artist, cover, data, accent, bg, text, volume, start, loop, queue, autoplay, normalizedCategoryFilters, normalizedTypeFilters, adminKey, normalizedInstance],
  );

  const reset = () => {
    setLayout(defaults.layout);
    setSrc(defaults.src);
    setTitle(defaults.title);
    setArtist(defaults.artist);
    setCover(defaults.cover);
    setData(defaults.data);
    setAccent(defaults.accent);
    setBg(defaults.bg);
    setText(defaults.text);
    setVolume(defaults.volume);
    setStart(defaults.start);
    setLoop(defaults.loop);
    setQueue(defaults.queue);
    setAutoplay(defaults.autoplay);
    setCategoryFilters([]);
    setTypeFilters([]);
    setAdminKey(defaults.adminKey);
    setInstanceId(instanceParam);
    setInstanceDraft(instanceParam);
  };

  const applyLayoutPalette = (nextLayout: PlayerLayout) => {
    const palette = layoutPalette[nextLayout];
    setLayout(nextLayout);
    setAccent(palette.accent);
    setBg(palette.bg);
    setText(palette.text);
    const matchedPreset = AUDIO_THEME_PRESETS.find(
      (preset) => preset.accent === palette.accent && preset.bg === palette.bg && preset.text === palette.text,
    );
    setThemePresetId(matchedPreset?.id ?? "custom");
  };

  const applyThemePreset = (preset: AudioThemePreset) => {
    setAccent(preset.accent);
    setBg(preset.bg);
    setText(preset.text);
    setThemePresetId(preset.id);
  };

  const connectNotionDatasource = () => {
    setSrc("");
    setData(INTERNAL_PLAYLIST_SOURCE);
    if (layout === "small") {
      setLayout("large");
      const palette = layoutPalette.large;
      setAccent(palette.accent);
      setBg(palette.bg);
      setText(palette.text);
    }
  };

  const copyLink = () => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.origin + "/audio-player");
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
    <main className="audio-builder-shell flex min-h-screen w-full items-start justify-center bg-[#191919] px-4 py-10 text-zinc-100">
      <div className="grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-[340px,1fr]">
        <section className="flex max-h-[88vh] flex-col gap-4 overflow-y-auto scrollbar-hide rounded-[28px] border border-white/10 bg-white/[0.055] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">Audio Player</p>
              <h2 className="text-lg font-semibold text-zinc-50">Builder</h2>
              <p className="text-sm text-zinc-400">Make a clean embedded player for tracks or playlists.</p>
            </div>
            <button
              className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-200 transition hover:bg-white/10"
              onClick={reset}
              aria-label="Reset"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 rounded-2xl border border-white/10 bg-zinc-950/20 p-4">
            <label className="space-y-1 text-sm">
              <span className="text-zinc-300">Layout</span>
              <select
                className={builderSelectClass}
                style={darkSelectStyle}
                value={layout}
                onChange={(e) => applyLayoutPalette(e.target.value as PlayerLayout)}
              >
                <option value="small">Small player bar</option>
                <option value="medium">Medium card</option>
                <option value="large">Large playlist</option>
              </select>
            </label>

            <label className="space-y-1 text-sm">
              <span className="text-zinc-300">Single track mp3 URL</span>
              <input
                className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white outline-none transition focus:border-white/25 focus:bg-white/12"
                value={src}
                onChange={(e) => setSrc(e.target.value)}
                placeholder="/audio/my-song.mp3 or https://.../song.mp3"
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="text-zinc-300">Playlist datasource</span>
              <p className="text-[11px] leading-relaxed text-zinc-500">
                Builder now defaults to the internal Notion Widgets playlist source. The raw JSON URL field is hidden to keep embed output stable.
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-cyan-300/25 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-100 transition hover:bg-cyan-400/20"
                  onClick={connectNotionDatasource}
                >
                  Use Internal Notion Playlist
                </button>
                <span className="text-[11px] text-zinc-500">Source: {INTERNAL_PLAYLIST_SOURCE}</span>
              </div>
            </label>

            <div className="grid grid-cols-1 gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Library Filters</p>

              <div className="space-y-1 text-sm">
                <span className="text-zinc-300">Category</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`rounded-full border px-3 py-1.5 text-xs transition ${!normalizedCategoryFilters.length ? "border-cyan-300/50 bg-cyan-400/15 text-cyan-50" : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"}`}
                    onClick={() => setCategoryFilters([])}
                  >
                    All categories
                  </button>
                  {availableCategoryOptions.map((option) => {
                    const active = normalizedCategoryFilters.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        className={`rounded-full border px-3 py-1.5 text-xs transition ${active ? "border-cyan-300/50 bg-cyan-400/15 text-cyan-50" : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"}`}
                        onClick={() => setCategoryFilters((prev) => toggleSelection(prev, option))}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1 text-sm">
                <span className="text-zinc-300">Type (depends on category)</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`rounded-full border px-3 py-1.5 text-xs transition ${!normalizedTypeFilters.length ? "border-cyan-300/50 bg-cyan-400/15 text-cyan-50" : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"}`}
                    onClick={() => setTypeFilters([])}
                  >
                    All types
                  </button>
                  {availableTypeOptions.map((option) => {
                    const active = normalizedTypeFilters.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        className={`rounded-full border px-3 py-1.5 text-xs transition ${active ? "border-cyan-300/50 bg-cyan-400/15 text-cyan-50" : "border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"}`}
                        onClick={() => setTypeFilters((prev) => toggleSelection(prev, option))}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Admin access key (optional)</span>
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white outline-none transition focus:border-white/25 focus:bg-white/12"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Adds admin-key=... to URL"
                />
                <p className="text-[11px] leading-relaxed text-zinc-500">
                  When valid, the widget unlocks full category/type access.
                </p>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Title</span>
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white outline-none transition focus:border-white/25 focus:bg-white/12"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Song title"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Artist</span>
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white outline-none transition focus:border-white/25 focus:bg-white/12"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="Artist name"
                />
              </label>
            </div>

            <label className="space-y-1 text-sm">
              <span className="text-zinc-300">Cover image URL</span>
              <input
                className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white outline-none transition focus:border-white/25 focus:bg-white/12"
                value={cover}
                onChange={(e) => setCover(e.target.value)}
                placeholder="https://.../cover.jpg"
              />
            </label>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300 text-sm">Theme presets</span>
                  <span className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">
                    {themePresetId === "custom" ? "Custom" : themePresetId}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {AUDIO_THEME_PRESETS.map((preset) => {
                    const active = themePresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        className={`rounded-xl border px-2.5 py-2 text-left transition ${
                          active
                            ? "border-cyan-300/50 bg-cyan-400/12"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                        onClick={() => applyThemePreset(preset)}
                      >
                        <span className="mb-1.5 block text-xs font-medium text-zinc-100">{preset.label}</span>
                        <span className="flex items-center gap-1.5">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: preset.accent }} />
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: preset.bg }} />
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: preset.text }} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Accent</span>
                <input type="color" className="color-swatch" value={accent} onChange={(e) => setAccent(e.target.value)} />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Background</span>
                <input type="color" className="color-swatch" value={bg} onChange={(e) => setBg(e.target.value)} />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Text</span>
                <input type="color" className="color-swatch" value={text} onChange={(e) => setText(e.target.value)} />
              </label>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Volume (0-1)</span>
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white outline-none transition focus:border-white/25 focus:bg-white/12"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Start track index</span>
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white outline-none transition focus:border-white/25 focus:bg-white/12"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Loop mode</span>
                <select
                  className={builderSelectClass}
                  style={darkSelectStyle}
                  value={loop}
                  onChange={(e) => setLoop(e.target.value as LoopMode)}
                >
                  <option value="none">none</option>
                  <option value="track">track</option>
                  <option value="playlist">playlist</option>
                </select>
              </label>
            </div>

            <label className="space-y-1 text-sm">
              <span className="text-zinc-300">Instance</span>
              <div className="flex gap-2">
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white outline-none transition focus:border-white/25 focus:bg-white/12"
                  value={instanceDraft}
                  onChange={(e) => setInstanceDraft(e.target.value)}
                  placeholder="main"
                />
                <button
                  type="button"
                  className="rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/90 transition hover:bg-white/10"
                  onClick={() => {
                    setInstanceId(normalizedDraft);
                    setInstanceDraft(normalizedDraft);
                  }}
                >
                  Save
                </button>
              </div>
            </label>

            <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-white/20 bg-white/10"
                checked={queue}
                onChange={(e) => setQueue(e.target.checked)}
              />
              Show queue list (large mode)
            </label>

            <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-white/20 bg-white/10"
                checked={autoplay}
                onChange={(e) => setAutoplay(e.target.checked)}
              />
              Autoplay on load
            </label>
          </div>

          <div className="space-y-3 rounded-2xl border border-white/10 bg-zinc-950/20 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Embed URL</p>
                <p className="text-sm text-zinc-300">Copy the exact settings as a public widget link.</p>
              </div>
              <button
                onClick={copyLink}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200 sm:w-auto"
              >
                <Copy size={16} />
                {copied ? "Copied" : "Copy URL"}
              </button>
            </div>

            <code className="break-all rounded-2xl border border-white/10 bg-zinc-900/80 p-3 text-xs text-zinc-200">
              /audio-player?{params.toString()}
            </code>
          </div>
        </section>

        <section className="flex items-center justify-center h-[88vh] shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl rounded-[28px]">
          <div className="relative flex items-center justify-center p-4">
            <div className="absolute top-3 right-3 z-10 flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input type="checkbox" className="h-4 w-4 rounded" checked={previewBlend} onChange={(e) => setPreviewBlend(e.target.checked)} />
                <span>Blend with page</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input type="checkbox" className="h-4 w-4 rounded" checked={previewTransparent} onChange={(e) => setPreviewTransparent(e.target.checked)} />
                <span>Transparent preset</span>
              </label>
            </div>

            <div className="bg-[#202020] p-4 rounded-[28px] border border-white/10 bg-white/[0.03]">
              <AudioPlayerWidget embedParams={livePreviewParams} previewBlend={previewBlend} previewTransparent={previewTransparent} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
