"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Home, Link2, Maximize2, Menu, Minimize2, TimerReset } from "lucide-react";

import { THEME_ORDER, THEMES, type ThemeName } from "./theme";

function parseBool(val: string | null, fallback: boolean) {
  if (val === "1" || val === "true" || val === "yes") return true;
  if (val === "0" || val === "false" || val === "no") return false;
  return fallback;
}

function parseIntParam(val: string | null, fallback: number, min = 0, max = 999) {
  const n = Number(val);
  if (Number.isFinite(n)) return Math.min(Math.max(n, min), max);
  return fallback;
}

function parseTimeParam(raw: string | null): number | null {
  if (!raw) return null;
  const parts = raw.split(":");
  if (parts.length !== 2) return null;
  const [m, s] = parts.map((p) => Number(p));
  if (!Number.isFinite(m) || !Number.isFinite(s)) return null;
  return m * 60 + s;
}

export function TimerWidget() {
  const searchParams = useSearchParams();

  const sizeFromQuery = parseIntParam(searchParams.get("size"), 65, 25, 120);
  const themeFromQuery = (searchParams.get("theme")?.trim().toLowerCase() as ThemeName) || "default";
  const durationFromQuery = parseTimeParam(searchParams.get("t"));
  const autoStart = parseBool(searchParams.get("start"), false);
  const controlsFromQuery = parseBool(searchParams.get("controls"), false);

  const [size, setSize] = useState<number>(sizeFromQuery);
  const [themeName, setThemeName] = useState<ThemeName>(THEME_ORDER.includes(themeFromQuery) ? themeFromQuery : "default");
  const [durationSeconds, setDurationSeconds] = useState<number>(durationFromQuery ?? 15 * 60);
  const [remaining, setRemaining] = useState<number>(durationFromQuery ?? 15 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(controlsFromQuery);
  const [copied, setCopied] = useState<boolean>(false);
  const copyTimeout = useRef<number | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("timer_size");
    if (stored) {
      const n = Number(stored);
      if (Number.isFinite(n)) setSize(n);
    }
    const storedControls = window.localStorage.getItem("timer_controls");
    if (storedControls === "true") setShowControls(true);
    const storedTheme = window.localStorage.getItem("fc_theme") as ThemeName | null;
    if (storedTheme && THEME_ORDER.includes(storedTheme)) setThemeName(storedTheme);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("timer_size", String(size));
  }, [size]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "fc_theme" && e.newValue && THEME_ORDER.includes(e.newValue as ThemeName)) {
        setThemeName(e.newValue as ThemeName);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("timer_controls", String(showControls));
  }, [showControls]);

  useEffect(() => {
    let id: number | null = null;
    if (isRunning) {
      id = window.setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (id !== null) window.clearInterval(id);
    };
  }, [isRunning]);

  useEffect(() => {
    if (autoStart && durationFromQuery) {
      setIsRunning(true);
    }
  }, [autoStart, durationFromQuery]);

  useEffect(() => {
    const handler = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  useEffect(() => {
    return () => {
      if (copyTimeout.current) {
        window.clearTimeout(copyTimeout.current);
      }
    };
  }, []);

  const themeVars = THEMES[themeName];
  const rootStyle: CSSProperties & Record<`--${string}`, string> = {
    background: themeVars.background,
    color: themeVars.text,
    "--background": themeVars.background,
    "--holder": themeVars.holder,
    "--text": themeVars.text,
  };

  const scale = Math.min(Math.max(size, 25), 120);

  const [minDisplay, secDisplay] = useMemo(() => {
    const m = Math.floor(remaining / 60)
      .toString()
      .padStart(2, "0");
    const s = (remaining % 60).toString().padStart(2, "0");
    return [m, s];
  }, [remaining]);

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  const updateDuration = (minutes: number) => {
    const secs = minutes * 60;
    setDurationSeconds(secs);
    setRemaining(secs);
    setIsRunning(false);
  };

  const copyEmbed = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("size", String(scale));
    url.searchParams.set("theme", themeName);
    url.searchParams.set("t", `${minDisplay}:${secDisplay}`);
    url.searchParams.set("controls", showControls ? "1" : "0");
    navigator.clipboard
      .writeText(url.toString())
      .then(() => {
        setCopied(true);
        if (copyTimeout.current) window.clearTimeout(copyTimeout.current);
        copyTimeout.current = window.setTimeout(() => setCopied(false), 1200);
      })
      .catch(() => undefined);
  };

  return (
    <div className="fc-root" style={rootStyle}>
      <div className="fc-surface">
        <div className="fc-line" aria-hidden />

        <div className="fc-container" style={{ transform: `scale(${scale / 100})` }}>
          <div className="fc-holder">
            <FlipDigit value={minDisplay} />
          </div>
          <div className="fc-holder">
            <FlipDigit value={secDisplay} />
          </div>
        </div>

        <div className="fc-nav">
          <a className="fc-nav-btn" href="/clock" aria-label="Home" title="Clock">
            <Home size={18} strokeWidth={1.6} />
          </a>
          <a className="fc-nav-btn" href="/stopwatch" aria-label="Stopwatch" title="Stopwatch">
            <TimerReset size={18} strokeWidth={1.6} />
          </a>
          <button className="fc-nav-btn" aria-label="Toggle settings" onClick={() => setShowControls((v) => !v)}>
            <Menu size={18} strokeWidth={1.6} />
          </button>
          <button className="fc-nav-btn" aria-label="Fullscreen" onClick={handleFullscreen}>
            {isFullscreen ? <Minimize2 size={18} strokeWidth={1.8} /> : <Maximize2 size={18} strokeWidth={1.8} />}
          </button>
        </div>

        {showControls && (
          <>
            <div className="fc-panel-backdrop" onClick={() => setShowControls(false)} />

            <div className="fc-panel-dock">
              <div className="fc-dock-slider">
                <input
                  className="fc-slider"
                  type="range"
                  min={25}
                  max={120}
                  step={3}
                  value={scale}
                  onChange={(e) => setSize(Number(e.target.value))}
                  aria-label="Size"
                />
              </div>
              <div className="fc-dock-slider" style={{ minWidth: 160 }}>
                <input
                  className="fc-slider"
                  type="range"
                  min={1}
                  max={60}
                  step={1}
                  value={Math.floor(durationSeconds / 60)}
                  onChange={(e) => updateDuration(Number(e.target.value))}
                  aria-label="Duration minutes"
                />
              </div>
              <button className="fc-chip" onClick={() => setIsRunning(true)} disabled={isRunning || remaining === 0}>
                Start
              </button>
              <button className="fc-chip" onClick={() => setIsRunning(false)} disabled={!isRunning}>
                Pause
              </button>
              <button
                className="fc-chip"
                onClick={() => {
                  setIsRunning(false);
                  setRemaining(durationSeconds);
                }}
              >
                Reset
              </button>
              <button className="fc-nav-btn" aria-label="Copy embed" onClick={copyEmbed}>
                <Link2 size={18} strokeWidth={1.6} />
              </button>
            </div>
          </>
        )}

        {copied && <div className="fc-toast">Embed link copied</div>}
      </div>
    </div>
  );
}

function FlipDigit({ value }: { value: string }) {
  const padded = value.toString().padStart(2, "0");
  const [prev, setPrev] = useState<string>(padded);
  const [anim, setAnim] = useState(false);
  const nextRef = useRef<string>(padded);
  const flipTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (padded === prev) return;
    nextRef.current = padded;
    setAnim(true);

    if (flipTimeout.current) window.clearTimeout(flipTimeout.current);

    flipTimeout.current = window.setTimeout(() => {
      setPrev(nextRef.current);
      setAnim(false);
    }, 700);
    return () => {
      if (flipTimeout.current) window.clearTimeout(flipTimeout.current);
    };
  }, [padded, prev]);

  const current = prev;
  const incoming = nextRef.current;
  const topVal = anim ? incoming : current;

  return (
    <div className="fc-flip-container">
      <div className="fc-segment">
        <div className="fc-flip-card">
          <div className="fc-top">{topVal}</div>
          <div className="fc-bottom">{current}</div>
          {anim && (
            <>
              <div className="fc-top-flip">{current}</div>
              <div className="fc-bottom-flip">{incoming}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Icons provided by lucide-react imports
