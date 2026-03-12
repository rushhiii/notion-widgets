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

export function DdayWidget() {
  const searchParams = useSearchParams();
  const [now, setNow] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const [bgFromHash, setBgFromHash] = useState<string | null>(null);
  const [bgFromQueryRaw, setBgFromQueryRaw] = useState<string | null>(null);
  const originalBodyBg = useRef<string | null>(null);
  const originalHtmlBg = useRef<string | null>(null);

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

//   const targetDateStr = searchParams.get("date") ?? "2022-11-29";
  const targetDateStr = searchParams.get("date") ?? "2025-11-11";
  const unitsFlag = parseBool(searchParams.get("units"), false);
  const showDateLabel = parseBool(searchParams.get("showdate"), true);
  const mode = (searchParams.get("mode") || "").toLowerCase();
  const alignParam = (searchParams.get("align") || "left").toLowerCase();

  const displayList = parseUnitsList(searchParams.get("display"));
  const hideList = parseUnitsList(searchParams.get("notdisplay"));

  const initial: Record<UnitKey, boolean> = {
    day: parseBool(searchParams.get("day"), true),
    week: parseBool(searchParams.get("week"), true),
    month: parseBool(searchParams.get("month"), unitsFlag),
    year: parseBool(searchParams.get("year"), unitsFlag),
    hours: parseBool(searchParams.get("hours"), unitsFlag),
    minutes: parseBool(searchParams.get("minutes"), unitsFlag),
    seconds: parseBool(searchParams.get("seconds"), unitsFlag || true),
    totalseconds: parseBool(searchParams.get("totalseconds"), false),
    megaseconds: parseBool(searchParams.get("megaseconds"), false),
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

  const globalColorOverride = searchParams.get("color");
  const titleColorOverride = searchParams.get("titleColor");
  const overviewColorOverride = searchParams.get("overviewColor");
  const backgroundOverride =
    searchParams.get("background") ??
    searchParams.get("bg") ??
    bgFromQueryRaw ??
    bgFromHash;
  const dayColorOverride = searchParams.get("dayColor");
  const weekColorOverride = searchParams.get("weekColor");
  const monthColorOverride = searchParams.get("monthColor");
  const yearColorOverride = searchParams.get("yearColor");
  const timeColorOverride = searchParams.get("timeColor");
  const totalColorOverride = searchParams.get("totalColor");
  const megaColorOverride = searchParams.get("megaColor");

  const target = useMemo(() => parseLocalDate(targetDateStr), [targetDateStr]);
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

  const sign = diffMs > 0 ? "left" : diffMs === 0 ? "today" : "passed";

  const badges: Array<{ key: string; text: string; color: BadgeColor }> = [];

  const globalColor = pickColor(globalColorOverride, NOTION_PALETTE.gray);

  const defaultDay = pickColor(dayColorOverride, globalColorOverride ? globalColor : NOTION_PALETTE.green);
  const defaultWeek = pickColor(weekColorOverride, globalColorOverride ? globalColor : NOTION_PALETTE.purple);
  const defaultMonth = pickColor(monthColorOverride, globalColorOverride ? globalColor : NOTION_PALETTE.blue);
  const defaultYear = pickColor(yearColorOverride, globalColorOverride ? globalColor : NOTION_PALETTE.orange);
  const defaultTime = pickColor(timeColorOverride, globalColorOverride ? globalColor : NOTION_PALETTE.gray);
  const defaultTotal = pickColor(totalColorOverride, globalColorOverride ? globalColor : NOTION_PALETTE.red);
  const defaultMega = pickColor(megaColorOverride, globalColorOverride ? globalColor : NOTION_PALETTE.yellow);
  const defaultOverview = pickColor(overviewColorOverride, defaultTime);
  const titleColor = pickColor(titleColorOverride, globalColor).text;
  const pageBackground = pickColor(backgroundOverride, { bg: "transparent", text: "#111111" }).bg;

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
    pushBadge("overview", text, defaultOverview);
  } else {
    if (showDays) {
      const value = days;
      const text = days === 0 ? "D-Day" : `${value} days ${sign}`;
      pushBadge("days", text, defaultDay);
    }
    if (showWeeks) {
      const value = weeks;
      const text = weeks === 0 ? "D-Week" : `${value} weeks ${sign}`;
      pushBadge("weeks", text, defaultWeek);
    }
    if (showMonths) {
      const value = Math.abs(months);
      const text = months === 0 ? "This month" : `${value} months ${sign}`;
      pushBadge("months", text, defaultMonth);
    }
    if (showYears) {
      const value = Math.abs(years);
      const text = years === 0 ? "This year" : `${value} years ${sign}`;
      pushBadge("years", text, defaultYear);
    }
    if (showHours) {
      const text = `${totalHours} hours ${sign}`;
      pushBadge("hours", text, defaultTime);
    }
    if (showMinutes) {
      const text = `${totalMinutes} minutes ${sign}`;
      pushBadge("minutes", text, defaultTime);
    }
    if (showSeconds) {
      const text = `${totalSeconds} seconds ${sign}`;
      pushBadge("seconds", text, defaultTime);
    }
    if (showTotalSeconds) {
      const text = `${totalSeconds.toLocaleString()} total seconds ${sign}`;
      pushBadge("total", text, defaultTotal);
    }
    if (showMegaSeconds) {
      const mega = (totalSeconds / 1_000_000).toFixed(3);
      const text = `${mega} mega-seconds ${sign}`;
      pushBadge("mega", text, defaultMega);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        alignItems,
        padding: 8,
        fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Helvetica, Arial, sans-serif",
        background: pageBackground,
        textAlign,
      }}
    >
      {showDateLabel && (
        <div
          style={{
            color: titleColor,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            padding: "4px 0",
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
        </div>
      )}
      {badges.map((badge) => (
        <div
          key={badge.key}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            color: badge.color.text,
            backgroundColor: badge.color.bg,
            boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
          }}
        >
          {badge.text}
        </div>
      ))}
    </div>
  );
}

export default DdayWidget;
