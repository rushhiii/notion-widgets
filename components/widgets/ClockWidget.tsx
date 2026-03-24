"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Link2, Maximize2, Menu, Minimize2, Moon, Sun, Timer, TimerReset, X } from "lucide-react";

import { THEME_ORDER, THEMES, type ThemeName } from "./theme";

function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format();
    return true;
  } catch {
    return false;
  }
}

function parseBool(val: string | null, fallback: boolean) {
  if (val === "1" || val === "true" || val === "yes") return true;
  if (val === "0" || val === "false" || val === "no") return false;
  return fallback;
}

function parseIntParam(val: string | null, fallback: number, min = 0, max = 999) {
  const n = Number(val);
  if (Number.isFinite(n)) {
    return Math.min(Math.max(n, min), max);
  }
  return fallback;
}

export function ClockWidget() {
  const searchParams = useSearchParams();
  const [now, setNow] = useState<Date | null>(null);

  const sizeFromQuery = parseIntParam(searchParams.get("size"), 85, 25, 120);
  const formatFromQuery = searchParams.get("format") === "24";
  const secondsFromQuery = parseBool(searchParams.get("seconds"), false);
  const controlsFromQuery = parseBool(searchParams.get("controls"), false);
  const themeFromQuery = (searchParams.get("theme")?.trim().toLowerCase() as ThemeName) || "default";

  const timezoneParam = searchParams.get("tz") ?? "America/Toronto";
  const timezone = isValidTimeZone(timezoneParam) ? timezoneParam : "America/Toronto";

  const [size, setSize] = useState<number>(sizeFromQuery);
  const [is24h, setIs24h] = useState<boolean>(formatFromQuery);
  const [showSeconds, setShowSeconds] = useState<boolean>(secondsFromQuery);
  const [themeName, setThemeName] = useState<ThemeName>(THEME_ORDER.includes(themeFromQuery) ? themeFromQuery : "default");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(controlsFromQuery);
  const [copied, setCopied] = useState<boolean>(false);
  const copyTimeout = useRef<number | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem("fc_size");
    if (stored) {
      const n = Number(stored);
      if (Number.isFinite(n)) setSize(n);
    }
    const storedSeconds = window.localStorage.getItem("fc_seconds");
    if (storedSeconds === "true") setShowSeconds(true);
    if (storedSeconds === "false") setShowSeconds(false);
    const storedFormat = window.localStorage.getItem("fc_24h");
    if (storedFormat === "true") setIs24h(true);
    if (storedFormat === "false") setIs24h(false);
    const storedTheme = window.localStorage.getItem("fc_theme") as ThemeName | null;
    if (storedTheme && THEME_ORDER.includes(storedTheme)) setThemeName(storedTheme);
    const storedControls = window.localStorage.getItem("fc_controls");
    if (storedControls === "true") setShowControls(true);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("fc_size", String(size));
  }, [size]);

  useEffect(() => {
    window.localStorage.setItem("fc_seconds", String(showSeconds));
  }, [showSeconds]);

  useEffect(() => {
    window.localStorage.setItem("fc_24h", String(is24h));
  }, [is24h]);

  useEffect(() => {
    window.localStorage.setItem("fc_theme", themeName);
  }, [themeName]);

  useEffect(() => {
    window.localStorage.setItem("fc_controls", String(showControls));
  }, [showControls]);

  useEffect(() => {
    return () => {
      if (copyTimeout.current) {
        window.clearTimeout(copyTimeout.current);
      }
    };
  }, []);

  const currentTime = useMemo(() => {
    if (!now) return null;
    const formatter = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: !is24h,
      timeZone: timezone,
    });

    const parts = formatter.formatToParts(now).reduce(
      (acc, part) => {
        if (part.type === "hour") acc.hour = part.value;
        if (part.type === "minute") acc.minute = part.value;
        if (part.type === "second") acc.second = part.value;
        if (part.type === "dayPeriod") acc.period = part.value.toUpperCase();
        return acc;
      },
      { hour: "", minute: "", second: "", period: "" },
    );

    return parts;
  }, [now, is24h, timezone]);

  const themeVars = THEMES[themeName];
  const toggleTheme = () => setThemeName((prev) => (prev === "light" ? "default" : "light"));
  const themeList = useMemo(() => THEME_ORDER.filter((name) => name !== "light"), []);

  const rootStyle: CSSProperties & Record<`--${string}`, string> = {
    background: themeVars.background,
    color: themeVars.text,
    "--background": themeVars.background,
    "--holder": themeVars.holder,
    "--text": themeVars.text,
  };

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  // const scale = Math.min(Math.max(size, 25), 120);
  const scale = Math.min(Math.max(size, 70), 100);

  return (
    <div className="fc-root" style={rootStyle}>
      <div className="fc-surface">
        <div className="fc-line" aria-hidden />

        <div className={showSeconds ? "fc-container has-seconds" : "fc-container no-seconds"} style={{ transform: `scale(${scale / 100})` }}>
          <div className="fc-holder">
            <FlipDigit value={currentTime?.hour ?? ""} pad={false} />
            {!is24h && <h2>{currentTime?.period}</h2>}
          </div>

          <div className="fc-holder">
            <FlipDigit value={currentTime?.minute ?? ""} />
          </div>

          {showSeconds && (
            <div className="fc-holder" id="seconds_holder">
              <FlipDigit value={currentTime?.second ?? ""} />
            </div>
          )}
        </div>

        <div className="fc-nav">
          <a className="fc-nav-btn" href="/timer" aria-label="Timer" title="Timer">
            <Timer size={18} strokeWidth={1.6} />
          </a>
          <a className="fc-nav-btn" href="/stopwatch" aria-label="Stopwatch" title="Stopwatch">
            <TimerReset size={18} strokeWidth={1.6} />
          </a>
          <button className="fc-nav-btn" aria-label="Toggle settings" onClick={() => setShowControls((v) => !v)}>
            <Menu size={18} strokeWidth={1.6} />
          </button>
          <button className="fc-nav-btn" aria-label="Toggle light/dark" onClick={toggleTheme}>
            {themeName === "light" ? <Moon size={18} strokeWidth={1.6} /> : <Sun size={18} strokeWidth={1.6} />}
          </button>
          <button className="fc-nav-btn" aria-label="Fullscreen" onClick={handleFullscreen}>
            {isFullscreen ? <Minimize2 size={18} strokeWidth={1.8} /> : <Maximize2 size={18} strokeWidth={1.8} />}
          </button>
        </div>

        {showControls && (
          <>
            <div className="fc-panel-backdrop" onClick={() => setShowControls(false)} />

            <div className="fc-panel fc-panel-floating" role="dialog" aria-modal>
              <button className="fc-nav-btn fc-panel-close" aria-label="Close settings" onClick={() => setShowControls(false)}>
                <X size={18} strokeWidth={1.8} />
              </button>
              <div className="fc-panel-themes-only">
                <div className="fc-themes fc-themes-compact">
                  {themeList.map((name) => {
                    const t = THEMES[name];
                    return (
                      <button
                        key={name}
                        className="fc-theme-swatch"
                        style={{ background: `linear-gradient(135deg, ${t.background}, ${t.holder})`, color: t.text }}
                        onClick={() => setThemeName(name)}
                        aria-label={name}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="fc-panel-dock">
              <div className="fc-dock-slider">
                {/* <SizeIcon /> */}
                <input
                  className="fc-slider"
                  type="range"
                  min={25}
                  max={120}
                  step={3}
                  value={scale}
                  onChange={(e) => setSize(Number(e.target.value))}
                />
              </div>
              <button className="fc-pill-toggle" onClick={() => setIs24h((v) => !v)}>
                <span className="fc-pill-text">12</span>
                <input type="checkbox" checked={is24h} readOnly />
                <span className="fc-pill-text">24</span>
              </button>
              <button className={showSeconds ? "fc-chip is-active" : "fc-chip"} onClick={() => setShowSeconds((v) => !v)}>
                <span className={showSeconds ? "fc-sec-badge is-active" : "fc-sec-badge"}>SEC</span>
              </button>
              {/* <button className="fc-nav-btn" aria-label="Fullscreen" onClick={handleFullscreen}>
                <FullscreenIcon active={isFullscreen} />
              </button> */}
              <button
                className="fc-nav-btn embed-copy"
                aria-label="Copy embed"
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("size", String(scale));
                  url.searchParams.set("format", is24h ? "24" : "12");
                  url.searchParams.set("seconds", String(showSeconds ? 1 : 0));
                  url.searchParams.set("theme", themeName);
                  url.searchParams.set("controls", showControls ? "1" : "0");
                  navigator.clipboard
                    .writeText(url.toString())
                    .then(() => {
                      setCopied(true);
                      if (copyTimeout.current) window.clearTimeout(copyTimeout.current);
                      copyTimeout.current = window.setTimeout(() => setCopied(false), 1200);
                    })
                    .catch(() => undefined);
                }}
              >
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

// Icons provided by lucide-react imports

function FlipDigit({ value, pad = true }: { value: string; pad?: boolean }) {
  const normalized = value === "" ? "" : String(Number(value));
  const padded = normalized === "" ? "" : pad ? normalized.padStart(2, "0") : normalized;
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
