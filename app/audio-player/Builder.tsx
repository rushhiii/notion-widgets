"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Copy, RefreshCw } from "lucide-react";
import AudioPlayerWidget from "@/components/widgets/AudioPlayerWidget";

type PlayerLayout = "small" | "medium" | "large";
type LoopMode = "none" | "track" | "playlist";

const FRIEND_REPO_PLAYLIST_URL =
  "https://cdn.jsdelivr.net/gh/V0idVanguard/MyMusicCollection@main/playlist.json";

const defaults = {
  layout: "small" as PlayerLayout,
  src: "",
  title: "my magic shop",
  artist: "you gave me the best of me",
  cover:
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80",
  data: FRIEND_REPO_PLAYLIST_URL,
  accent: "#d54e84",
  bg: "#ececef",
  text: "#253452",
  volume: "0.8",
  start: "0",
  loop: "none" as LoopMode,
  queue: true,
  autoplay: false,
  instance: "",
};

const PREVIEW_DEMO = {
  src: FRIEND_REPO_PLAYLIST_URL,
  title: defaults.title,
  artist: defaults.artist,
  cover: defaults.cover,
};

const layoutPalette: Record<PlayerLayout, { bg: string; text: string; accent: string }> = {
  small: { bg: "#ececef", text: "#253452", accent: "#d54e84" },
  medium: { bg: "#f4b6cd", text: "#7a133e", accent: "#931547" },
  large: { bg: "#081538", text: "#e8edff", accent: "#2ea4ff" },
};

function sanitizeInstance(value: string): string {
  return value.replace(/[^a-z0-9_-]/gi, "");
}

export default function AudioPlayerBuilder() {
  const searchParams = useSearchParams();
  const instanceParam = (searchParams.get("instance") ?? "").trim();
  const [layout, setLayout] = useState<PlayerLayout>(defaults.layout);
  const [src, setSrc] = useState(defaults.src);
  const [title, setTitle] = useState(defaults.title);
  const [artist, setArtist] = useState(defaults.artist);
  const [cover, setCover] = useState(defaults.cover);
  const [data, setData] = useState(defaults.data);
  const [accent, setAccent] = useState(defaults.accent);
  const [bg, setBg] = useState(defaults.bg);
  const [text, setText] = useState(defaults.text);
  const [volume, setVolume] = useState(defaults.volume);
  const [start, setStart] = useState(defaults.start);
  const [loop, setLoop] = useState<LoopMode>(defaults.loop);
  const [queue, setQueue] = useState(defaults.queue);
  const [autoplay, setAutoplay] = useState(defaults.autoplay);
  const [instanceDraft, setInstanceDraft] = useState(instanceParam);
  const [instanceId, setInstanceId] = useState(instanceParam);
  const [copied, setCopied] = useState(false);

  const normalizedInstance = sanitizeInstance(instanceId.trim());
  const normalizedDraft = sanitizeInstance(instanceDraft.trim());

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
    if (normalizedInstance) p.set("instance", normalizedInstance);
    return p;
  }, [layout, src, title, artist, cover, data, accent, bg, text, volume, start, loop, queue, autoplay, normalizedInstance]);

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
      instance: normalizedInstance || undefined,
    }),
    [layout, src, title, artist, cover, data, accent, bg, text, volume, start, loop, queue, autoplay, normalizedInstance],
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
    setInstanceId(instanceParam);
    setInstanceDraft(instanceParam);
  };

  const applyLayoutPalette = (nextLayout: PlayerLayout) => {
    const palette = layoutPalette[nextLayout];
    setLayout(nextLayout);
    setAccent(palette.accent);
    setBg(palette.bg);
    setText(palette.text);
  };

  const connectFriendDatasource = () => {
    setSrc("");
    setData(FRIEND_REPO_PLAYLIST_URL);
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
    <main className="audio-builder-shell flex min-h-screen w-full items-start justify-center px-4 py-10 text-zinc-100">
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
                className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white outline-none transition focus:border-white/25 focus:bg-white/12"
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
              <span className="text-zinc-300">Playlist datasource JSON URL (optional)</span>
              <input
                className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white outline-none transition focus:border-white/25 focus:bg-white/12"
                value={data}
                onChange={(e) => setData(e.target.value)}
                placeholder={FRIEND_REPO_PLAYLIST_URL}
              />
              <p className="text-[11px] leading-relaxed text-zinc-500">
                Connected to your friend repo by default. Use either src or data. Playlist JSON shape: [{"{"} src, title, artist, cover, category, type {"}"}]. Public R2 buckets work too.
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-cyan-300/25 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-100 transition hover:bg-cyan-400/20"
                  onClick={connectFriendDatasource}
                >
                  Connect MyMusicCollection
                </button>
                <span className="text-[11px] text-zinc-500">Uses jsDelivr CDN from your friend repo.</span>
              </div>
            </label>

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
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm text-white outline-none transition focus:border-white/25 focus:bg-white/12"
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
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Embed URL</p>
                <p className="text-sm text-zinc-300">Copy the exact settings as a public widget link.</p>
              </div>
              <button
                onClick={copyLink}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200"
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

        <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Preview</p>
              <h3 className="text-sm font-semibold text-zinc-200">Live Player</h3>
            </div>
            <p className="text-xs text-zinc-400">Matches copied URL settings.</p>
          </div>
          <div className="min-h-[420px] rounded-[24px] border border-white/10 bg-[#0c0d10]/70 p-3">
            <AudioPlayerWidget embedParams={livePreviewParams} />
          </div>
        </section>
      </div>
    </main>
  );
}
