"use client";

import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { List, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";

type EmbedParams = Record<string, string | number | boolean | undefined>;
type PlayerLayout = "small" | "medium" | "large";
type LoopMode = "none" | "track" | "playlist";

type Track = {
  src: string;
  title: string;
  artist: string;
  cover: string;
  album?: string;
  genre?: string;
  year?: string;
  duration?: string;
  description?: string;
  category?: string;
  type?: string;
};

const DEFAULT_TRACK: Track = {
  src: "",
  title: "Instrumental Track",
  artist: "Custom Source",
  cover: "",
};

const DEFAULT_COVER = "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80";
const FALLBACK_AUDIO_SOURCES = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
];

function pick<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  if (!value) return fallback;
  const v = value.toLowerCase();
  return (allowed.includes(v as T) ? v : fallback) as T;
}

function clamp(value: string | null, fallback: number, min: number, max: number): number {
  if (!value) return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function parseBool(value: string | null, fallback: boolean): boolean {
  if (value == null) return fallback;
  const v = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(v)) return true;
  if (["0", "false", "no", "off"].includes(v)) return false;
  return fallback;
}

function normalizeHex(value: string | null, fallback: string): string {
  if (!value) return fallback;
  const raw = value.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(raw) || /^[0-9a-fA-F]{6}$/.test(raw)) {
    return `#${raw}`;
  }
  return fallback;
}

function formatTime(time: number): string {
  if (!Number.isFinite(time) || time < 0) return "0:00";
  const total = Math.floor(time);
  const min = Math.floor(total / 60);
  const sec = total % 60;
  return `${min}:${String(sec).padStart(2, "0")}`;
}

function sanitizeInstance(value: string): string {
  return value.replace(/[^a-z0-9_-]/gi, "");
}

function isRemoteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function isLikelyAudioUrl(value: string): boolean {
  const candidate = value.trim().toLowerCase();
  if (!candidate) return false;
  try {
    const pathname = new URL(candidate, window.location.origin).pathname.toLowerCase();
    return /\.(mp3|m4a|aac|wav|ogg|flac)$/.test(pathname);
  } catch {
    return /\.(mp3|m4a|aac|wav|ogg|flac)$/.test(candidate);
  }
}

function getFallbackAudioSrc(index: number): string {
  return FALLBACK_AUDIO_SOURCES[index % FALLBACK_AUDIO_SOURCES.length] ?? FALLBACK_AUDIO_SOURCES[0];
}

function toPlayableSrc(value: string, index: number): string {
  if (!value) return value;
  if (value.startsWith("/")) return value;
  if (!isLikelyAudioUrl(value)) return getFallbackAudioSrc(index);
  if (!isRemoteUrl(value)) return value;
  return `/api/audio?url=${encodeURIComponent(value)}`;
}

function toPlayablePlaylistUrl(value: string): string {
  if (!value) return value;
  if (value.startsWith("/api/playlist?url=")) return value;
  if (value.startsWith("/")) return value;
  if (!isRemoteUrl(value)) return value;
  return `/api/playlist?url=${encodeURIComponent(value)}`;
}

function normalizeTrack(input: unknown): Track | null {
  if (!input || typeof input !== "object") return null;
  const row = input as Record<string, unknown>;
  const src = typeof row.src === "string" ? row.src.trim() : "";
  if (!src) return null;
  const title = typeof row.title === "string" && row.title.trim() ? row.title.trim() : DEFAULT_TRACK.title;
  const artist = typeof row.artist === "string" && row.artist.trim() ? row.artist.trim() : DEFAULT_TRACK.artist;
  const cover = typeof row.cover === "string" && row.cover.trim() ? row.cover.trim() : "";
  const album = typeof row.album === "string" && row.album.trim() ? row.album.trim() : undefined;
  const genre = typeof row.genre === "string" && row.genre.trim() ? row.genre.trim() : undefined;
  const year = typeof row.year === "string" && row.year.trim()
    ? row.year.trim()
    : typeof row.year === "number" && Number.isFinite(row.year)
      ? String(row.year)
      : undefined;
  const duration = typeof row.duration === "string" && row.duration.trim()
    ? row.duration.trim()
    : typeof row.duration === "number" && Number.isFinite(row.duration)
      ? formatTime(row.duration)
      : undefined;
  const description = typeof row.description === "string" && row.description.trim() ? row.description.trim() : undefined;
  const category = typeof row.category === "string" && row.category.trim() ? row.category.trim() : undefined;
  const type = typeof row.type === "string" && row.type.trim() ? row.type.trim() : undefined;
  return { src, title, artist, cover, album, genre, year, duration, description, category, type };
}

