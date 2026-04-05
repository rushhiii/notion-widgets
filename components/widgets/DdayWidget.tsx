"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

type BadgeColor = { bg: string; text: string };

const NOTION_PALETTE: Record<string, BadgeColor> = {
  gray: { text: "#9B9A97", bg: "#EBECED" },
  brown: { text: "#976D57", bg: "#F4EEEE" },
  orange: { text: "#D9730D", bg: "#FAEBDD" },
  yellow: { text: "#DFAB01", bg: "#FBF3DB" },
  green: { text: "#448361", bg: "#DDEDEA" },
  blue: { text: "#2383E2", bg: "#E0F1FF" },
  purple: { text: "#6940A5", bg: "#EAE4F2" },
  pink: { text: "#C14C8A", bg: "#F4DFEB" },
  red: { text: "#D44C47", bg: "#FBE4E4" },
  overview: { text: "#0f172a", bg: "#EBECED" },
};

function parseBool(val: string | null, fallback: boolean) {
  if (val === "1" || val === "true" || val === "yes") return true;
  if (val === "0" || val === "false" || val === "no") return false;
  return fallback;
}

function parseLocalDate(value: string) {
  // Ensures YYYY-MM-DD is treated as local midnight, avoiding timezone shifts.
  const parts = value.split("-");
  if (parts.length === 3) {
    const [y, m, d] = parts.map((p) => parseInt(p, 10));
    if (!Number.isNaN(y) && !Number.isNaN(m) && !Number.isNaN(d)) {
      return new Date(y, m - 1, d, 0, 0, 0, 0);
    }
  }
  return new Date(value);
}

function parseMonthDay(value: string, ref: Date): Date | null {
  const parts = value.split("-");
  if (parts.length !== 2) return null;
  const [mRaw, dRaw] = parts;
  const m = parseInt(mRaw, 10);
  const d = parseInt(dRaw, 10);
  if (Number.isNaN(m) || Number.isNaN(d)) return null;
  const year = ref.getFullYear();
  const candidate = new Date(year, m - 1, d, 0, 0, 0, 0);
  if (candidate.getMonth() !== m - 1 || candidate.getDate() !== d) return null;
  if (candidate < ref) {
    return new Date(year + 1, m - 1, d, 0, 0, 0, 0);
  }
  return candidate;
}

type UnitKey =
  | "day"
  | "week"
  | "month"
  | "year"
  | "hours"
  | "minutes"
  | "seconds"
  | "totalseconds"
  | "megaseconds";

const UNIT_ALIASES: Record<string, UnitKey> = {
  day: "day",
  days: "day",
  week: "week",
  weeks: "week",
  month: "month",
  months: "month",
  year: "year",
  years: "year",
  hour: "hours",
  hours: "hours",
  hr: "hours",
  hrs: "hours",
  minute: "minutes",
  minutes: "minutes",
  min: "minutes",
  mins: "minutes",
  second: "seconds",
  seconds: "seconds",
  sec: "seconds",
  secs: "seconds",
  totalseconds: "totalseconds",
  total: "totalseconds",
  total_seconds: "totalseconds",
  mega: "megaseconds",
  megasecond: "megaseconds",
  megaseconds: "megaseconds",
  mega_seconds: "megaseconds",
};

function parseUnitsList(param: string | null): UnitKey[] | null {
  if (!param) return null;
  if (param.toLowerCase() === "all") return [
    "day",
    "week",
    "month",
    "year",
    "hours",
    "minutes",
    "seconds",
    "totalseconds",
    "megaseconds",
  ];
  const parsed = param
    .split(",")
    .map((p) => p.trim().toLowerCase())
    .map((p) => UNIT_ALIASES[p])
    .filter(Boolean) as UnitKey[];

  return parsed.length ? parsed : null;
}

function normalizeHex(input: string) {
  const v = input.trim();
  const hex = v.startsWith("#") ? v : `#${v}`;
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex) ? hex : null;
}

function pickTextColor(key: string | null, fallback: string) {
  if (!key) return fallback;
  const preset = NOTION_PALETTE[key.toLowerCase()];
  if (preset) return preset.text;
  const hex = normalizeHex(key);
  return hex ?? fallback;
}

