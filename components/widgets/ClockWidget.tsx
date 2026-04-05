"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Link2, Maximize2, Menu, Minimize2, Moon, Sun, Timer, TimerReset, X } from "lucide-react";

import { THEME_ORDER, THEMES, type ThemeName } from "./theme";

type TransparentBgMode = "off" | "dark" | "light";
type ClockMode = "flip" | "minimal";
type EmbedParams = Record<string, string | number | boolean | undefined>;

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

function parseTransparentBgMode(val: string | null, fallback: TransparentBgMode = "off"): TransparentBgMode {
  if (!val) return fallback;
  const normalized = val.trim().toLowerCase();
  if (normalized === "dark" || normalized === "light" || normalized === "off") {
    return normalized;
  }
  return fallback;
}

export function ClockWidget({ embedParams }: { embedParams?: EmbedParams }) {
  const searchParams = useSearchParams();
  const [now, setNow] = useState<Date | null>(null);

  const getParam = (key: string) => {
    if (embedParams && key in embedParams) {
      const value = embedParams[key];
      return value === undefined ? null : String(value);
    }
    return searchParams.get(key);
  };

  const sizeFromQuery = parseIntParam(getParam("size"), 75, 50, 120);
  const formatFromQuery = getParam("format") === "24";
  const secondsFromQuery = parseBool(getParam("seconds"), true);
  const controlsFromQuery = parseBool(getParam("controls"), false);
  const themeFromQuery = (getParam("theme")?.trim().toLowerCase() as ThemeName) || "default";
  const dayFromQuery = parseBool(getParam("day"), false);
  const modeFromQueryRaw = (getParam("mode") || "flip").trim().toLowerCase();
  const modeFromQuery: ClockMode =
    modeFromQueryRaw === "minimal" || modeFromQueryRaw === "minimal-clock" ? "minimal" : "flip";
  const overlayFromQuery = parseBool(getParam("overlay"), false); // legacy
  const transparentBgFromQuery = parseBool(getParam("transparentbg"), overlayFromQuery);
  const transparentBgModeFromQuery = parseTransparentBgMode(
    getParam("transparentbgmode"),
    transparentBgFromQuery ? "dark" : "off",
  );

  const timezoneParam = getParam("tz") ?? "America/Toronto";
  const timezone = isValidTimeZone(timezoneParam) ? timezoneParam : "America/Toronto";

  const [size, setSize] = useState<number>(sizeFromQuery);
  const [is24h, setIs24h] = useState<boolean>(formatFromQuery);
  const [showSeconds, setShowSeconds] = useState<boolean>(secondsFromQuery);
  const [showDay, setShowDay] = useState<boolean>(dayFromQuery);
  const [mode, setMode] = useState<ClockMode>(modeFromQuery);
  const [transparentBgMode, setTransparentBgMode] = useState<TransparentBgMode>(transparentBgModeFromQuery);
  const [themeName, setThemeName] = useState<ThemeName>(THEME_ORDER.includes(themeFromQuery) ? themeFromQuery : "default");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(controlsFromQuery);
  const [copied, setCopied] = useState<boolean>(false);
  const copyTimeout = useRef<number | null>(null);
  const hidePanelTimer = useRef<number | null>(null);
  const hideNavTimer = useRef<number | null>(null);
  const [showNav, setShowNav] = useState<boolean>(true);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const [autoScale, setAutoScale] = useState(1);
  const [isVertical, setIsVertical] = useState(false);

  useEffect(() => {
    if (!embedParams) return;
    setSize(sizeFromQuery);
    setIs24h(formatFromQuery);
    setShowSeconds(secondsFromQuery);
    setShowDay(dayFromQuery);
    setMode(modeFromQuery);
    setTransparentBgMode(transparentBgModeFromQuery);
    setThemeName(THEME_ORDER.includes(themeFromQuery) ? themeFromQuery : "default");
    setShowControls(controlsFromQuery);
  }, [
    embedParams,
    sizeFromQuery,
    formatFromQuery,
    secondsFromQuery,
    dayFromQuery,
    modeFromQuery,
    transparentBgModeFromQuery,
    themeFromQuery,
    controlsFromQuery,
  ]);

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
    if (embedParams) return;
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
    if (storedControls === "true") setShowControls(false);
    const storedDay = window.localStorage.getItem("fc_day");
    if (storedDay === "true") setShowDay(true);
    if (storedDay === "false") setShowDay(false);
    const storedMode = window.localStorage.getItem("fc_mode");
    if (storedMode === "flip" || storedMode === "minimal") setMode(storedMode);
    const storedTransparentMode = parseTransparentBgMode(window.localStorage.getItem("fc_transparentbgmode"), "off");
    if (storedTransparentMode !== "off") {
      setTransparentBgMode(storedTransparentMode);
    } else {
      const storedOverlay = window.localStorage.getItem("fc_overlay");
      if (storedOverlay === "true") setTransparentBgMode("dark");
      if (storedOverlay === "false") setTransparentBgMode("off");
    }
  }, [embedParams]);

  useEffect(() => {
    if (embedParams) return;
    window.localStorage.setItem("fc_size", String(size));
  }, [size, embedParams]);

  useEffect(() => {
    if (embedParams) return;
    window.localStorage.setItem("fc_seconds", String(showSeconds));
  }, [showSeconds, embedParams]);

  useEffect(() => {
    if (embedParams) return;
    window.localStorage.setItem("fc_24h", String(is24h));
  }, [is24h, embedParams]);

  useEffect(() => {
    if (embedParams) return;
    window.localStorage.setItem("fc_theme", themeName);
  }, [themeName, embedParams]);

  useEffect(() => {
    if (embedParams) return;
    window.localStorage.setItem("fc_controls", String(showControls));
  }, [showControls, embedParams]);

  useEffect(() => {
    if (embedParams) return;
    window.localStorage.setItem("fc_day", String(showDay));
  }, [showDay, embedParams]);

  useEffect(() => {
    if (embedParams) return;
    window.localStorage.setItem("fc_mode", mode);
  }, [mode, embedParams]);

  useEffect(() => {
    if (embedParams) return;
    window.localStorage.setItem("fc_transparentbgmode", transparentBgMode);
    // Keep legacy flag for backward compatibility.
    window.localStorage.setItem("fc_overlay", String(transparentBgMode !== "off"));
  }, [transparentBgMode, embedParams]);

  useEffect(() => {
    return () => {
      if (copyTimeout.current) {
        window.clearTimeout(copyTimeout.current);
      }
      if (hidePanelTimer.current) {
        window.clearTimeout(hidePanelTimer.current);
      }
      if (hideNavTimer.current) {
        window.clearTimeout(hideNavTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!surfaceRef.current || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect.width ?? 0;
      if (!width) return;
      // const base = showSeconds ? 860 : 720;
      const base = 860;
      const factor = Math.min(1, width / base);
      setAutoScale(Number(factor.toFixed(3)) || 1);
      // setIsVertical(width < 760);
      setIsVertical(width < 300);
    });
    observer.observe(surfaceRef.current);
    return () => observer.disconnect();
  }, [showSeconds]);

  const scheduleHidePanel = () => {
    if (hidePanelTimer.current) window.clearTimeout(hidePanelTimer.current);
    hidePanelTimer.current = window.setTimeout(() => setShowControls(false), 2600);
  };

  const clearHidePanel = () => {
    if (hidePanelTimer.current) {
      window.clearTimeout(hidePanelTimer.current);
      hidePanelTimer.current = null;
    }
  };

  useEffect(() => {
    if (showControls) {
      scheduleHidePanel();
    } else {
      clearHidePanel();
    }
  }, [showControls]);

  const scheduleHideNav = () => {
    if (hideNavTimer.current) window.clearTimeout(hideNavTimer.current);
    hideNavTimer.current = window.setTimeout(() => setShowNav(false), 800);
  };

  const clearHideNav = () => {
    if (hideNavTimer.current) {
      window.clearTimeout(hideNavTimer.current);
      hideNavTimer.current = null;
    }
  };

  useEffect(() => {
    if (showNav) {
      scheduleHideNav();
    } else {
      clearHideNav();
    }
  }, [showNav]);

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

  const dayName = useMemo(() => {
    if (!now) return "";
    return now.toLocaleDateString("en-US", { weekday: "long", timeZone: timezone });
  }, [now, timezone]);

  const baseThemeVars = THEMES[themeName] ?? THEMES.default;
  const transparentBgColor = transparentBgMode === "dark" ? "#191919" : "#ffffff";
  const themeVars = transparentBgMode !== "off" ? { ...baseThemeVars, background: transparentBgColor } : baseThemeVars;
  const isMinimalMode = mode === "minimal";
  const minimalTextColor = isMinimalMode && transparentBgMode === "light" ? "#000000" : themeVars.text;
  const toggleTheme = () => setThemeName((prev) => (prev === "light" ? "default" : "light"));
  const themeList = useMemo(() => THEME_ORDER.filter((name) => name !== "light"), []);

  const rootStyle: CSSProperties & Record<`--${string}`, string> = {
    background: themeVars.background,
    color: minimalTextColor,
    "--background": themeVars.background,
    "--holder": themeVars.holder,
    "--text": minimalTextColor,
  };

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  const baseScale = Math.min(Math.max(size, 25), 120);
  const scale = baseScale * autoScale;

  return (
    <div
      className="fc-root"
      style={rootStyle}
      data-theme={themeName}
      data-overlay={transparentBgMode !== "off" ? "1" : "0"}
      data-transparent-mode={transparentBgMode}
      data-mode={mode}
    >
      <div className={`fc-surface ${isVertical ? "is-vertical" : ""}`} ref={surfaceRef}>
        {!isMinimalMode && <div className="fc-line" aria-hidden />}

        {isMinimalMode ? (
          <div className="fc-minimal-clock" style={{ transform: `scale(${scale / 100})`, transformOrigin: "center" }}>
            <div id="clock" style={{ color: minimalTextColor }}>
              <div id="time-wrapper">
                <div id="time" className="fc-minimal-time">
                  {showSeconds
                    ? `${currentTime?.hour ?? "--"}:${currentTime?.minute ?? "--"}:${currentTime?.second ?? "--"}`
                    : `${currentTime?.hour ?? "--"}:${currentTime?.minute ?? "--"}`}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={showSeconds ? "fc-container has-seconds" : "fc-container no-seconds"}
            style={{ transform: `scale(${scale / 100})`, transformOrigin: "center", position: "relative" }}
          >
            <div className="fc-holder">
              <FlipDigit value={currentTime?.hour ?? ""} pad={false} />
              {!is24h && <h2>{currentTime?.period}</h2>}
            </div>

            <div className="fc-holder">
              <FlipDigit value={currentTime?.minute ?? ""} />
              {showDay && dayName && !showSeconds && (
                <div className="fc-aux-label">
                  <h2>{dayName}</h2>
                </div>
              )}
            </div>

            {showSeconds && (
              <div className="fc-holder" id="seconds_holder">
                <FlipDigit value={currentTime?.second ?? ""} />
                {showDay && dayName && showSeconds && (
                  <div className="fc-aux-label">
                    <h2>{dayName}</h2>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div
          className={`fc-nav ${showNav ? "is-visible" : ""}`}
          onMouseEnter={() => {
            setShowNav(true);
            clearHideNav();
          }}
          onMouseLeave={scheduleHideNav}
        >
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

        <div
          className="fc-nav-hover-zone"
          onMouseEnter={() => {
            setShowNav(true);
            clearHideNav();
          }}
          onMouseLeave={scheduleHideNav}
        />

        {showControls && <div className="fc-panel-backdrop" onClick={() => setShowControls(false)} />}

        <div
          className={`fc-panel fc-panel-floating ${showControls ? "is-visible" : ""}`}
          role="dialog"
          aria-modal
          onMouseEnter={clearHidePanel}
          onMouseLeave={scheduleHidePanel}
        >
          <button className="fc-nav-btn fc-panel-close" aria-label="Close settings" onClick={() => setShowControls(false)}>
            <X size={18} strokeWidth={1.8} />
          </button>
          <div className="fc-panel-themes-only">
            <div className="fc-theme-overlay-toggle">
              {/* <button className={overlayMode ? "fc-chip is-active" : "fc-chip"} onClick={() => setOverlayMode((v) => !v)}>
                <span className={overlayMode ? "fc-sec-badge is-active" : "fc-sec-badge"}>NOTION BG</span>
              </button> */}
            </div>
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

        <div className={`fc-panel-dock ${showControls ? "is-visible" : ""}`} onMouseEnter={clearHidePanel} onMouseLeave={scheduleHidePanel}>
          <div className="fc-dock-slider">
            {/* <SizeIcon /> */}
            <input
              className="fc-slider"
              type="range"
              min={25}
              max={120}
              step={3}
              value={baseScale}
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
          <button
            className={transparentBgMode !== "off" ? "fc-chip is-active" : "fc-chip"}
            onClick={() => setTransparentBgMode((v) => (v === "off" ? "dark" : "off"))}
            aria-label="Toggle transparent background"
            title="Toggle transparent background"
          >
            <span className={transparentBgMode !== "off" ? "fc-sec-badge is-active" : "fc-sec-badge"}>BG</span>
          </button>
          <button
            className="fc-pill-toggle"
            onClick={() => {
              if (transparentBgMode === "off") return;
              setTransparentBgMode((v) => (v === "light" ? "dark" : "light"));
            }}
            disabled={transparentBgMode === "off"}
            aria-label="Toggle transparent background mode"
            title="Dark/Light transparent background"
          >
            <span className="fc-pill-text">D</span>
            <input type="checkbox" checked={transparentBgMode === "light"} readOnly disabled={transparentBgMode === "off"} />
            <span className="fc-pill-text">L</span>
          </button>
          <button className={showDay ? "fc-chip is-active" : "fc-chip"} onClick={() => setShowDay((v) => !v)}>
            <span className={showDay ? "fc-sec-badge is-active" : "fc-sec-badge"}>DAY</span>
          </button>
          <button className={isMinimalMode ? "fc-chip is-active" : "fc-chip"} onClick={() => setMode((v) => (v === "minimal" ? "flip" : "minimal"))}>
            <span className={isMinimalMode ? "fc-sec-badge is-active" : "fc-sec-badge"}>MIN</span>
          </button>
          <button
            className="fc-nav-btn embed-copy"
            aria-label="Copy embed"
            onClick={() => {
              const url = new URL(window.location.origin + "/clock");
              url.searchParams.set("embed", "1");
              url.searchParams.set("size", String(baseScale));
              url.searchParams.set("format", is24h ? "24" : "12");
              url.searchParams.set("seconds", String(showSeconds ? 1 : 0));
              url.searchParams.set("overlay", transparentBgMode !== "off" ? "1" : "0"); // legacy
              url.searchParams.set("transparentbg", transparentBgMode !== "off" ? "1" : "0");
              if (transparentBgMode !== "off") {
                url.searchParams.set("transparentbgmode", transparentBgMode);
              } else {
                url.searchParams.delete("transparentbgmode");
              }
              url.searchParams.set("theme", themeName);
              if (mode === "minimal") {
                url.searchParams.set("mode", "minimal");
              } else {
                url.searchParams.delete("mode");
              }
              url.searchParams.set("controls", "0");
              url.searchParams.set("day", showDay ? "1" : "0");
              url.searchParams.set("tz", timezone);
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

        <div
          title="toggle settings"
          className="fc-panel-hover-zone"
          role="button"
          tabIndex={0}
          aria-label="Close settings"
          onClick={() => setShowControls(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setShowControls(false);
            }
          }}
        />

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

export default ClockWidget;