function parseTracksPayload(payload: unknown): Track[] {
  if (Array.isArray(payload)) {
    return payload.map(normalizeTrack).filter((track): track is Track => Boolean(track));
  }
  if (payload && typeof payload === "object") {
    const maybeTracks = (payload as Record<string, unknown>).tracks;
    if (Array.isArray(maybeTracks)) {
      return maybeTracks.map(normalizeTrack).filter((track): track is Track => Boolean(track));
    }
  }
  return [];
}

export default function AudioPlayerWidget({ embedParams }: { embedParams?: EmbedParams }) {
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const smallSeekRef = useRef<HTMLDivElement | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isBuffering, setIsBuffering] = useState(false);
  const [seekHoverPct, setSeekHoverPct] = useState<number | null>(null);
  const [seekHoverLabel, setSeekHoverLabel] = useState("0:00");
  const [autoLayout, setAutoLayout] = useState<PlayerLayout>("small");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

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

  const layoutParam = getParam(["layout", "size"]);
  const explicitLayout = layoutParam
    ? pick(layoutParam, ["small", "medium", "large"] as const, "small")
    : null;
  const layout = explicitLayout ?? autoLayout;
  const sourceUrl = (getParam(["src", "url"]) || "").trim();
  const title = (getParam(["title"]) || DEFAULT_TRACK.title).trim() || DEFAULT_TRACK.title;
  const artist = (getParam(["artist"]) || DEFAULT_TRACK.artist).trim() || DEFAULT_TRACK.artist;
  const cover = (getParam(["cover", "image"]) || "").trim();
  const dataUrl = (getParam(["data", "playlist"]) || "").trim();
  const autoplay = parseBool(getParam(["autoplay"]), false);
  const showQueue = parseBool(getParam(["queue", "show-queue", "showQueue"]), true);
  const loopMode = pick(getParam(["loop"]), ["none", "track", "playlist"] as const, "none");
  const startIndex = clamp(getParam(["start", "index"]), 0, 0, 99);
  const initialVolume = clamp(getParam(["volume"]), 0.8, 0, 1);
  const instance = sanitizeInstance((getParam(["instance"]) || "").trim());

  const defaultPalette =
    layout === "large"
      ? { bg: "#081538", text: "#e8edff", accent: "#2ea4ff" }
      : layout === "medium"
        ? { bg: "#f4b6cd", text: "#7a133e", accent: "#931547" }
        : { bg: "#ececef", text: "#253452", accent: "#d54e84" };

  const accent = normalizeHex(getParam(["accent"]), defaultPalette.accent);
  const bg = normalizeHex(getParam(["bg", "background"]), defaultPalette.bg);
  const text = normalizeHex(getParam(["text", "text-color", "textColor"]), defaultPalette.text);

  const singleTrack = useMemo<Track | null>(() => {
    if (!sourceUrl) return null;
    return {
      src: sourceUrl,
      title,
      artist,
      cover,
    };
  }, [sourceUrl, title, artist, cover]);

  useEffect(() => {
    if (explicitLayout) return;
    const target = containerRef.current;
    if (!target) return;

    const pickAutoLayout = (width: number): PlayerLayout => {
      if (width < 430) return "small";
      if (width < 620) return "medium";
      return "large";
    };

    const update = () => {
      const width = target.clientWidth;
      if (!width) return;
      setAutoLayout((prev) => {
        const next = pickAutoLayout(width);
        return prev === next ? prev : next;
      });
    };

    update();
    const observer = new ResizeObserver(() => update());
    observer.observe(target);
    return () => observer.disconnect();
  }, [explicitLayout]);

  useEffect(() => {
    let canceled = false;

    async function loadTracks() {
      setError(null);
      if (singleTrack) {
        setTracks([singleTrack]);
        setActiveIndex(0);
        return;
      }

      if (!dataUrl) {
        setTracks([]);
        setError("Add src=<audio file> or data=<playlist json url>.");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(toPlayablePlaylistUrl(dataUrl), { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Unable to fetch playlist JSON.");
        }
        const payload = (await response.json()) as unknown;
        const parsedTracks = parseTracksPayload(payload);
        if (!parsedTracks.length) {
          throw new Error("Playlist JSON has no valid tracks.");
        }
        if (!canceled) {
          setTracks(parsedTracks);
          setActiveIndex(Math.min(startIndex, parsedTracks.length - 1));
        }
      } catch (err) {
        if (!canceled) {
          const message = err instanceof Error ? err.message : "Could not load datasource.";
          setError(message);
          setTracks([]);
        }
      } finally {
        if (!canceled) setLoading(false);
      }
    }

    loadTracks();
    return () => {
      canceled = true;
      setLoading(false);
    };
  }, [dataUrl, singleTrack, startIndex, sourceUrl, layout, instance]);

  useEffect(() => {
    setVolume(initialVolume);
  }, [initialVolume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  const activeTrack = tracks[activeIndex] ?? null;
  const coverImage = activeTrack?.cover || cover || DEFAULT_COVER;
  const playbackStateLabel = !activeTrack ? "" : isBuffering ? "Buffering" : isPlaying ? "Playing now" : "Ready to play";
  
  // Extract unique categories and types
  const categories = useMemo(() => {
    const cats = new Set<string>();
    tracks.forEach(t => {
      if (t.category) cats.add(t.category.toLowerCase());
    });
    return Array.from(cats).sort();
  }, [tracks]);

  const types = useMemo(() => {
    const typs = new Set<string>();
    tracks.forEach(t => {
      if (t.type) typs.add(t.type.toLowerCase());
    });
    return Array.from(typs).sort();
  }, [tracks]);

  // Filter tracks based on selected category and type
  const filteredTracks = useMemo(() => {
    return tracks.filter(track => {
      if (selectedCategory && track.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      if (selectedType && track.type?.toLowerCase() !== selectedType.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [tracks, selectedCategory, selectedType]);

  // Adjust active index if it's beyond filtered tracks
  useEffect(() => {
    if (filteredTracks.length > 0 && activeIndex >= filteredTracks.length) {
      setActiveIndex(Math.max(0, filteredTracks.length - 1));
    }
  }, [filteredTracks, activeIndex]);

  const playTrackAt = useCallback((index: number) => {
    if (index < 0 || index >= filteredTracks.length) return;
    const filteredTrack = filteredTracks[index];
    const originalIndex = tracks.findIndex(t => t.src === filteredTrack.src);
    if (originalIndex >= 0) {
      setActiveIndex(originalIndex);
      setIsPlaying(true);
    }
  }, [filteredTracks, tracks]);

  const nextTrack = useCallback(() => {
    if (!filteredTracks.length) return;
    const currentFilteredIndex = filteredTracks.findIndex(t => t.src === activeTrack?.src);
    if (currentFilteredIndex < filteredTracks.length - 1) {
      playTrackAt(currentFilteredIndex + 1);
      return;
    }
    if (loopMode === "playlist") {
      playTrackAt(0);
    }
  }, [filteredTracks, activeTrack, loopMode, playTrackAt]);

  const previousTrack = useCallback(() => {
    const audio = audioRef.current;
    if (!filteredTracks.length) return;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const currentFilteredIndex = filteredTracks.findIndex(t => t.src === activeTrack?.src);
    if (currentFilteredIndex > 0) {
      playTrackAt(currentFilteredIndex - 1);
      return;
    }
    if (loopMode === "playlist") {
      playTrackAt(filteredTracks.length - 1);
    }
  }, [filteredTracks, activeTrack, loopMode, playTrackAt]);

  const handleCoverError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const target = event.currentTarget;
    if (target.src !== DEFAULT_COVER) {
      target.src = DEFAULT_COVER;
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime || 0);
    const onLoaded = () => setDuration(audio.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsBuffering(true);
    const onCanPlay = () => setIsBuffering(false);
    const onSeeking = () => setIsBuffering(true);
    const onSeeked = () => setIsBuffering(false);
    const onEnded = () => {
      if (loopMode === "track") {
        audio.currentTime = 0;
        audio.play().catch(() => undefined);
        return;
      }
      if (filteredTracks.length > 1 && (loopMode === "playlist" || currentFilteredIndex < filteredTracks.length - 1)) {
        if (currentFilteredIndex < filteredTracks.length - 1) {
          nextTrack();
        } else if (loopMode === "playlist") {
          playTrackAt(0);
        }
        return;
      }
      setIsPlaying(false);
    };

    const onError = () => {
      const error = audio.error;
      if (error) {
        switch (error.code) {
          case 1: // MEDIA_ERR_ABORTED
            setError('Audio loading was aborted.');
            break;
          case 2: // MEDIA_ERR_NETWORK
            setError('Network error while loading the track through the proxy.');
            break;
          case 3: // MEDIA_ERR_DECODE
            setError('Audio format not supported or corrupted.');
            break;
          case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
            setError('Audio source could not be loaded. Try a different track URL or local file.');
            break;
          default:
            setError('Audio loading failed.');
        }
      }
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("playing", onCanPlay);
    audio.addEventListener("seeking", onSeeking);
    audio.addEventListener("seeked", onSeeked);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("playing", onCanPlay);
      audio.removeEventListener("seeking", onSeeking);
      audio.removeEventListener("seeked", onSeeked);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [activeIndex, loopMode, filteredTracks.length, nextTrack, playTrackAt]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !activeTrack) return;

    // Set the audio source through the proxy
    const src = toPlayableSrc(activeTrack.src, activeIndex);
    audio.src = src;
    setCurrentTime(0);
    setDuration(0);
    setIsBuffering(true);
    setError(null);

    // Reset and load the audio
    audio.load();

    // Auto-play if enabled or already playing
    if (autoplay || isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          const message = err instanceof Error ? err.message : 'Unknown error';
          console.error('Audio playback error:', message);
        });
      }
    }
  }, [activeTrack, autoplay, isPlaying, activeIndex]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !activeTrack) return;
    if (audio.paused) {
      audio.play().catch(() => undefined);
      return;
    }
    audio.pause();
  };

  const onSeek = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrentTime(value);
  };

  const updateSmallSeekHover = (clientX: number) => {
    const seekArea = smallSeekRef.current;
    if (!seekArea || duration <= 0) return;
    const rect = seekArea.getBoundingClientRect();
    const offset = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const pct = rect.width > 0 ? (offset / rect.width) * 100 : 0;
    const time = duration * (pct / 100);
    setSeekHoverPct(pct);
    setSeekHoverLabel(formatTime(time));
  };

  const commitSmallSeek = () => {
    if (seekHoverPct == null || duration <= 0) return;
    onSeek(duration * (seekHoverPct / 100));
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const currentFilteredIndex = filteredTracks.findIndex(t => t.src === activeTrack?.src);
  const canGoPrevious = currentFilteredIndex > 0 || loopMode === "playlist";
  const canGoNext = currentFilteredIndex < filteredTracks.length - 1 || loopMode === "playlist";

  const shellStyle: CSSProperties & Record<string, string | number> = {
    backgroundColor: bg,
    color: text,
    "--audio-accent": accent,
    "--audio-text": text,
    borderRadius: layout === "small" ? 22 : 20,
    boxShadow:
      layout === "large"
        ? "0 18px 40px rgba(4, 10, 30, 0.35)"
        : "0 12px 28px rgba(16, 24, 40, 0.16)",
    width: "100%",
    maxWidth: layout === "small" ? 800 : layout === "medium" ? 420 : 500,
  };

  const controlButton =
    "inline-flex h-11 w-11 items-center justify-center rounded-xl transition disabled:cursor-not-allowed disabled:opacity-45";

  return (
    <div ref={containerRef} className="w-full p-2">
      <audio ref={audioRef} preload="metadata" />

      <section className={`audio-shell ${layout}`} style={shellStyle}>
        {loading ? (
          <div className="px-5 py-4 text-sm opacity-80">
            <p>⏳ Loading playlist datasource...</p>
          </div>
        ) : null}
        {isBuffering && activeTrack && !error ? (
          <div className="px-5 py-2 text-xs opacity-70">
            <p>▶ Loading audio track...</p>
          </div>
        ) : null}
        {error ? (
          <div className="mx-5 mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-100">
            <p className="font-semibold">⚠ Audio Error</p>
            <p className="mt-1 opacity-90">{error}</p>
          </div>
        ) : null}

        {!loading && !activeTrack ? (
          <div className="px-6 py-7 text-sm opacity-90">
            <p className="font-semibold">Audio Player Widget</p>
            <p className="mt-2 opacity-80">Add an mp3 URL using src, or provide data with a playlist JSON URL.</p>
          </div>
        ) : null}

        {activeTrack && layout === "small" ? (
          <div className="small-layout">
            <div
              key={`bg-${activeTrack.src}-${activeIndex}`}
              className="small-bg-artwork"
              style={{ backgroundImage: `url(${coverImage})` }}
            />
            <div className="small-bg-layer" />

            <div className={`small-header ${isPlaying ? "active" : ""}`}>
              <div key={`meta-${activeTrack.src}-${activeIndex}`} className="small-title-wrap" id="album-name">
                <h3>{activeTrack.title}</h3>
                <p id="track-name">{activeTrack.artist}</p>
                {filteredTracks.length > 0 && (
                  <p id="track-number" style={{ fontSize: '0.72rem', color: '#acaebd', marginTop: '6px', opacity: 0.7 }}>
                    Track {currentFilteredIndex + 1} of {filteredTracks.length}
                  </p>
                )}
              </div>
              <div className={`small-time-row ${duration > 0 ? "active" : ""}`}>
                <span id="current-time">{formatTime(currentTime)}</span>
                <span id="track-length">{formatTime(duration)}</span>
              </div>

              <div className="small-status-strip">
                <span className={isPlaying ? "is-live" : ""}>{playbackStateLabel}</span>
                <span>Track {currentFilteredIndex + 1} of {filteredTracks.length}</span>
                <span>{formatTime(duration)}</span>
              </div>

              <div
                ref={smallSeekRef}
                className="small-seek-area"
                onMouseMove={(e) => updateSmallSeekHover(e.clientX)}
                onMouseLeave={() => setSeekHoverPct(null)}
                onClick={commitSmallSeek}
              >
                <div className="small-seek-hover" style={{ width: `${seekHoverPct ?? 0}%` }} />
                <div className="small-seek-bar" style={{ width: `${progress}%` }} />
                {seekHoverPct != null ? (
                  <div className="small-seek-time" style={{ left: `calc(${seekHoverPct}% - 21px)` }}>
                    {seekHoverLabel}
                  </div>
                ) : null}
              </div>
            </div>

              <div className="small-controls" id="player-content">
              <div className={`small-album-art ${isPlaying ? "active" : ""} ${isBuffering ? "buffering" : ""}`}>
                <img
                  key={`art-${activeTrack.src}-${activeIndex}`}
                  src={coverImage}
                  alt={activeTrack.title}
                  className="active"
                  loading="eager"
                  decoding="async"
                  onError={handleCoverError}
                />
                <div className="small-buffer-box">Buffering ...</div>
              </div>

              <button type="button" className={`${controlButton} small-control-button`} onClick={previousTrack} disabled={!canGoPrevious}>
                <SkipBack size={30} />
              </button>
              <button
                type="button"
                className={`${controlButton} play-main small-control-button`}
                onClick={togglePlay}
                style={{ backgroundColor: `${accent}24`, color: accent }}
              >
                {isPlaying ? <Pause size={34} /> : <Play size={34} />}
              </button>
              <button type="button" className={`${controlButton} small-control-button`} onClick={nextTrack} disabled={!canGoNext}>
                <SkipForward size={30} />
              </button>
            </div>
          </div>
        ) : null}

        {activeTrack && layout === "medium" ? (
          <div className="medium-layout">
            <img src={coverImage} alt={activeTrack.title} className="cover-card" loading="eager" decoding="async" onError={handleCoverError} />
            <div className="px-6 pb-4 pt-5">
              <h3 className="text-4xl font-black leading-[1.04] tracking-tight">{activeTrack.title}</h3>
              <p className="mt-2 text-lg opacity-85">{activeTrack.artist}</p>
              <div className="mt-4 flex flex-wrap gap-2 items-center">
                <span className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-3 py-1 text-xs font-semibold opacity-80">
                  🕐 {formatTime(duration)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-3 py-1 text-xs font-semibold opacity-80">
                  📍 Track {currentFilteredIndex + 1}/{filteredTracks.length}
                </span>
                {playbackStateLabel ? (
                  <span className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold ${isPlaying ? "bg-emerald-400/20" : "bg-white/15"} opacity-90`}>
                    {playbackStateLabel}
                  </span>
                ) : null}
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] opacity-55">Now playing</p>
                    <p className="mt-1 font-semibold opacity-95">{activeTrack.title}</p>
                  </div>
                  <p className="text-right text-xs opacity-75">{activeTrack.artist}</p>
                </div>
                {(activeTrack.category || activeTrack.type) && (
                  <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap gap-2">
                    {activeTrack.category && (
                      <span className="inline-block rounded px-2 py-1 text-xs font-semibold" style={{ backgroundColor: `${accent}30`, color: accent }}>
                        🎵 {activeTrack.category}
                      </span>
                    )}
                    {activeTrack.type && (
                      <span className="inline-block rounded px-2 py-1 text-xs font-semibold" style={{ backgroundColor: `${accent}20`, color: accent }}>
                        ⚡ {activeTrack.type}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 pb-2 text-sm opacity-85 flex justify-between">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="px-6">
              <input
                type="range"
                min={0}
                max={Math.max(duration, 1)}
                value={Math.min(currentTime, Math.max(duration, 1))}
                onChange={(e) => onSeek(Number(e.target.value))}
                className="progress"
                style={{ accentColor: accent }}
              />
            </div>
            <div className="px-6 pb-6 pt-4 flex items-center justify-between">
              <div className="flex gap-2">
                <button type="button" className={controlButton} onClick={previousTrack} disabled={!canGoPrevious}>
                  <SkipBack size={24} />
                </button>
                <button
                  type="button"
                  className={`${controlButton} play-main`}
                  onClick={togglePlay}
                  style={{ backgroundColor: `${accent}24`, color: accent }}
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button type="button" className={controlButton} onClick={nextTrack} disabled={!canGoNext}>
                  <SkipForward size={24} />
                </button>
              </div>
              <div className="flex gap-2">
                <button type="button" className={controlButton} onClick={toggleMute}>
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <button type="button" className={controlButton} onClick={() => undefined}>
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {activeTrack && layout === "large" ? (
          <div className="large-layout">
            <img src={coverImage} alt={activeTrack.title} className="cover-large" loading="eager" decoding="async" onError={handleCoverError} />

            <div className="px-6 pt-5">
              <h3 className="text-[2rem] font-bold leading-tight">{activeTrack.title}</h3>
              <p className="mt-1 text-lg opacity-85">{activeTrack.artist}</p>
              <div className="mt-3 flex flex-wrap gap-4 text-sm opacity-75">
                <div>
                  <p className="text-xs uppercase tracking-wider opacity-50 mb-1">Duration</p>
                  <p className="font-semibold">{formatTime(duration)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider opacity-50 mb-1">Track {activeIndex + 1} of {tracks.length}</p>
                </div>
                {playbackStateLabel ? (
                  <div>
                    <p className="text-xs uppercase tracking-wider opacity-50 mb-1">State</p>
                    <p className={`font-semibold ${isPlaying ? "text-emerald-200" : ""}`}>{playbackStateLabel}</p>
                  </div>
                ) : null}
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.18em] opacity-55">Now playing</p>
                <p className="mt-1 text-sm font-semibold opacity-95">{activeTrack.title}</p>
                <p className="mt-1 text-sm opacity-80">{activeTrack.artist}</p>
                {(activeTrack.category || activeTrack.type) && (
                  <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap gap-2">
                    {activeTrack.category && (
                      <span className="inline-block rounded px-2 py-1 text-xs font-semibold" style={{ backgroundColor: `${accent}30`, color: accent }}>
                        🎵 {activeTrack.category}
                      </span>
                    )}
                    {activeTrack.type && (
                      <span className="inline-block rounded px-2 py-1 text-xs font-semibold" style={{ backgroundColor: `${accent}20`, color: accent }}>
                        ⚡ {activeTrack.type}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 pb-1 pt-4 text-sm opacity-90 flex justify-between">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            <div className="px-6">
              <input
                type="range"
                min={0}
                max={Math.max(duration, 1)}
                value={Math.min(currentTime, Math.max(duration, 1))}
                onChange={(e) => onSeek(Number(e.target.value))}
                className="progress"
                style={{ accentColor: accent }}
              />
            </div>

            <div className="px-6 py-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2">
                <button type="button" className={controlButton} onClick={previousTrack} disabled={!canGoPrevious}>
                  <SkipBack size={22} />
                </button>
                <button
                  type="button"
                  className={`${controlButton} play-main`}
                  onClick={togglePlay}
                  style={{ backgroundColor: `${accent}24`, color: accent }}
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button type="button" className={controlButton} onClick={nextTrack} disabled={!canGoNext}>
                  <SkipForward size={22} />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button type="button" className={controlButton} onClick={toggleMute}>
                  {isMuted ? <VolumeX size={19} /> : <Volume2 size={19} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setVolume(next);
                    if (audioRef.current) audioRef.current.muted = false;
                    setIsMuted(false);
                  }}
                  className="w-28"
                  style={{ accentColor: accent }}
                />
              </div>
            </div>

            {showQueue && filteredTracks.length > 1 ? (
              <div>
                <div className="filter-controls">
                  <div className="filter-group">
                    <span className="filter-label">Category:</span>
                    <div className="filter-buttons">
                      <button
                        type="button"
                        className={`filter-btn ${!selectedCategory ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(null)}
                      >
                        All
                      </button>
                      {categories.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                          onClick={() => setSelectedCategory(cat)}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="filter-group">
                    <span className="filter-label">Type:</span>
                    <div className="filter-buttons">
                      <button
                        type="button"
                        className={`filter-btn ${!selectedType ? 'active' : ''}`}
                        onClick={() => setSelectedType(null)}
                      >
                        All
                      </button>
                      {types.map(typ => (
                        <button
                          key={typ}
                          type="button"
                          className={`filter-btn ${selectedType === typ ? 'active' : ''}`}
                          onClick={() => setSelectedType(typ)}
                        >
                          {typ}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <ul className="track-queue">
                  {filteredTracks.map((track, index) => {
                    const active = track.src === activeTrack?.src;
                    return (
                      <li key={`${track.src}-${index}`}>
                        <button
                          type="button"
                          className={active ? "active" : ""}
                          onClick={() => playTrackAt(index)}
                        >
                          <img src={track.cover || DEFAULT_COVER} alt={track.title} />
                          <span>
                            <strong>{track.title}</strong>
                            <em>{track.artist}</em>
                            {(track.category || track.type) && (
                              <span className="track-metadata" style={{ fontSize: '0.7rem', opacity: 0.7, marginLeft: '6px', display: 'block', marginTop: '2px' }}>
                                {track.category && <span>[{track.category}]</span>}
                                {track.type && <span style={{ marginLeft: '4px' }}>({track.type})</span>}
                              </span>
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <style jsx>{`
        .audio-shell {
          overflow: hidden;
          position: relative;
        }

        .audio-shell .progress {
          width: 100%;
        }

        .audio-shell button {
          color: inherit;
        }

        .small-layout {
          padding: 18px;
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }

        .small-bg-artwork {
          position: absolute;
          inset: -28px;
          background-size: cover;
          background-position: center;
          filter: blur(28px);
          opacity: 0.34;
          z-index: 0;
          animation: bgFadeIn 440ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .small-bg-layer {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.48);
          z-index: 0;
        }

        .small-header {
          margin: 0 15px;
          margin-left: 174px;
          border-radius: 15px 15px 0 0;
          padding: 13px 22px 10px;
          padding-left: 28px;
          background: #fff7f7;
          backdrop-filter: blur(4px);
          min-height: 96px;
          position: relative;
          z-index: 1;
          top: 0;
          transition:
            top 420ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 380ms cubic-bezier(0.22, 1, 0.36, 1),
            background-color 280ms ease;
        }

        .small-header.active {
          top: -82px;
          box-shadow: 0 18px 40px rgba(22, 27, 43, 0.16);
        }

        .small-title-wrap {
          animation: metaFadeIn 380ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform, opacity;
        }

        .small-title-wrap h3 {
          margin: 0;
          color: #54576f;
          font-size: 1.06rem;
          line-height: 1.15;
          font-weight: 700;
        }

        .small-title-wrap p {
          margin: 3px 0 11px;
          font-size: 0.81rem;
          color: #acaebd;
          opacity: 1;
          font-weight: 600;
        }

        .small-time-row {
          margin-bottom: 3px;
          display: flex;
          justify-content: space-between;
          height: 12px;
          overflow: hidden;
        }

        .small-time-row span {
          color: transparent;
          font-size: 0.7rem;
          font-weight: 700;
          border-radius: 9px;
          background: #ffe8ee;
          transition: 0.2s ease;
        }

        .small-time-row.active span {
          color: var(--audio-accent);
          background: transparent;
        }

        .small-status-strip {
          margin-bottom: 8px;
          display: flex;
          flex-wrap: wrap;
          gap: 6px 10px;
          color: #6f7384;
          font-size: 0.71rem;
          line-height: 1.25;
        }

        .small-status-strip span {
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .small-status-strip .is-live {
          color: var(--audio-accent);
          font-weight: 700;
        }

        .small-seek-area {
          position: relative;
          height: 4px;
          border-radius: 4px;
          background: #ffe8ee;
          cursor: pointer;
          transition: transform 260ms ease, box-shadow 260ms ease;
        }

        .small-seek-area:hover {
          transform: translateY(-0.5px);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.45);
        }

        .small-seek-hover,
        .small-seek-bar {
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          border-radius: 4px;
        }

        .small-seek-hover {
          background: #3b3d50;
          opacity: 0.18;
          z-index: 2;
        }

        .small-seek-bar {
          background: var(--audio-accent);
          z-index: 1;
          transition: width 180ms linear;
        }

        .small-seek-time {
          position: absolute;
          top: -29px;
          color: #fff;
          font-size: 0.72rem;
          white-space: pre;
          padding: 5px 6px;
          border-radius: 4px;
          background-color: #3b3d50;
          z-index: 3;
        }

        .small-controls {
          margin-top: 0;
          border-radius: 15px;
          background: #ffffff;
          min-height: 104px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
          position: relative;
          border: 1px solid #dce0e6;
          box-shadow: 0 24px 44px rgba(30, 41, 59, 0.14);
          padding: 0 16px 0 166px;
          z-index: 2;
          transition:
            transform 420ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 360ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .small-album-art {
          position: absolute;
          top: -30px;
          left: 22px;
          width: 132px;
          height: 132px;
          border-radius: 22px;
          overflow: hidden;
          box-shadow: 0 0 0 10px #fff;
          transition:
            top 420ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 420ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform, top;
        }

        .small-album-art.active {
          top: -40px;
          box-shadow: 0 0 0 4px #fff7f7, 0 30px 50px -15px #afb7c1;
          transform: translateY(-1px) scale(1.015);
        }

        .small-album-art img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          animation: artSwapIn 420ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .small-album-art.active img {
          animation: artSwapIn 420ms cubic-bezier(0.22, 1, 0.36, 1), rotateAlbumArt 5.8s linear infinite;
        }

        .small-album-art.buffering img {
          opacity: 0.72;
          filter: blur(1.2px);
        }

        .small-buffer-box {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 0.72rem;
          font-weight: 700;
          color: #1f1f1f;
          padding: 5px 8px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.35);
          opacity: 0;
          transition: opacity 0.15s ease;
          z-index: 3;
        }

        .small-album-art.buffering .small-buffer-box {
          opacity: 1;
        }

        .small-control-button {
          background: #ffffff;
          color: #d6dee7;
          border-radius: 8px;
          transform: translateY(0);
          box-shadow: 0 1px 0 rgba(0, 0, 0, 0.02);
          transition:
            background-color 220ms ease,
            color 220ms ease,
            transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 220ms ease;
        }

        .small-control-button:hover {
          background: #d6d6de;
          color: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(45, 52, 76, 0.18);
        }

        .small-control-button:active {
          transform: translateY(-1px) scale(0.98);
        }

        .small-controls .play-main.small-control-button {
          color: var(--audio-accent);
        }

        .play-main {
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.36);
        }

        @keyframes rotateAlbumArt {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes artSwapIn {
          from {
            opacity: 0;
            transform: scale(1.06);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes bgFadeIn {
          from {
            opacity: 0;
            transform: scale(1.03);
          }
          to {
            opacity: 0.34;
            transform: scale(1);
          }
        }

        @keyframes metaFadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .medium-layout {
          padding-top: 8px;
        }

        .cover-card {
          width: calc(100% - 36px);
          margin: 18px auto 0;
          border-radius: 16px;
          aspect-ratio: 1 / 1;
          object-fit: cover;
          box-shadow: 0 10px 20px rgba(83, 19, 49, 0.24);
        }

        .large-layout {
          padding: 14px 0 16px;
        }

        .cover-large {
          width: calc(100% - 36px);
          margin: 6px auto 0;
          border-radius: 18px;
          object-fit: cover;
          aspect-ratio: 1 / 1;
        }

        .track-queue {
          margin: 6px 14px 0;
          padding: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 260px;
          overflow: auto;
        }

        .filter-controls {
          margin: 12px 14px 8px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.09);
        }

        .filter-group {
          margin-bottom: 12px;
        }

        .filter-group:last-child {
          margin-bottom: 0;
        }

        .filter-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          opacity: 0.6;
          margin-bottom: 6px;
        }

        .filter-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .filter-btn {
          padding: 5px 10px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.05);
          color: inherit;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .filter-btn.active {
          background: var(--audio-accent);
          color: #fff;
          border-color: var(--audio-accent);
        }

        .track-queue button {
          width: 100%;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 12px;
          padding: 8px;
          display: flex;
          align-items: center;
          gap: 10px;
          text-align: left;
          transition: background 0.2s ease;
        }

        .track-queue button:hover {
          background: rgba(255, 255, 255, 0.06);
        }

        .track-queue button.active {
          background: rgba(46, 164, 255, 0.18);
          border-color: rgba(46, 164, 255, 0.5);
        }

        .track-queue img {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          object-fit: cover;
          flex-shrink: 0;
        }

        .track-queue strong,
        .track-queue em {
          display: block;
          line-height: 1.25;
        }

        .track-queue strong {
          font-size: 0.95rem;
          font-style: normal;
          font-weight: 600;
        }

        .track-queue em {
          font-size: 0.8rem;
          opacity: 0.76;
          font-style: normal;
        }

        @media (max-width: 880px) {
          .small-layout {
            padding: 12px;
          }

          .small-header {
            margin-left: 0;
            border-radius: 15px;
            top: 0 !important;
            padding: 12px;
            min-height: 98px;
          }

          .small-title-wrap h3 {
            font-size: 0.95rem;
          }

          .small-title-wrap p {
            font-size: 0.76rem;
            margin-bottom: 9px;
          }

          .small-controls {
            margin-top: 10px;
            padding: 12px;
            min-height: 102px;
            justify-content: flex-start;
            gap: 10px;
            padding-left: 152px;
          }

          .small-album-art {
            width: 120px;
            height: 120px;
            left: 12px;
            top: 12px;
            box-shadow: 0 0 0 5px #fff;
          }

          .small-album-art.active {
            top: 0;
          }
        }
      `}</style>
    </div>
  );
}
