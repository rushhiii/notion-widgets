"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faClock,
  faCompress,
  faDisplay,
  faExpand,
  faLink,
  faMoon,
  faStopwatch,
  faSun,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import { THEME_ORDER, THEMES, type ThemeName } from "./theme";

type TransparentBgMode = "off" | "dark" | "light";
type ClockMode = "flip" | "minimal";
type LineColorMode = "background" | "holder";
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

function formatMinimalDateByPattern(date: Date, timeZone: string, pattern: string) {
  const dayLong = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone }).format(date);
  const dayShort = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone }).format(date);
  const monthLong = new Intl.DateTimeFormat("en-US", { month: "long", timeZone }).format(date);
  const monthShort = new Intl.DateTimeFormat("en-US", { month: "short", timeZone }).format(date);
  const dayNumRaw = new Intl.DateTimeFormat("en-US", { day: "numeric", timeZone }).format(date);
  const monthNumRaw = new Intl.DateTimeFormat("en-US", { month: "numeric", timeZone }).format(date);
  const yearFull = new Intl.DateTimeFormat("en-US", { year: "numeric", timeZone }).format(date);

  const dayNum = dayNumRaw.padStart(2, "0");
  const monthNum = monthNumRaw.padStart(2, "0");
  const yearShort = yearFull.slice(-2);

  const tokens: Array<[string, string]> = [
    ["YYYY", yearFull],
    ["YY", yearShort],
    ["MMMM", monthLong],
    ["MMM", monthShort],
    ["MM", monthNum],
    ["M", monthNumRaw],
    ["DD", dayNum],
    ["D", dayNumRaw],
    ["dddd", dayLong],
    ["ddd", dayShort],
  ];

  let output = pattern;
  for (const [token, value] of tokens) {
    output = output.replaceAll(token, value);
  }
  return output;
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

  const instanceParam = (getParam("instance") || "").trim();
  const [instanceId, setInstanceId] = useState(instanceParam);
  const normalizedInstance = instanceId.replace(/[^a-z0-9_-]/gi, "");
  const storagePrefix = normalizedInstance ? `fc_${normalizedInstance}_` : "fc_";
  const storageKey = (suffix: string) => `${storagePrefix}${suffix}`;

  const bgFromQuery = (getParam("bg") || "").trim();
  const textFromQuery = (getParam("text") || "").trim();

  const sizeFromQuery = parseIntParam(getParam("size"), 75, 50, 120);
  const formatFromQuery = getParam("format") === "24";
  const secondsFromQuery = parseBool(getParam("seconds"), true);
  const controlsFromQuery = parseBool(getParam("controls"), false);
  const themeFromQuery = (getParam("theme")?.trim().toLowerCase() as ThemeName) || "default";
  const dayFromQuery = parseBool(getParam("day"), false);
  const minimalAmPmFromQuery = parseBool(getParam("minampm"), true);
  const minimalFullDateFromQuery = parseBool(getParam("mindate"), false);
  const minimalDateFormatFromQuery = getParam("mindateformat") || "dddd, MMMM D, YYYY";
  const lineColorModeFromQuery: LineColorMode =
    (getParam("linecolor") || "").trim().toLowerCase() === "holder" ? "holder" : "background";
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
  const [showMinimalAmPm, setShowMinimalAmPm] = useState<boolean>(minimalAmPmFromQuery);
  const [showMinimalFullDate, setShowMinimalFullDate] = useState<boolean>(minimalFullDateFromQuery);
  const [minimalDateFormat, setMinimalDateFormat] = useState<string>(minimalDateFormatFromQuery);
  const [lineColorMode, setLineColorMode] = useState<LineColorMode>(lineColorModeFromQuery);
  const [mode, setMode] = useState<ClockMode>(modeFromQuery);
  const [transparentBgMode, setTransparentBgMode] = useState<TransparentBgMode>(transparentBgModeFromQuery);
  const [themeName, setThemeName] = useState<ThemeName>(THEME_ORDER.includes(themeFromQuery) ? themeFromQuery : "default");
  const [customBackground, setCustomBackground] = useState<string>(bgFromQuery);
  const [customTextColor, setCustomTextColor] = useState<string>(textFromQuery);
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
    setInstanceId(instanceParam);
    setSize(sizeFromQuery);
    setIs24h(formatFromQuery);
    setShowSeconds(secondsFromQuery);
    setShowDay(dayFromQuery);
    setShowMinimalAmPm(minimalAmPmFromQuery);
    setShowMinimalFullDate(minimalFullDateFromQuery);
    setMinimalDateFormat(minimalDateFormatFromQuery);
    setLineColorMode(lineColorModeFromQuery);
    setMode(modeFromQuery);
    setTransparentBgMode(transparentBgModeFromQuery);
    setThemeName(THEME_ORDER.includes(themeFromQuery) ? themeFromQuery : "default");
    setShowControls(controlsFromQuery);
    setCustomBackground(bgFromQuery);
    setCustomTextColor(textFromQuery);
  }, [
    embedParams,
    instanceParam,
    sizeFromQuery,
    formatFromQuery,
    secondsFromQuery,
    dayFromQuery,
    minimalAmPmFromQuery,
    minimalFullDateFromQuery,
    minimalDateFormatFromQuery,
    lineColorModeFromQuery,
    modeFromQuery,
    transparentBgModeFromQuery,
    themeFromQuery,
    controlsFromQuery,
    bgFromQuery,
    textFromQuery,
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
    const stored = window.localStorage.getItem(storageKey("size"));
    if (stored) {
      const n = Number(stored);
      if (Number.isFinite(n)) setSize(n);
    }
    const storedSeconds = window.localStorage.getItem(storageKey("seconds"));
    if (storedSeconds === "true") setShowSeconds(true);
    if (storedSeconds === "false") setShowSeconds(false);
    const storedFormat = window.localStorage.getItem(storageKey("24h"));
    if (storedFormat === "true") setIs24h(true);
    if (storedFormat === "false") setIs24h(false);
    const storedTheme = window.localStorage.getItem(storageKey("theme")) as ThemeName | null;
    if (storedTheme && THEME_ORDER.includes(storedTheme)) setThemeName(storedTheme);
    const storedControls = window.localStorage.getItem(storageKey("controls"));
    if (storedControls === "true") setShowControls(false);
    const storedDay = window.localStorage.getItem(storageKey("day"));
    if (storedDay === "true") setShowDay(true);
    if (storedDay === "false") setShowDay(false);
    const storedMinimalAmPm = window.localStorage.getItem(storageKey("min_ampm"));
    if (storedMinimalAmPm === "true") setShowMinimalAmPm(true);
    if (storedMinimalAmPm === "false") setShowMinimalAmPm(false);
    const storedMinimalFullDate = window.localStorage.getItem(storageKey("min_fulldate"));
    if (storedMinimalFullDate === "true") setShowMinimalFullDate(true);
    if (storedMinimalFullDate === "false") setShowMinimalFullDate(false);
    const storedMinimalDateFormat = window.localStorage.getItem(storageKey("min_dateformat"));
    if (storedMinimalDateFormat) setMinimalDateFormat(storedMinimalDateFormat);
    const storedLineColor = window.localStorage.getItem(storageKey("line_color"));
    if (storedLineColor === "holder" || storedLineColor === "background") {
      setLineColorMode(storedLineColor as LineColorMode);
    }
    const storedMode = window.localStorage.getItem(storageKey("mode"));
    if (storedMode === "flip" || storedMode === "minimal") setMode(storedMode);
    const storedTransparentMode = parseTransparentBgMode(window.localStorage.getItem(storageKey("transparentbgmode")), "off");
    if (storedTransparentMode !== "off") {
      setTransparentBgMode(storedTransparentMode);
    } else {
      const storedOverlay = window.localStorage.getItem(storageKey("overlay"));
      if (storedOverlay === "true") setTransparentBgMode("dark");
      if (storedOverlay === "false") setTransparentBgMode("off");
    }
    const storedBg = window.localStorage.getItem(storageKey("bg"));
    if (storedBg) setCustomBackground(storedBg);
    const storedText = window.localStorage.getItem(storageKey("text"));
    if (storedText) setCustomTextColor(storedText);
  }, [embedParams, storagePrefix]);

  useEffect(() => {
    if (embedParams) return;
    window.localStorage.setItem(storageKey("size"), String(size));
  }, [size, embedParams, storagePrefix]);

  useEffect(() => {
    if (embedParams) return;
    window.localStorage.setItem(storageKey("seconds"), String(showSeconds));
  }, [showSeconds, embedParams, storagePrefix]);

  useEffect(() => {
    if (embedParams) return;
    window.localStorage.setItem(storageKey("24h"), String(is24h));
  }, [is24h, embedParams, storagePrefix]);

  useEffect(() => {
    if (embedParams) return;
    window.localStorage.setItem(storageKey("theme"), themeName);
  }, [themeName, embedParams, storagePrefix]);

  useEffect(() => {
    if (embedParams) return;
    if (customBackground) {
      window.localStorage.setItem(storageKey("bg"), customBackground);
    } else {
      window.localStorage.removeItem(storageKey("bg"));
    }
  }, [customBackground, embedParams, storagePrefix]);

  useEffect(() => {
    if (embedParams) return;
    if (customTextColor) {
      window.localStorage.setItem(storageKey("text"), customTextColor);
    } else {
      window.localStorage.removeItem(storageKey("text"));
    }
  }, [customTextColor, embedParams, storagePrefix]);

  useEffect(() => {
    if (embedParams) return;
    window.localStorage.setItem(storageKey("controls"), String(showControls));
  }, [showControls, embedParams, storagePrefix]);

  useEffect(() => {
    if (embedParams) return;
    window.localStorage.setItem(storageKey("day"), String(showDay));
  }, [showDay, embedParams, storagePrefix]);

  useEffect(() => {
    if (embedParams) return;
    window.localStorage.setItem(storageKey("min_ampm"), String(showMinimalAmPm));
  }, [showMinimalAmPm, embedParams, storagePrefix]);

  useEffect(() => {
    if (embedParams) return;
    window.localStorage.setItem(storageKey("min_fulldate"), String(showMinimalFullDate));
  }, [showMinimalFullDate, embedParams, storagePrefix]);

  useEffect(() => {
    if (embedParams) return;
    window.localStorage.setItem(storageKey("min_dateformat"), minimalDateFormat);
  }, [minimalDateFormat, embedParams, storagePrefix]);

  useEffect(() => {
    if (embedParams) return;
    window.localStorage.setItem(storageKey("line_color"), lineColorMode);
  }, [lineColorMode, embedParams, storagePrefix]);

  useEffect(() => {
    if (embedParams) return;
    window.localStorage.setItem(storageKey("mode"), mode);
  }, [mode, embedParams, storagePrefix]);

  useEffect(() => {
    if (embedParams) return;
    window.localStorage.setItem(storageKey("transparentbgmode"), transparentBgMode);
    // Keep legacy flag for backward compatibility.
    window.localStorage.setItem(storageKey("overlay"), String(transparentBgMode !== "off"));
  }, [transparentBgMode, embedParams, storagePrefix]);

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
      const height = entries[0]?.contentRect.height ?? 0;
      if (!width) return;
      // Flip clock should be full-size at 300px width; keep minimal sizing baseline unchanged.
      const base = mode === "flip" ? 300 : 860;
      setAutoScale(Number(Math.min(1, width / base).toFixed(3)) || 1);

      // Match responsive behavior: switch to vertical only when view is narrow and tall.
      const effectiveHeight = height || window.innerHeight;
      const shouldUseVertical = width <= 1200 && effectiveHeight > width;
      setIsVertical(shouldUseVertical);
    });
    observer.observe(surfaceRef.current);
    return () => observer.disconnect();
  }, [showSeconds, mode]);

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

  const minimalTimeString = useMemo(() => {
    const hour = currentTime?.hour ?? "--";
    const minute = currentTime?.minute ?? "--";
    const second = currentTime?.second ?? "--";
    return showSeconds ? `${hour}:${minute}:${second}` : `${hour}:${minute}`;
  }, [currentTime, showSeconds]);

  const dayName = useMemo(() => {
    if (!now) return "";
    return now.toLocaleDateString("en-US", { weekday: "long", timeZone: timezone });
  }, [now, timezone]);

  const minimalFullDateText = useMemo(() => {
    if (!now) return "";
    const pattern = minimalDateFormat.trim() || "dddd, MMMM D, YYYY";
    return formatMinimalDateByPattern(now, timezone, pattern);
  }, [now, timezone, minimalDateFormat]);

  const baseThemeVars = THEMES[themeName] ?? THEMES.default;
  const transparentBgColor = transparentBgMode === "dark" ? "#191919" : "#ffffff";
  const themeVars = transparentBgMode !== "off" ? { ...baseThemeVars, background: transparentBgColor } : baseThemeVars;
  const isMinimalMode = mode === "minimal";
  const baseTextColor = themeVars.text;
  const resolvedBackground = customBackground || themeVars.background;
  const resolvedTextColor = customTextColor || baseTextColor;
  const lineColor = lineColorMode === "holder" ? themeVars.holder : resolvedBackground;
  const toggleTheme = () => setThemeName((prev) => (prev === "light" ? "default" : "light"));
  const themeList = useMemo(() => THEME_ORDER.filter((name) => name !== "light"), []);

  const baseScale = Math.min(Math.max(size, 25), 120);
  const scale = baseScale * autoScale;
  const minimalSizeMultiplier = String(Number((scale / 75).toFixed(3)));

  const rootStyle: CSSProperties & Record<`--${string}`, string> = {
    background: resolvedBackground,
    color: resolvedTextColor,
    "--background": resolvedBackground,
    "--line-color": lineColor,
    "--holder": themeVars.holder,
    "--text": resolvedTextColor,
    "--minimal-size-mult": minimalSizeMultiplier,
  };

  const handleInstanceBlur = (value: string) => {
    const sanitized = value.replace(/[^a-z0-9_-]/gi, "");
    setInstanceId(sanitized);
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (sanitized) {
      url.searchParams.set("instance", sanitized);
    } else {
      url.searchParams.delete("instance");
    }
    window.history.replaceState({}, "", url.toString());
  };

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

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
            <div className="fc-minimal-clock">
            <div id="clock" style={{ color: resolvedTextColor }}>
              <div id="time-wrapper">
                <div id="time" className="fc-minimal-time" aria-label={minimalTimeString}>
                  {minimalTimeString.split("").map((char, index) => (
                    <span
                      key={`${index}-${char}`}
                      className={char === ":" ? "fc-minimal-sep" : "fc-minimal-digit"}
                      aria-hidden="true"
                    >
                      {char}
                    </span>
                  ))}
                  {!is24h && showMinimalAmPm && currentTime?.period && (
                    <span id="am-pm" className="fc-minimal-period">
                      {currentTime.period}
                    </span>
                  )}
                </div>
                {/* {!is24h && showMinimalAmPm && currentTime?.period && <div id="am-pm" className="fc-minimal-period">{currentTime.period}</div>} */}
                {showDay && dayName && <div className="fc-minimal-day">{dayName}</div>}
                {showMinimalFullDate && <div className="fc-minimal-full-date">{minimalFullDateText}</div>}
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
            <FontAwesomeIcon icon={faClock} fixedWidth />
          </a>
          <a className="fc-nav-btn" href="/stopwatch" aria-label="Stopwatch" title="Stopwatch">
            <FontAwesomeIcon icon={faStopwatch} fixedWidth />
          </a>
          <button className="fc-nav-btn" aria-label="Toggle settings" onClick={() => setShowControls((v) => !v)}>
            <FontAwesomeIcon icon={faBars} fixedWidth />
          </button>
          <button className="fc-nav-btn" aria-label="Toggle light/dark" onClick={toggleTheme}>
            {themeName === "light" ? <FontAwesomeIcon icon={faMoon} fixedWidth /> : <FontAwesomeIcon icon={faSun} fixedWidth />}
          </button>
          <button className="fc-nav-btn" aria-label="Fullscreen" onClick={handleFullscreen}>
            {isFullscreen ? <FontAwesomeIcon icon={faCompress} fixedWidth /> : <FontAwesomeIcon icon={faExpand} fixedWidth />}
          </button>
        </div>

        <div
          className="fc-nav-hover-zone"
          onMouseEnter={() => {
            setShowNav(true);
            clearHideNav();
          }}
          onMouseLeave={scheduleHideNav}
          onClick={() => {
            if (!isVertical) return;
            setShowNav(true);
            clearHideNav();
          }}
          onTouchStart={() => {
            if (!isVertical) return;
            setShowNav(true);
            clearHideNav();
          }}
        />

        {showControls && <div className="fc-panel-backdrop" onClick={() => setShowControls(false)} />}

        <div
          className={`fc-panel fc-panel-floating fc-panel-compact ${showControls ? "is-visible" : ""}`}
          role="dialog"
          aria-modal
          onMouseEnter={clearHidePanel}
          onMouseLeave={scheduleHidePanel}
        >
          <button className="fc-nav-btn fc-panel-close" aria-label="Close settings" onClick={() => setShowControls(false)}>
            <FontAwesomeIcon icon={faXmark} fixedWidth />
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
          <div className="fc-panel-section items-center" style={{ display: "flex" }}>
            <label className="fc-panel-label" htmlFor="fc-instance">
              Instance
            </label>
            <input
              id="fc-instance"
              className="fc-panel-input"
              value={instanceId}
              onChange={(e) => setInstanceId(e.target.value)}
              onBlur={(e) => handleInstanceBlur(e.target.value)}
              placeholder="Main"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div className="fc-panel-section">
            <span className="fc-panel-label">Pick Custom Colors</span>
            <div className="fc-color-row">
              <label className="fc-color-label" htmlFor="fc-bg-color">
                BG
              </label>
              <input
                id="fc-bg-color"
                type="color"
                className="fc-color-input"
                value={customBackground || themeVars.background}
                onChange={(e) => setCustomBackground(e.target.value)}
                aria-label="Background color"
              />
              <button className="fc-chip fc-color-reset" onClick={() => setCustomBackground("")}>Reset-CLR</button>
            </div>
            <div className="fc-color-row">
              <label className="fc-color-label" htmlFor="fc-text-color">
                Text
              </label>
              <input
                id="fc-text-color"
                type="color"
                className="fc-color-input"
                value={customTextColor || baseTextColor}
                onChange={(e) => setCustomTextColor(e.target.value)}
                aria-label="Text color"
              />
              <button className="fc-chip fc-color-reset" onClick={() => setCustomTextColor("")}>Reset-CLR</button>
            </div>
          </div>
          {!isMinimalMode && (
            <div className="fc-panel-section items-center" style={{ display: "flex" }}>
              <span className="fc-panel-label">divider line CLR?</span>
              <div className="fc-panel-toggle-row">
                <button
                  className={lineColorMode === "background" ? "fc-chip is-active" : "fc-chip"}
                  onClick={() => setLineColorMode("background")}
                >
                  BG
                </button>
                <button
                  className={lineColorMode === "holder" ? "fc-chip is-active" : "fc-chip"}
                  onClick={() => setLineColorMode("holder")}
                >
                  HOLDER
                </button>
              </div>
            </div>
          )}
          {isMinimalMode && (
            <div className="fc-minimal-format-wrap">
              <label htmlFor="minimal-date-format" className="fc-minimal-format-label">
                Date format
              </label>
              <input
                id="minimal-date-format"
                className="fc-minimal-format-input"
                value={minimalDateFormat}
                onChange={(e) => setMinimalDateFormat(e.target.value)}
                placeholder="dddd, MMMM D, YYYY"
              />
            </div>
          )}
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
          {/* display seconds */}
          <button className={showSeconds ? "fc-chip is-active" : "fc-chip"} onClick={() => setShowSeconds((v) => !v)}>
            <span className={showSeconds ? "fc-sec-badge is-active" : "fc-sec-badge"}>SEC</span>
          </button>
          {/* display dayname */}
          <button className={showDay ? "fc-chip is-active" : "fc-chip"} onClick={() => setShowDay((v) => !v)}>
            <span className={showDay ? "fc-sec-badge is-active" : "fc-sec-badge"}>DAY</span>
          </button>
          <button
            className={transparentBgMode !== "off" ? "fc-chip is-active" : "fc-chip"}
            onClick={() => setTransparentBgMode((v) => (v === "off" ? "dark" : "off"))}
            aria-label="Toggle transparent background"
            title="Toggle transparent background"
          >
            <span className={transparentBgMode !== "off" ? "fc-sec-badge is-active" : "fc-sec-badge"}>BG</span>
          </button>
          <span className="fc-dock-break" aria-hidden="true" />
          {/* transparent BG & it's toggle  */}
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
          {/* display minimal clock */}
          {isMinimalMode && (
            <button
              className={showMinimalAmPm ? "fc-chip is-active" : "fc-chip"}
              onClick={() => setShowMinimalAmPm((v) => !v)}
              disabled={is24h}
              aria-label="Toggle AM/PM in minimal mode"
              title="Toggle AM/PM in minimal mode"
            >
              <span className={showMinimalAmPm ? "fc-sec-badge is-active" : "fc-sec-badge"}>AP</span>
            </button>
          )}
          {isMinimalMode && (
            <button
              className={showMinimalFullDate ? "fc-chip is-active" : "fc-chip"}
              onClick={() => setShowMinimalFullDate((v) => !v)}
              aria-label="Toggle full date in minimal mode"
              title="Toggle full date in minimal mode"
            >
              <span className={showMinimalFullDate ? "fc-sec-badge is-active" : "fc-sec-badge"}>DATE</span>
            </button>
          )}
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
              if (normalizedInstance) {
                url.searchParams.set("instance", normalizedInstance);
              } else {
                url.searchParams.delete("instance");
              }
              if (customBackground) {
                url.searchParams.set("bg", customBackground);
              } else {
                url.searchParams.delete("bg");
              }
              if (customTextColor) {
                url.searchParams.set("text", customTextColor);
              } else {
                url.searchParams.delete("text");
              }
              if (lineColorMode === "holder") {
                url.searchParams.set("linecolor", "holder");
              } else {
                url.searchParams.delete("linecolor");
              }
              url.searchParams.set("controls", "0");
              url.searchParams.set("day", showDay ? "1" : "0");
              if (mode === "minimal") {
                url.searchParams.set("minampm", showMinimalAmPm ? "1" : "0");
                url.searchParams.set("mindate", showMinimalFullDate ? "1" : "0");
                if (minimalDateFormat.trim()) {
                  url.searchParams.set("mindateformat", minimalDateFormat.trim());
                } else {
                  url.searchParams.delete("mindateformat");
                }
              } else {
                url.searchParams.delete("minampm");
                url.searchParams.delete("mindate");
                url.searchParams.delete("mindateformat");
              }
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
            <FontAwesomeIcon icon={faLink} fixedWidth />
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
