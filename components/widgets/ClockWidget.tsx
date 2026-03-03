"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { parseBooleanParam, parsePositiveIntParam, resolveTheme } from "@/lib/utils";

function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format();
    return true;
  } catch {
    return false;
  }
}

export function ClockWidget() {
  const searchParams = useSearchParams();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());

    const id = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(id);
  }, []);

  const timezoneParam = searchParams.get("tz") ?? "America/Toronto";
  const timezone = isValidTimeZone(timezoneParam) ? timezoneParam : "America/Toronto";
  const format = searchParams.get("format") === "24" ? 24 : 12;
  const theme = resolveTheme(searchParams.get("theme"));
  const showToggle = parseBooleanParam(searchParams.get("toggle"), false);
  const defaultShowSeconds = parseBooleanParam(searchParams.get("seconds"), false);
  const showDetails = parseBooleanParam(searchParams.get("details"), false);
  const scalePercent = parsePositiveIntParam(searchParams.get("size"), 75);
  const [showSeconds, setShowSeconds] = useState(defaultShowSeconds);
  const [activeTheme, setActiveTheme] = useState(theme);

  useEffect(() => {
    setShowSeconds(defaultShowSeconds);
  }, [defaultShowSeconds]);

  useEffect(() => {
    setActiveTheme(theme);
  }, [theme]);

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: format === 12,
      }),
    [timezone, format],
  );

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        weekday: "short",
        month: "short",
        day: "2-digit",
      }),
    [timezone],
  );

  const parts = useMemo(() => {
    if (!now) {
      return {
        hour: "-",
        minute: "--",
        second: "--",
        dayPeriod: format === 12 ? "--" : "",
      };
    }

    const withSeconds = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: format === 12,
    }).formatToParts(now);

    const getPart = (type: Intl.DateTimeFormatPartTypes) =>
      withSeconds.find((part) => part.type === type)?.value ?? "--";

    return {
      hour: getPart("hour"),
      minute: getPart("minute"),
      second: getPart("second"),
      dayPeriod: format === 12 ? getPart("dayPeriod") : "",
    };
  }, [now, timezone, format]);

  const themeVars =
    activeTheme === "dark"
      ? {
          ["--background" as string]: "black",
          ["--line" as string]: "#101010",
          ["--text" as string]: "#b7b7b7",
          ["--holder" as string]: "#101010",
        }
      : {
          ["--background" as string]: "#f3f3f3",
          ["--line" as string]: "#e6e6e6",
          ["--text" as string]: "#000000",
          ["--holder" as string]: "#e6e6e6",
        };

  const containerScale = Math.max(25, Math.min(scalePercent, 120)) / 100;

  return (
    <main
      className="relative h-screen w-full overflow-hidden"
      style={themeVars as React.CSSProperties}
    >
      <div className="absolute inset-0 bg-[color:var(--background)]" />
      <div className="pointer-events-none absolute left-0 right-0 top-[51%] z-[3] h-2 -translate-y-1/2 bg-[color:var(--line)]" />

      <section
        className="relative z-[2] flex h-full w-full items-center justify-center px-[1%]"
        style={{ transform: `scale(${containerScale})` }}
      >
        <div className="flex h-full w-full items-center gap-[2%]">
            {/* py-[8.6%] */}
          {/* <div className="relative my-auto flex h-[84%] flex-1 items-center justify-center rounded-[50px] bg-[color:var(--holder)]"> */}
          <div className="relative my-auto flex h-[100%] flex-1 items-center justify-center rounded-[50px] bg-[color:var(--holder)] py-[8.6%]">
            <h1
              className="clock-bebas m-0 text-center leading-none text-[color:var(--text)]"
              style={{ fontSize: "clamp(30vw, 40vw, 50vw)" }}
            >
              {parts.hour}
            </h1>
            {format === 12 ? (
              <h2
                className="clock-bebas absolute bottom-[8%] left-[7%] m-0 leading-none text-[color:var(--text)]"
                style={{ fontSize: "clamp(3vw, 4vw, 5vw)", fontFamily: "Arial, sans-serif", fontWeight: 700 }}
              >
                {parts.dayPeriod}
              </h2>
            ) : null}
          </div>

          <div className="relative my-auto flex h-[100%] flex-1 items-center justify-center rounded-[50px] bg-[color:var(--holder)] py-[8.6%]">
            <h1
              className="clock-bebas m-0 text-center leading-none text-[color:var(--text)]"
              style={{ fontSize: "clamp(30vw, 40vw, 50vw)" }}
            >
              {parts.minute}
            </h1>
          </div>

          {showSeconds ? (
            <div className="relative my-auto flex h-[100%] w-[24%] min-w-[140px] items-center justify-center rounded-[50px] bg-[color:var(--holder)] py-[8.6%]">
              <h1
                className="clock-bebas m-0 text-center leading-none text-[color:var(--text)]"
                style={{ fontSize: "clamp(14vw, 18vw, 22vw)" }}
              >
                {parts.second}
              </h1>
            </div>
          ) : null}
        </div>

        {showToggle ? (
          <button
            type="button"
            onClick={() => setShowSeconds((previous) => !previous)}
            className="absolute right-6 top-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/70 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-200"
            aria-label="Toggle seconds"
          >
            <span>Seconds</span>
            <span className={`h-2.5 w-2.5 rounded-full ${showSeconds ? "bg-emerald-400" : "bg-zinc-500"}`} />
          </button>
        ) : null}

        {showDetails ? (
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-6 text-xs uppercase tracking-[0.14em] text-[color:var(--text)] opacity-70">
            <span>{timezone}</span>
            <span>{now ? dateFormatter.format(now) : "---, --- --"}</span>
            <span>{now ? timeFormatter.format(now) : "--:--:--"}</span>
          </div>
        ) : null}

      </section>

      <button
        type="button"
        onClick={() => setActiveTheme((previous) => (previous === "dark" ? "light" : "dark"))}
        className="fixed bottom-5 right-5 z-50 h-7 w-7 rounded-full transition-transform hover:scale-105"
        aria-label="Toggle theme"
        title="Toggle theme"
      >
        <span
          className={`block h-full w-full rounded-full ${
            activeTheme === "dark" ? "bg-zinc-500" : "bg-zinc-800"
          }`}
        />
      </button>
    </main>
  );
}