function pickColor(key: string | null, fallback: BadgeColor): BadgeColor {
  if (!key) return fallback;
  const preset = NOTION_PALETTE[key.toLowerCase()];
  if (preset) return preset;
  const hex = normalizeHex(key);
  if (hex) {
    const text = prefersLightText(hex) ? "#ffffff" : "#111111";
    return { bg: hex, text };
  }
  return fallback;
}

function prefersLightText(hex: string) {
  const h = hex.replace("#", "");
  const bigint = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance < 140;
}

function ordinal(day: number) {
  const mod10 = day % 10;
  const mod100 = day % 100;
  if (mod10 === 1 && mod100 !== 11) return `${day}st`;
  if (mod10 === 2 && mod100 !== 12) return `${day}nd`;
  if (mod10 === 3 && mod100 !== 13) return `${day}rd`;
  return `${day}th`;
}

function diffCalendarMonths(a: Date, b: Date) {
  const forward = a <= b;
  const start = forward ? a : b;
  const end = forward ? b : a;
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) months -= 1;
  return months;
}

type EmbedParams = Record<string, string | number | boolean | undefined>;

export function DdayWidget({ embedParams }: { embedParams?: EmbedParams }) {
  const searchParams = useSearchParams();
  const [now, setNow] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const [bgFromHash, setBgFromHash] = useState<string | null>(null);
  const [bgFromQueryRaw, setBgFromQueryRaw] = useState<string | null>(null);
  const originalBodyBg = useRef<string | null>(null);
  const originalHtmlBg = useRef<string | null>(null);

  const getParam = (key: string) => {
    if (embedParams && key in embedParams) {
      const value = embedParams[key];
      return value === undefined ? null : String(value);
    }
    return searchParams.get(key);
  };

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const hash = window.location.hash;
    const hexInHash = hash.match(/#[0-9a-fA-F]{3,6}/i)?.[0] ?? null;
    if (hexInHash) setBgFromHash(hexInHash);
    // Also capture bg from the raw query (supports unencoded hex without #).
    const href = window.location.href.split("#")[0];
    const match = href.match(/[?&](bg|background)=([^&#]+)/i);
    if (match && match[2]) setBgFromQueryRaw(decodeURIComponent(match[2]));
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

//   const targetDateStr = getParam("date") ?? "2022-11-29";
  const targetDateStr = getParam("date") ?? "2025-11-11";
  const unitsFlag = parseBool(getParam("units"), false);
  const showDateLabel = parseBool(getParam("showdate"), true);
  const mode = (getParam("mode") || "").toLowerCase();
  const isCountdown = mode === "countdown";
  const isCompact = mode === "compact";
  const themeParam = (getParam("theme") || "default").toLowerCase();
  const parsedTheme: "default" | "dark" | "light" =
    themeParam === "light" ? "light" : themeParam === "dark" ? "dark" : "default";
  const theme: "default" | "dark" | "light" = isCompact ? "dark" : parsedTheme;
  const alignParam = (getParam("align") || "left").toLowerCase();
  const note = getParam("note") || "";

  const displayList = parseUnitsList(getParam("display"));
  const hideList = parseUnitsList(getParam("notdisplay"));

  const initial: Record<UnitKey, boolean> = {
    day: parseBool(getParam("day"), true),
    week: parseBool(getParam("week"), true),
    month: parseBool(getParam("month"), unitsFlag),
    year: parseBool(getParam("year"), unitsFlag),
    hours: parseBool(getParam("hours"), isCountdown || unitsFlag),
    minutes: parseBool(getParam("minutes"), isCountdown || unitsFlag),
    seconds: parseBool(getParam("seconds"), isCountdown || unitsFlag),
    totalseconds: parseBool(getParam("totalseconds"), false),
    megaseconds: parseBool(getParam("megaseconds"), false),
  };

  if (displayList) {
    Object.keys(initial).forEach((k) => {
      const key = k as UnitKey;
      initial[key] = displayList.includes(key);
    });
  }

  if (hideList) {
    hideList.forEach((k) => {
      initial[k] = false;
    });
  }

  const showDays = initial.day;
  const showWeeks = initial.week;
  const showMonths = initial.month;
  const showYears = initial.year;
  const showHours = initial.hours;
  const showMinutes = initial.minutes;
  const showSeconds = initial.seconds;
  const showTotalSeconds = initial.totalseconds;
  const showMegaSeconds = initial.megaseconds;

  const globalColorOverride = getParam("color");
  const titleColorOverride = getParam("titleColor");
  const overviewColorOverride = getParam("overviewColor");
  const overviewTextOverride = getParam("overviewText");
  const backgroundOverride =
    getParam("background") ??
    getParam("bg") ??
    bgFromQueryRaw ??
    bgFromHash;
  const dayColorOverride = getParam("dayColor");
  const dayTextOverride = getParam("dayText");
  const weekColorOverride = getParam("weekColor");
  const weekTextOverride = getParam("weekText");
  const monthColorOverride = getParam("monthColor");
  const monthTextOverride = getParam("monthText");
  const yearColorOverride = getParam("yearColor");
  const yearTextOverride = getParam("yearText");
  const timeColorOverride = getParam("timeColor");
  const timeTextOverride = getParam("timeText");
  const hoursColorOverride = getParam("hoursColor");
  const hoursTextOverride = getParam("hoursText");
  const minutesColorOverride = getParam("minutesColor");
  const minutesTextOverride = getParam("minutesText");
  const secondsColorOverride = getParam("secondsColor");
  const secondsTextOverride = getParam("secondsText");
  const totalColorOverride = getParam("totalColor");
  const totalTextOverride = getParam("totalText");
  const megaColorOverride = getParam("megaColor");
  const megaTextOverride = getParam("megaText");

  const target = useMemo(() => {
    if (mode === "countdown" && now) {
      const md = parseMonthDay(targetDateStr, now);
      if (md) return md;
    }
    return parseLocalDate(targetDateStr);
  }, [mode, now, targetDateStr]);
  const isValidTarget = !Number.isNaN(target.getTime());
  const formattedDate = useMemo(() => {
    if (!isValidTarget) return "Invalid date";
    const weekday = target.toLocaleDateString("en-US", { weekday: "long" });
    const month = target.toLocaleDateString("en-US", { month: "long" });
    const day = ordinal(target.getDate());
    const year = target.getFullYear();
    return `${weekday}, ${month} ${day}, ${year}`;
  }, [isValidTarget, target]);

  const diffMs = useMemo(() => {
    if (!isValidTarget || !now) return 0;
    return target.getTime() - now.getTime();
  }, [isValidTarget, target, now]);
  const absMs = Math.abs(diffMs);
  const dayMs = 1000 * 60 * 60 * 24;
  const days = Math.floor(absMs / dayMs);
  const weeks = Math.floor(days / 7);
  const months = now ? diffCalendarMonths(now, target) : 0;
  const years = Math.floor(months / 12);
  const totalSeconds = Math.floor(absMs / 1000);
  const totalMinutes = Math.floor(absMs / (1000 * 60));
  const totalHours = Math.floor(absMs / (1000 * 60 * 60));
  const compactBaseSeconds = isCountdown ? Math.floor(Math.max(0, diffMs) / 1000) : totalSeconds;
  const compactDays = Math.floor(compactBaseSeconds / 86400);
  const compactHours = Math.floor((compactBaseSeconds % 86400) / 3600);
  const compactMinutes = Math.floor((compactBaseSeconds % 3600) / 60);
  const compactSeconds = compactBaseSeconds % 60;

  const sign = diffMs > 0 ? "left" : diffMs === 0 ? "today" : "passed";

  const badges: Array<{ key: string; text: string; color: BadgeColor }> = [];

  const globalColor = pickColor(globalColorOverride, NOTION_PALETTE.gray);

  const defaultDay = pickColor(dayColorOverride, globalColorOverride ? globalColor : NOTION_PALETTE.green);
  const defaultWeek = pickColor(weekColorOverride, globalColorOverride ? globalColor : NOTION_PALETTE.purple);
  const defaultMonth = pickColor(monthColorOverride, globalColorOverride ? globalColor : NOTION_PALETTE.blue);
  const defaultYear = pickColor(yearColorOverride, globalColorOverride ? globalColor : NOTION_PALETTE.orange);
  const baseTime = pickColor(timeColorOverride, globalColorOverride ? globalColor : NOTION_PALETTE.overview);
  const defaultHours = pickColor(
    hoursColorOverride,
    timeColorOverride || globalColorOverride ? baseTime : NOTION_PALETTE.blue,
  );
  const defaultMinutes = pickColor(
    minutesColorOverride,
    timeColorOverride || globalColorOverride ? baseTime : NOTION_PALETTE.purple,
  );
  const defaultSeconds = pickColor(
    secondsColorOverride,
    timeColorOverride || globalColorOverride ? baseTime : NOTION_PALETTE.pink,
  );
  const defaultTotal = pickColor(totalColorOverride, globalColorOverride ? globalColor : NOTION_PALETTE.red);
  const defaultMega = pickColor(megaColorOverride, globalColorOverride ? globalColor : NOTION_PALETTE.orange);
  const defaultOverview = pickColor(overviewColorOverride, baseTime);
  const defaultDayText = pickTextColor(dayTextOverride, defaultDay.text);
  const defaultWeekText = pickTextColor(weekTextOverride, defaultWeek.text);
  const defaultMonthText = pickTextColor(monthTextOverride, defaultMonth.text);
  const defaultYearText = pickTextColor(yearTextOverride, defaultYear.text);
  const groupTimeText = pickTextColor(timeTextOverride, baseTime.text);
  const defaultHoursText = pickTextColor(hoursTextOverride, timeTextOverride ? groupTimeText : defaultHours.text);
  const defaultMinutesText = pickTextColor(minutesTextOverride, timeTextOverride ? groupTimeText : defaultMinutes.text);
  const defaultSecondsText = pickTextColor(secondsTextOverride, timeTextOverride ? groupTimeText : defaultSeconds.text);
  const defaultTotalText = pickTextColor(totalTextOverride, defaultTotal.text);
  const defaultMegaText = pickTextColor(megaTextOverride, defaultMega.text);
  const defaultOverviewText = pickTextColor(overviewTextOverride, defaultOverview.text);
  // Title/date should default to Notion yellow text tone.
  const titleAccentColor = pickTextColor(titleColorOverride, "#DFAB01");
  const themeBackground =
    theme === "dark" ? "#191919" : theme === "light" ? "#f4f4f5" : "#0f172a";
  const pageBackground = pickColor(backgroundOverride, {
    bg: themeBackground,
    text: "#ffffff",
  }).bg;

  const alignItems = alignParam === "center" ? "center" : alignParam === "right" ? "flex-end" : "flex-start";
  const textAlign = alignParam === "center" ? "center" : alignParam === "right" ? "right" : "left";

  useEffect(() => {
    if (!mounted) return;
    if (originalBodyBg.current === null) originalBodyBg.current = document.body.style.backgroundColor;
    if (originalHtmlBg.current === null) originalHtmlBg.current = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = pageBackground;
    document.documentElement.style.backgroundColor = pageBackground;
    return () => {
      if (originalBodyBg.current !== null) document.body.style.backgroundColor = originalBodyBg.current;
      if (originalHtmlBg.current !== null) document.documentElement.style.backgroundColor = originalHtmlBg.current;
    };
  }, [pageBackground, mounted]);

  const pushBadge = (key: string, text: string, color: BadgeColor) => badges.push({ key, text, color });

  if (!isValidTarget) {
    pushBadge("invalid", "Invalid date", pickColor("red", defaultTotal));
  } else if (!mounted || !now) {
    // Avoid rendering mismatched SSR/CSR content until mounted.
  } else if (mode === "countdown") {
    const remMs = Math.max(0, diffMs);
    const remDays = Math.floor(remMs / dayMs);
    const remWeeks = Math.floor(remDays / 7);
    const remMonths = now ? Math.max(0, diffCalendarMonths(now, target)) : 0;
    const remYears = Math.floor(remMonths / 12);
    const remTotalSeconds = Math.floor(remMs / 1000);
    const remTotalMinutes = Math.floor(remMs / (1000 * 60));
    const remTotalHours = Math.floor(remMs / (1000 * 60 * 60));

    const label = "remaining";
    const isFuture = diffMs > 0;
    if (!isFuture) {
      pushBadge("passed", "Event has passed", defaultTotal);
    }

    if (showDays) {
      const text = `${remDays} days ${label}`;
      pushBadge("days", text, { ...defaultDay, text: defaultDayText });
    }
    if (showWeeks) {
      const text = `${remWeeks} weeks ${label}`;
      pushBadge("weeks", text, { ...defaultWeek, text: defaultWeekText });
    }
    if (showMonths) {
      const text = `${remMonths} months ${label}`;
      pushBadge("months", text, { ...defaultMonth, text: defaultMonthText });
    }
    if (showYears) {
      const text = `${remYears} years ${label}`;
      pushBadge("years", text, { ...defaultYear, text: defaultYearText });
    }
    if (showHours) {
      const text = `${remTotalHours} hours ${label}`;
      pushBadge("hours", text, { ...defaultHours, text: defaultHoursText });
    }
    if (showMinutes) {
      const text = `${remTotalMinutes} minutes ${label}`;
      pushBadge("minutes", text, { ...defaultMinutes, text: defaultMinutesText });
    }
    if (showSeconds) {
      const text = `${remTotalSeconds} seconds ${label}`;
      pushBadge("seconds", text, { ...defaultSeconds, text: defaultSecondsText });
    }
    if (showTotalSeconds) {
      const text = `${remTotalSeconds.toLocaleString()} total seconds ${label}`;
      pushBadge("total", text, { ...defaultTotal, text: defaultTotalText });
    }
    if (showMegaSeconds) {
      const mega = remTotalSeconds === 0 ? "0.000" : (remTotalSeconds / 1_000_000).toFixed(3);
      const text = `${mega} mega-seconds ${label}`;
      pushBadge("mega", text, { ...defaultMega, text: defaultMegaText });
    }
  } else if (mode === "overview") {
    const microseconds = Math.floor(absMs * 1000);
    const parts = [
      `${days} days`,
      `${weeks} weeks`,
      `${Math.abs(months)} months`,
      `${Math.abs(years)} years`,
      `${totalHours} hours`,
      `${totalMinutes} minutes`,
      `${totalSeconds} seconds`,
      `${microseconds.toLocaleString()} microseconds`,
    ];
    const text = `${parts.join(", ")} ${sign}`;
    pushBadge("overview", text, { ...defaultOverview, text: defaultOverviewText });
  } else if (mode === "compact") {
    // Compact mode renders via dedicated grid below.
  } else {
    if (showDays) {
      const value = days;
      const text = days === 0 ? "D-Day" : `${value} days ${sign}`;
      pushBadge("days", text, { ...defaultDay, text: defaultDayText });
    }
    if (showWeeks) {
      const value = weeks;
      const text = weeks === 0 ? "D-Week" : `${value} weeks ${sign}`;
      pushBadge("weeks", text, { ...defaultWeek, text: defaultWeekText });
    }
    if (showMonths) {
      const value = Math.abs(months);
      const text = months === 0 ? "This month" : `${value} months ${sign}`;
      pushBadge("months", text, { ...defaultMonth, text: defaultMonthText });
    }
    if (showYears) {
      const value = Math.abs(years);
      const text = years === 0 ? "This year" : `${value} years ${sign}`;
      pushBadge("years", text, { ...defaultYear, text: defaultYearText });
    }
    if (showHours) {
      const text = `${totalHours} hours ${sign}`;
      pushBadge("hours", text, { ...defaultHours, text: defaultHoursText });
    }
    if (showMinutes) {
      const text = `${totalMinutes} minutes ${sign}`;
      pushBadge("minutes", text, { ...defaultMinutes, text: defaultMinutesText });
    }
    if (showSeconds) {
      const text = `${totalSeconds} seconds ${sign}`;
      pushBadge("seconds", text, { ...defaultSeconds, text: defaultSecondsText });
    }
    if (showTotalSeconds) {
      const text = `${totalSeconds.toLocaleString()} total seconds ${sign}`;
      pushBadge("total", text, { ...defaultTotal, text: defaultTotalText });
    }
    if (showMegaSeconds) {
      const mega = (totalSeconds / 1_000_000).toFixed(3);
      const text = `${mega} mega-seconds ${sign}`;
      pushBadge("mega", text, { ...defaultMega, text: defaultMegaText });
    }
  }

  // Animation: fade-in for background/title, then badges
  const [showBg, setShowBg] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  useEffect(() => {
    setShowBg(true);
    const badgeTimeout = setTimeout(() => setShowBadges(true), 420); // bg/title fade in first
    return () => clearTimeout(badgeTimeout);
  }, []);

  const containerPadding = mode === "overview" || mode === "compact" ? "4vw" : 8;
  const containerAlign = mode === "compact" ? "center" : alignItems;
  const contentTextAlign = mode === "compact" ? "center" : textAlign;
  const compactCardBg = theme === "dark" ? "rgba(255 255 255 / 0)" : "rgba(0 0 0 / 0)";
  const compactCardBorder = theme === "dark" ? "none" : "none";
  const compactValueColor = theme === "dark" ? "#f4f4f5" : "#0f172a";
  const compactLabelColor = theme === "dark" ? "#f4f4f5" : "#334155";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        alignItems: containerAlign,
        padding: containerPadding,
        fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Helvetica, Arial, sans-serif",
        background: pageBackground,
        textAlign: contentTextAlign,
        minHeight: 180,
        opacity: showBg ? 1 : 0,
        transition: 'opacity 0.7s cubic-bezier(.4,0,.2,1)',
      }}
    >
      {showDateLabel && (
        <div
          style={{
            color: titleAccentColor,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            padding: "4px 0",
            opacity: showBg ? 1 : 0,
            transform: showBg ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.7s cubic-bezier(.4,0,.2,1), transform 0.7s cubic-bezier(.4,0,.2,1)',
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 600,
              fontStyle: "italic",
              fontFamily: "Georgia, 'Times New Roman', serif",
              letterSpacing: 0.3,
              lineHeight: 1.2,
            }}
          >
            {formattedDate}
          </span>
          {note && (
            <span
              style={{
                fontSize: 14,
                fontWeight: 500,
                opacity: 0.85,
                marginTop: 2,
              }}
            >
              {note}
            </span>
          )}
        </div>
      )}
      {isCompact && mounted && now && isValidTarget && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 10,
            width: "100%",
            maxWidth: 560,
            alignItems: "stretch",
          }}
        >
          {[
            { label: "days", value: compactDays },
            { label: "hours", value: compactHours },
            { label: "minutes", value: compactMinutes },
            { label: "seconds", value: compactSeconds },
          ].map((item, i) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 96,
                width: "100%",
                textAlign: "center",
                background: compactCardBg,
                border: compactCardBorder,
                opacity: showBadges ? 1 : 0,
                transform: showBadges ? "translateY(0)" : "translateY(8px)",
                transition: `opacity 0.7s cubic-bezier(.4,0,.2,1) ${i * 0.09 + 0.42}s, transform 0.7s cubic-bezier(.4,0,.2,1) ${i * 0.09 + 0.42}s`,
              }}
            >
              <div style={{ fontSize: 35, fontWeight: 700, textAlign: "center", letterSpacing: "0.02em", lineHeight: 1, color: compactValueColor, width: "100%" }}>
                {String(item.value).padStart(2, "0")}
              </div>
              <div
                style={{
                  textAlign: "center",
                  fontSize: 11,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: compactLabelColor,
                  marginTop: 3,
                  width: "100%",
                }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>
      )}
      {!isCompact && badges.map((badge, i) => (
        <div
          key={badge.key}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            lineHeight: 1.2,
            whiteSpace: "normal",
            wordBreak: "break-word",
            maxWidth: "100%",
            color: badge.color.text,
            backgroundColor: badge.color.bg,
            boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
            opacity: showBadges ? 1 : 0,
            transform: showBadges ? 'translateY(0)' : 'translateY(16px)',
            transition: `opacity 0.7s cubic-bezier(.4,0,.2,1) ${i * 0.09 + 0.42}s, transform 0.7s cubic-bezier(.4,0,.2,1) ${i * 0.09 + 0.42}s`,
          }}
        >
          {badge.text}
        </div>
      ))}
    </div>
  );
}

export default DdayWidget;
