"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Home, Link2, Maximize2, Menu, Minimize2, Pause, Play, RotateCcw, Stopwatch, Timer as TimerIcon } from "lucide-react";

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
  if (parts.length !== 2 && parts.length !== 3) return null;
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isFinite(n))) return null;
  if (nums.length === 2) {
    const [m, s] = nums;
    return m * 60 + s;
  }
  const [h, m, s] = nums;
  return h * 3600 + m * 60 + s;
}

function formatHMS(totalSeconds: number): [string, string, string] {
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return [hours, minutes, seconds];
}

export function StopwatchWidget() {
  const searchParams = useSearchParams();

  const sizeFromQuery = parseIntParam(searchParams.get("size"), 65, 25, 120);
  const themeFromQuery = (searchParams.get("theme")?.trim().toLowerCase() as ThemeName) || "default";
  const startFromQuery = parseBool(searchParams.get("start"), false);
  const initialTime = parseTimeParam(searchParams.get("t")) ?? 0;
  const controlsFromQuery = parseBool(searchParams.get("controls"), false);

  const [size, setSize] = useState<number>(sizeFromQuery);
  const [themeName, setThemeName] = useState<ThemeName>(THEME_ORDER.includes(themeFromQuery) ? themeFromQuery : "default");
  const [elapsed, setElapsed] = useState<number>(initialTime);
  const [isRunning, setIsRunning] = useState<boolean>(startFromQuery);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(controlsFromQuery);
  const [showSeconds, setShowSeconds] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const copyTimeout = useRef<number | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("stopwatch_size");
    if (stored) {
      const n = Number(stored);
      if (Number.isFinite(n)) setSize(n);
    }
    const storedControls = window.localStorage.getItem("stopwatch_controls");
    if (storedControls === "true") setShowControls(true);
    const storedSeconds = window.localStorage.getItem("stopwatch_seconds");
    if (storedSeconds === "false") setShowSeconds(false);
    const storedTheme = window.localStorage.getItem("fc_theme") as ThemeName | null;
    if (storedTheme && THEME_ORDER.includes(storedTheme)) setThemeName(storedTheme);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("stopwatch_size", String(size));
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
    window.localStorage.setItem("stopwatch_controls", String(showControls));
  }, [showControls]);

  useEffect(() => {
    window.localStorage.setItem("stopwatch_seconds", String(showSeconds));
  }, [showSeconds]);

  useEffect(() => {
    let id: number | null = null;
    if (isRunning) {
      id = window.setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (id !== null) window.clearInterval(id);
    };
  }, [isRunning]);

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
  const rootStyle: CSSProperties = {
    background: themeVars.background,
    color: themeVars.text,
    ["--background"]: themeVars.background,
    ["--holder"]: themeVars.holder,
    ["--text"]: themeVars.text,
  };

  const scale = Math.min(Math.max(size, 25), 120);

  const [hoursDisplay, minDisplay, secDisplay] = useMemo(() => formatHMS(elapsed), [elapsed]);

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  const copyEmbed = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("size", String(scale));
    url.searchParams.set("theme", themeName);
    url.searchParams.set("t", `${hoursDisplay}:${minDisplay}:${secDisplay}`);
    if (isRunning) url.searchParams.set("start", "1");
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
            <FlipDigit value={hoursDisplay} />
          </div>
          <div className="fc-holder">
            <FlipDigit value={minDisplay} />
          </div>
          {showSeconds && (
            <div className="fc-holder">
              <FlipDigit value={secDisplay} />
            </div>
          )}
        </div>

        <div className="fc-inline-controls">
          <button
            className="fc-inline-btn"
            aria-label={isRunning ? "Pause" : "Start"}
            onClick={() => setIsRunning((v) => !v)}
          >
            {isRunning ? <Pause size={18} strokeWidth={1.6} /> : <Play size={18} strokeWidth={1.6} />}
          </button>
          <button
            className="fc-inline-btn"
            aria-label="Reset"
            onClick={() => {
              setIsRunning(false);
              setElapsed(0);
            }}
          >
            <RotateCcw size={18} strokeWidth={1.6} />
          </button>
          <button className="fc-inline-btn" aria-label="Open settings" onClick={() => setShowControls(true)}>
            <Menu size={18} strokeWidth={1.6} />
          </button>
        </div>

        <div className="fc-nav">
          <a className="fc-nav-btn" href="/clock" aria-label="Home" title="Clock">
            <Home size={18} strokeWidth={1.6} />
          </a>
          <a className="fc-nav-btn" href="/timer" aria-label="Timer" title="Timer">
            <TimerIcon size={18} strokeWidth={1.6} />
          </a>
          <button
            className="fc-nav-btn"
            aria-label={isRunning ? "Pause" : "Start"}
            onClick={() => setIsRunning((v) => !v)}
          >
            {isRunning ? <Pause size={18} strokeWidth={1.6} /> : <Play size={18} strokeWidth={1.6} />}
          </button>
          <button
            className="fc-nav-btn"
            aria-label="Reset"
            onClick={() => {
              setIsRunning(false);
              setElapsed(0);
            }}
          >
            <RotateCcw size={18} strokeWidth={1.6} />
          </button>
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
              <button className="fc-inline-btn" aria-label={isRunning ? "Pause" : "Start"} onClick={() => setIsRunning((v) => !v)}>
                {isRunning ? <Pause size={18} strokeWidth={1.6} /> : <Play size={18} strokeWidth={1.6} />}
              </button>
              <button
                className="fc-inline-btn"
                aria-label="Reset"
                onClick={() => {
                  setIsRunning(false);
                  setElapsed(0);
                }}
              >
                <RotateCcw size={18} strokeWidth={1.6} />
              </button>
              <button className={showSeconds ? "fc-chip is-active" : "fc-chip"} onClick={() => setShowSeconds((v) => !v)}>
                <span className={showSeconds ? "fc-sec-badge is-active" : "fc-sec-badge"}>SEC</span>
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
