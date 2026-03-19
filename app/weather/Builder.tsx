"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, RefreshCw, Info } from "lucide-react";
import WeatherWidget from "@/components/widgets/WeatherWidget";

type FancyOption = { value: string; label: string };

function FancySelect({
  value,
  onChange,
  options,
  placeholder = "Select",
  dropdownClassName = "",
  buttonClassName = "flex w-full items-center justify-between rounded-lg border border-white/12 bg-white/10 px-3 py-2 text-sm text-white/90 shadow-[0_1px_0_rgba(255,255,255,0.08)] transition focus:border-white/40 focus:ring-2 focus:ring-white/15 focus:outline-none",
}: {
  value: string;
  onChange: (value: string) => void;
  options: FancyOption[];
  placeholder?: string;
  dropdownClassName?: string;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  const current = options.find((o) => o.value === value);

  return (
    <div ref={wrapperRef} className="relative">
      <button type="button" className={buttonClassName} onClick={() => setOpen((v) => !v)}>
        <span className="truncate">{current?.label ?? placeholder}</span>
        <span className="ml-2 text-xs text-white/60">▾</span>
      </button>

      {open && (
        <div
          className={`absolute left-0 z-20 mt-2 w-fit overflow-hidden rounded-lg border border-white/10 bg-zinc-900/95 shadow-2xl backdrop-blur ${dropdownClassName}`}
        >
          <div className="max-h-56 min-w-[160px] overflow-y-auto scrollbar-hide">
            {options.map((opt) => {
              const active = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`flex w-full items-center justify-between px-3 py-2 text-sm text-white/90 transition hover:bg-white/10 ${
                    active ? "bg-white/10" : ""
                  }`}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  <span className="truncate">{opt.label}</span>
                  {active && <span className="pl-2 text-xs text-white/70">●</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const WEATHER_PRESETS: Record<string, { bg: string; text: string; accent: string }> = {
  Mint: { bg: "#eef5ef", text: "#0f172a", accent: "#27ae60" },
  Sand: { bg: "#f5f0e6", text: "#3b2f2f", accent: "#c47c2c" },
  Dusk: { bg: "#0f172a", text: "#e2e8f0", accent: "#7c3aed" },
  Sky: { bg: "#e8f3fb", text: "#0b2345", accent: "#1d8fe1" },
};

const THEME_KEYS = Object.keys(WEATHER_PRESETS);

export function WeatherBuilder() {
  const [location, setLocation] = useState("Toronto");
  const [units, setUnits] = useState<"metric" | "imperial">("metric");
  const [mode, setMode] = useState<"minimal" | "detail">("minimal");
  const [theme, setTheme] = useState("Dusk");
  const [customBg, setCustomBg] = useState("");
  const [customText, setCustomText] = useState("");
  const [customAccent, setCustomAccent] = useState("");
  const [align, setAlign] = useState<"left" | "center" | "right">("center");
  const [matchPageBg, setMatchPageBg] = useState(false);
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (theme !== "custom") {
      setCustomBg("");
      setCustomText("");
      setCustomAccent("");
    }
  }, [theme]);

  const preset = WEATHER_PRESETS[theme] ?? WEATHER_PRESETS.Dusk;
  const bg = customBg || preset.bg;
  const text = customText || preset.text;
  const accent = customAccent || preset.accent;

  const params = useMemo(() => {
    const p = new URLSearchParams();
    p.set("embed", "1");
    p.set("location", location);
    p.set("units", units);
    p.set("mode", mode);
    p.set("theme", theme);
    if (customBg) p.set("bg", customBg.replace("#", ""));
    if (customText) p.set("text", customText.replace("#", ""));
    if (customAccent) p.set("accent", customAccent.replace("#", ""));
    p.set("align", align);
    if (matchPageBg) p.set("pagebg", "1");
    if (lat && lon) {
      p.set("lat", lat);
      p.set("lon", lon);
    }
    return p;
  }, [location, units, mode, theme, customBg, customText, customAccent, align, matchPageBg, lat, lon]);

  const livePreviewParams = useMemo(
    () => ({
      location,
      units,
      mode,
      theme,
      align,
      ...(matchPageBg ? { pagebg: 1 } : {}),
      ...(customBg ? { bg: customBg } : {}),
      ...(customText ? { text: customText } : {}),
      ...(customAccent ? { accent: customAccent } : {}),
      ...(lat && lon ? { lat, lon } : {}),
    }),
    [location, units, mode, theme, align, matchPageBg, customBg, customText, customAccent, lat, lon]
  );

  const reset = () => {
    setLocation("Toronto");
    setUnits("metric");
    setMode("minimal");
    setTheme("Dusk");
    setCustomBg("");
    setCustomText("");
    setCustomAccent("");
    setAlign("center");
    setMatchPageBg(false);
    setLat("");
    setLon("");
  };

  const copyLink = () => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.origin + "/weather");
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
    <main className="flex min-h-screen w-full items-start justify-center bg-zinc-950 px-4 py-10 text-zinc-100">
      <div className="grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-[340px,1fr]">
        <section className="flex max-h-[88vh] flex-col gap-4 overflow-y-auto scrollbar-hide rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Weather Widget Builder</h2>
              <p className="text-sm text-zinc-400">Set your options and copy the embed URL.</p>
            </div>
            <button
              className="rounded-full border border-white/10 p-2 text-zinc-200 transition hover:bg-white/10"
              onClick={reset}
              aria-label="Reset"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <label className="space-y-1 text-sm">
              <span className="text-zinc-300">Location (city or query)</span>
              <input
                className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Toronto"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Latitude (optional)</span>
                <input
                  className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder=""
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Longitude (optional)</span>
                <input
                  className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                  value={lon}
                  onChange={(e) => setLon(e.target.value)}
                  placeholder=""
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Units</span>
                <FancySelect
                  value={units}
                  onChange={(val) => setUnits(val as typeof units)}
                  options={[
                    { value: "metric", label: "Metric (°C)" },
                    { value: "imperial", label: "Imperial (°F)" },
                  ]}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Layout</span>
                <FancySelect
                  value={mode}
                  onChange={(val) => setMode(val as typeof mode)}
                  options={[
                    { value: "minimal", label: "Minimal" },
                    { value: "detail", label: "Detailed" },
                  ]}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Theme preset</span>
                <FancySelect
                  value={theme}
                  onChange={(val) => setTheme(val)}
                  options={[...THEME_KEYS.map((key) => ({ value: key, label: key })), { value: "custom", label: "Custom" }]}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Align</span>
                <FancySelect
                  value={align}
                  onChange={(val) => setAlign(val as typeof align)}
                  options={[
                    { value: "left", label: "Left" },
                    { value: "center", label: "Center" },
                    { value: "right", label: "Right" },
                  ]}
                />
              </label>
            </div>

            <div className={`grid gap-3 ${mode === "detail" ? "grid-cols-3" : "grid-cols-2"}`}>
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Background</span>
                <input
                  type="color"
                  className="color-swatch"
                  value={bg}
                  onChange={(e) => {
                    setTheme("custom");
                    setCustomBg(e.target.value);
                  }}
                />
              </label>
              {mode === "detail" && (
                <label className="space-y-1 text-sm">
                  <span className="text-zinc-300">Text</span>
                  <input
                    type="color"
                    className="color-swatch"
                    value={text}
                    onChange={(e) => {
                      setTheme("custom");
                      setCustomText(e.target.value);
                    }}
                  />
                </label>
              )}
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Accent</span>
                <input
                  type="color"
                  className="color-swatch"
                  value={accent}
                  onChange={(e) => {
                    setTheme("custom");
                    setCustomAccent(e.target.value);
                  }}
                />
              </label>
            </div>

            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-white/20 bg-white/10"
                checked={matchPageBg}
                onChange={(e) => setMatchPageBg(e.target.checked)}
              />
              Apply background to page
            </label>
          </div>

          <button
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-white"
            onClick={copyLink}
          >
            <Copy size={16} />
            {copied ? "Copied" : "Copy embed URL"}
          </button>
          <p className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
            <Info size={14} />
            <span>Tip: add embed=1 to hide the builder when pasting into Notion.</span>
          </p>
        </section>

        <section className="flex max-h-[88vh] flex-col items-stretch justify-center rounded-2xl border border-white/10 bg-white/5 shadow-xl overflow-hidden">
          <div
            className="flex h-full w-full items-center justify-center rounded-xl border border-white/10"
            style={{ background: matchPageBg ? bg : "#00000000" }}
          >
            <div className="w-full max-w-3xl p-2">
              <WeatherWidget embedParams={livePreviewParams} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default WeatherBuilder;
