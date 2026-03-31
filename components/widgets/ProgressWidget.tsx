"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Copy, Plus, RefreshCw, Trash } from "lucide-react";

import { WidgetContainer } from "@/components/ui/WidgetContainer";
import { parseBooleanParam, parseColorParam } from "@/lib/utils";

type Milestone = { id: string; label: string; value: number };
type BarRow = { id: string; label: string; progress: number; goal: number; milestones: Milestone[] };
type LayoutMode = "linear" | "circular";

type PreviewProps = {
  title: string;
  label: string;
  goal: number;
  progress: number;
  prefix: string;
  suffix: string;
  accent: string;
  track: string;
  text: string;
  background: string;
  showMilestones: boolean;
  showMilestoneList: boolean;
  showPct: boolean;
  showTotals: boolean;
  fullPage: boolean;
  layoutMode: LayoutMode;
  fontFamily: string;
  themeName: string;
  isEmbedView?: boolean;
  defaultStep: number;
  onAdjustBar?: (barId: string, delta: number) => void;
  bars: BarRow[];
};

const DEFAULTS = {
  title: "My Progress",
  label: "Orbs Collected",
  goal: 23300,
  progress: 15700,
  prefix: "💠",
  suffix: "",
  accent: "#3b82f6",
  track: "#e5e7eb",
  text: "#0f172a",
  background: "#f6f8ff",
  layoutMode: "linear" as LayoutMode,
  fontFamily: "var(--font-plus-jakarta), 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
  themeName: "midnight",
};

const THEME_PRESETS: Record<
  string,
  { accent: string; track: string; text: string; background: string; font?: string }
> = {
  daylight: {
    accent: "#3b82f6",
    track: "#e5e7eb",
    text: "#0f172a",
    background: "#f6f8ff",
    font: "var(--font-space-grotesk), 'Space Grotesk', 'Inter', system-ui, sans-serif",
  },
  midnight: {
    accent: "#a855f7",
    track: "#261a44",
    text: "#d8c8ff",
    background: "#0c0f1f",
    font: "var(--font-libre-baskerville), 'Libre Baskerville', 'Times New Roman', serif",
  },
  sunset: {
    accent: "#f97316",
    track: "#ffe6d5",
    text: "#1f172a",
    background: "#fff7ed",
    font: "var(--font-plus-jakarta), 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
  },
  mint: {
    accent: "#10b981",
    track: "#d1fae5",
    text: "#064e3b",
    background: "#ecfdf3",
    font: "var(--font-manrope), 'Manrope', 'Inter', system-ui, sans-serif",
  },
  serif: {
    accent: "#c084fc",
    track: "#e2d9ff",
    text: "#20123a",
    background: "#f6f3ff",
    font: "var(--font-playfair), 'Playfair Display', 'Georgia', serif",
  },
};

const STORAGE_KEY = "progress_widget_progress";

let milestoneId = 0;
function nextId() {
  milestoneId += 1;
  return `ms-${milestoneId}`;
}

function defaultMilestones(): Milestone[] {
  return [
    { id: nextId(), label: "+level 2", value: 8500 },
  ];
}

function clampNumber(value: number, min = 0, max = Number.POSITIVE_INFINITY) {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

function parseNumberParam(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return clampNumber(parsed, 0);
}

function parseMilestone(raw: string): Milestone | null {
  const [labelPart, valuePart] = raw.split(":");
  if (!valuePart) return null;
  const value = Number(valuePart);
  if (!Number.isFinite(value)) return null;
  return { id: nextId(), label: labelPart || "+ milestone", value: clampNumber(value, 0) };
}

function parseMilestones(searchParams: ReturnType<typeof useSearchParams>, barIndex?: number): Milestone[] {
  const entries: string[] = [];
  const key = typeof barIndex === "number" ? `ms${barIndex}` : "ms";
  const msAll = searchParams.getAll(key);
  if (msAll.length) entries.push(...msAll);
  const packed = searchParams.get("milestones");
  if (packed) entries.push(...packed.split("|").map((item) => item.trim()).filter(Boolean));

  const parsed = entries
    .map((entry) => parseMilestone(entry))
    .filter(Boolean) as Milestone[];

  if (parsed.length) return parsed;
  return defaultMilestones();
}

function parseBarRow(raw: string): BarRow | null {
  const parts = raw.split(":");
  if (parts.length < 3) return null;
  const label = parts[0] || "Bar";
  const progress = clampNumber(Number(parts[1]));
  const goal = clampNumber(Number(parts[2]), 1);
  if (!Number.isFinite(progress) || !Number.isFinite(goal)) return null;
  return { id: nextId(), label, progress, goal, milestones: [] };
}

function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}

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
      <button
        type="button"
        className={buttonClassName}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="truncate">{current?.label ?? placeholder}</span>
        <span className="ml-2 text-xs text-white/60">▾</span>
      </button>

      {open && (
        <div
          className={`absolute z-20 mt-2 w-fit min-w-full overflow-hidden rounded-lg border border-white/10 bg-zinc-900/95 shadow-2xl backdrop-blur ${dropdownClassName}`}
        >
          <div className="max-h-56 w-[100%] overflow-y-auto scrollbar-hide">
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

function ProgressPreview({
  title,
  label,
  goal,
  progress,
  prefix,
  suffix,
  accent,
  track,
  text,
  background,
  showMilestones,
  showMilestoneList,
  showPct,
  showTotals,
  fullPage,
  layoutMode,
  fontFamily,
  themeName,
  isEmbedView = false,
  defaultStep,
  onAdjustBar,
  bars,
}: PreviewProps) {
  // Animation: fade/slide-in for preview container and each bar row
  const [showPreview, setShowPreview] = useState(false);
  useEffect(() => {
    setShowPreview(true);
  }, []);

  const baseBar = { id: "base", label, progress, goal, milestones: defaultMilestones() };
  const rows = bars.length ? bars : [baseBar];
  const labelText = (label || "").trim();
  const transparent = fullPage && isEmbedView;
  const isMidnight = themeName === "midnight";
  const containerClass = transparent
    ? "flex w-full flex-col gap-3 p-2 sm:p-6"
    : isMidnight
      ? "flex w-full max-w-4xl flex-col gap-3 rounded-2xl border border-transparent bg-[#0c0f1f] px-7 py-6 shadow-sm"
      : "flex w-full max-w-4xl flex-col gap-3 rounded-2xl border border-zinc-200 bg-white/90 px-7 py-6 shadow-sm";
  const containerStyle = {
    color: text,
    fontFamily,
    backgroundColor: transparent ? "transparent" : background,
    backgroundImage: transparent || isMidnight
      ? undefined
      : "radial-gradient(circle at 25% 25%, rgba(59,130,246,0.08), transparent 45%)",
    transition: "background-color 180ms ease, color 180ms ease, border-color 180ms ease, opacity 0.7s cubic-bezier(.4,0,.2,1), transform 0.7s cubic-bezier(.4,0,.2,1)",
    opacity: showPreview ? 1 : 0,
    transform: showPreview ? 'translateY(0)' : 'translateY(24px)',
  } as const;

  return (
    <div className={containerClass} style={containerStyle}>
      {(title || labelText) && (
        <div className="space-y-1">
          {title && (
            <h2 className="text-3xl text-left font-semibold tracking-tight" style={{ color: accent }}>
              {title}
            </h2>
          )}
          {labelText && (
            <p className="text-sm text-left font-medium text-zinc-500" style={{ color: text }}>
              {labelText}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {rows.map((row, i) => {
          const safeGoal = Math.max(row.goal || 0, 1);
          const pct = clampNumber((row.progress / safeGoal) * 100, 0, 100);
          const milestones = row.milestones ?? defaultMilestones();
          const sortedMilestones = [...milestones]
            .filter((m) => Number.isFinite(m.value))
            .map((m) => ({ ...m, pct: clampNumber((m.value / safeGoal) * 100, 0, 100) }))
            .sort((a, b) => a.value - b.value);

          // Animation: fade/slide-in for each bar row
          const rowAnim = {
            opacity: showPreview ? 1 : 0,
            transform: showPreview ? 'translateY(0)' : 'translateY(16px)',
            transition: `opacity 0.7s cubic-bezier(.4,0,.2,1) ${i * 0.09}s, transform 0.7s cubic-bezier(.4,0,.2,1) ${i * 0.09}s`,
          };

          if (layoutMode === "circular") {
            const size = 240;
            const stroke = 14;
            const center = size / 2;
            const radius = center - stroke - 6;
            const circumference = 2 * Math.PI * radius;
            const arc = (pct / 100) * circumference;

            return (
              <div key={row.id} className="space-y-3 rounded-2xl border border-white/10 bg-white/70 p-4 shadow-sm" style={{ background: transparent ? background : "rgba(255,255,255,0.7)", ...rowAnim }}>
                {row.label.trim() !== "" && (
                  <div className="flex items-center justify-between text-sm font-semibold" style={{ color: text }}>
                    <span>{row.label.trim()}</span>
                    <span>
                      {prefix}
                      {formatNumber(row.goal)}
                      {suffix}
                    </span>
                  </div>
                )}

                <div className="relative flex flex-col items-center gap-3">
                  <div className="relative" style={{ width: size, height: size }}>
                    <svg width={size} height={size}>
                      <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke={track}
                        strokeWidth={stroke}
                        fill="none"
                        opacity={0.7}
                      />
                      <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke={accent}
                        strokeWidth={stroke}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${arc} ${circumference}`}
                        strokeDashoffset={0}
                        transform={`rotate(-90 ${center} ${center})`}
                      />
                    </svg>

                    {showMilestones && (
                      <div className="absolute inset-0">
                        {sortedMilestones.map((ms) => {
                          const angle = (ms.pct / 100) * 2 * Math.PI - Math.PI / 2;
                          const x = center + Math.cos(angle) * (radius - stroke / 2);
                          const y = center + Math.sin(angle) * (radius - stroke / 2);
                          return (
                            <div
                              key={`${row.id}-dot-${ms.id}`}
                              className="absolute -translate-x-1 -translate-y-0 rounded-full border border-white/70 shadow-sm"
                              style={{ left: x, top: y, width: 14, height: 14, background: accent }}
                              title={ms.label}
                            />
                          );
                        })}
                      </div>
                    )}

                    {onAdjustBar && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-3 opacity-0 transition-opacity duration-200 hover:opacity-100">
                        <button
                          className="pointer-events-auto rounded-full bg-white/80 px-2 py-1 text-sm font-semibold text-zinc-700 shadow"
                          onClick={() => onAdjustBar(row.id, -defaultStep)}
                          aria-label="Decrement progress"
                        >
                          -
                        </button>
                        <button
                          className="pointer-events-auto rounded-full bg-white/80 px-2 py-1 text-sm font-semibold text-zinc-700 shadow"
                          onClick={() => onAdjustBar(row.id, defaultStep)}
                          aria-label="Increment progress"
                        >
                          +
                        </button>
                      </div>
                    )}

                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center" style={{ color: text }}>
                      {showPct && <div className="text-2xl font-semibold">{pct.toFixed(1)}%</div>}
                      {showTotals && <div className="text-sm text-zinc-600" style={{ color: text }}>{formatNumber(row.progress)}</div>}
                    </div>
                  </div>

                  {showMilestoneList && (
                    <div className="w-full space-y-2">
                      {sortedMilestones.map((ms) => {
                        const milestonePct = clampNumber((ms.value / safeGoal) * 100, 0, 100);
                        return (
                          <div key={`${row.id}-list-${ms.id}`} className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-medium" style={{ color: text }}>
                              <span>{ms.label}</span>
                              <span>
                                {formatNumber(ms.value)} ({milestonePct.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="relative h-2 w-full rounded-full" style={{ background: track }}>
                              <div
                                className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
                                style={{ width: `${milestonePct}%`, background: accent }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div key={row.id} className="space-y-2 group">
              {row.label.trim() !== "" && (
                <div className="flex items-center justify-between text-sm font-semibold" style={{ color: text }}>
                  <span>{row.label.trim()}</span>
                  <span>
                    {prefix}
                    {formatNumber(row.goal)}
                    {suffix}
                  </span>
                </div>
              )}

              <div className="relative h-4 w-full overflow-visible">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: track, transition: "background-color 180ms ease" }}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
                  style={{ width: `${pct}%`, background: accent, transition: "width 300ms ease, background-color 180ms ease" }}
                />

                {onAdjustBar && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <button
                      className="pointer-events-auto translate-y-[-8%] translate-x-[-110%] rounded-full bg-white/0 px-1 py-0 text-[1.2rem] font-semibold"
                      onClick={() => onAdjustBar(row.id, -defaultStep)}
                      aria-label="Decrement progress"
                    >
                      -
                    </button>
                    <button
                      className="pointer-events-auto translate-y-[-8%] translate-x-[110%] rounded-full bg-white/0 px-1 py-0 text-[1.2rem] font-semibold"
                      onClick={() => onAdjustBar(row.id, defaultStep)}
                      aria-label="Increment progress"
                    >
                      +
                    </button>
                  </div>
                )}

                {showMilestones && (
                  <div className="pointer-events-none absolute -top-7 left-0 right-0 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:-translate-y-1">
                    {sortedMilestones.map((ms) => (
                      <div
                        key={`${row.id}-${ms.id}`}
                        className="absolute flex -translate-x-1/2 flex-col items-center"
                        style={{ left: `${ms.pct}%` }}
                      >
                        <div className="rounded-md bg-zinc-200 px-2 py-1 text-sm font-medium text-zinc-800 shadow-sm transition-transform duration-200 group-hover:scale-100">
                          {ms.label}
                        </div>
                        <div className="h-0 w-0 border-x-6 border-x-transparent border-t-6 border-t-zinc-200" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between px-1 text-sm text-zinc-600" style={{ color: text }}>
                <span>{showPct ? `${pct.toFixed(1)}%` : ""}</span>
                <span>{showTotals ? `${formatNumber(row.progress)}` : ""}</span>
              </div>

              {showMilestoneList && (
                <div className="space-y-2">
                  {sortedMilestones.map((ms) => {
                    const milestonePct = clampNumber((ms.value / safeGoal) * 100, 0, 100);
                    return (
                      <div key={`${row.id}-list-${ms.id}`} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-medium text-zinc-600" style={{ color: text }}>
                          <span>{ms.label}</span>
                          <span>
                            {formatNumber(ms.value)} ({milestonePct.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="relative h-2 w-full rounded-full" style={{ background: track }}>
                          <div
                            className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
                            style={{ width: `${milestonePct}%`, background: accent }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ProgressWidget() {
  const searchParams = useSearchParams();

  const fieldClass = "w-full rounded-lg border border-white/12 bg-white/10 px-3 py-2 text-sm text-white/90 placeholder:text-zinc-500 shadow-[0_1px_0_rgba(255,255,255,0.08)] transition focus:border-white/40 focus:ring-2 focus:ring-white/15 focus:outline-none";
  const compactFieldClass = "w-full rounded-md border border-transparent bg-white/10 px-3 py-1.5 text-sm text-white/90 placeholder:text-zinc-500 shadow-[0_1px_0_rgba(255,255,255,0.06)] transition focus:ring-2 focus:ring-white/15 focus:outline-none";

  const initial = useMemo(() => {
    const themeParam = searchParams.get("theme") || DEFAULTS.themeName;
    const themePreset = THEME_PRESETS[themeParam] ?? null;
    const layoutParam = (searchParams.get("mode") as LayoutMode) || DEFAULTS.layoutMode;
    const fontParamRaw = searchParams.get("font");
    const fontParam = fontParamRaw || themePreset?.font || DEFAULTS.fontFamily;

    const barsFromParams = searchParams
      .getAll("bar")
      .map((b) => parseBarRow(b))
      .filter(Boolean) as BarRow[];

    const barsWithMilestones = barsFromParams.map((bar, idx) => {
      const scoped = parseMilestones(searchParams, idx);
      const base = idx === 0 ? parseMilestones(searchParams) : defaultMilestones();
      return {
        ...bar,
        milestones: scoped.length ? scoped : base,
      };
    });

    const accentParam = parseColorParam(searchParams.get("accent")) ?? themePreset?.accent ?? DEFAULTS.accent;
    const trackParam = parseColorParam(searchParams.get("track")) ?? themePreset?.track ?? DEFAULTS.track;
    const textParam = parseColorParam(searchParams.get("text")) ?? themePreset?.text ?? DEFAULTS.text;
    const backgroundParam = parseColorParam(searchParams.get("bg")) ?? themePreset?.background ?? DEFAULTS.background;

    return {
      title: searchParams.get("title") ?? DEFAULTS.title,
      label: searchParams.get("label") ?? DEFAULTS.label,
      goal: parseNumberParam(searchParams.get("goal"), DEFAULTS.goal),
      progress: parseNumberParam(searchParams.get("progress"), DEFAULTS.progress),
      prefix: searchParams.get("prefix") ?? DEFAULTS.prefix,
      suffix: searchParams.get("suffix") ?? DEFAULTS.suffix,
      accent: accentParam,
      track: trackParam,
      text: textParam,
      background: backgroundParam,
      layoutMode: layoutParam,
      fontFamily: fontParam,
      fontCustom: Boolean(fontParamRaw),
      themeName: themePreset ? themeParam : "custom",
      showBuilder: !parseBooleanParam(searchParams.get("embed"), false) && !parseBooleanParam(searchParams.get("bare"), false),
      showMilestones: parseBooleanParam(searchParams.get("markers"), false),
      showMilestoneList: parseBooleanParam(searchParams.get("mlist"), false),
      showPct: parseBooleanParam(searchParams.get("pct"), true),
      showTotals: parseBooleanParam(searchParams.get("totals"), true),
      fullPage: parseBooleanParam(searchParams.get("full"), true),
      defaultStep: parseNumberParam(searchParams.get("step"), 100),
      bars: barsWithMilestones,
    };
  }, [searchParams]);

  const [title, setTitle] = useState(initial.title);
  const [label, setLabel] = useState(initial.label);
  const [goal, setGoal] = useState(initial.goal);
  const [progress, setProgress] = useState(initial.progress);
  const [prefix, setPrefix] = useState(initial.prefix);
  const [suffix, setSuffix] = useState(initial.suffix);
  const [accent, setAccent] = useState(initial.accent);
  const [track, setTrack] = useState(initial.track);
  const [text, setText] = useState(initial.text);
  const [background, setBackground] = useState(initial.background);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(initial.layoutMode ?? DEFAULTS.layoutMode);
  const [fontFamily, setFontFamily] = useState(initial.fontFamily ?? DEFAULTS.fontFamily);
  const [fontCustom, setFontCustom] = useState(initial.fontCustom ?? false);
  const [themeName, setThemeName] = useState(initial.themeName ?? "custom");
  const [copied, setCopied] = useState(false);
  const [showMilestones, setShowMilestones] = useState(initial.showMilestones);
  const [showMilestoneList, setShowMilestoneList] = useState(initial.showMilestoneList);
  const [showPct, setShowPct] = useState(initial.showPct);
  const [showTotals, setShowTotals] = useState(initial.showTotals);
  const [fullPage, setFullPage] = useState(initial.fullPage);
  const [adjustMode, setAdjustMode] = useState<"add" | "set">("add");
  const [defaultStep, setDefaultStep] = useState(initial.defaultStep || 100);
  const [bars, setBars] = useState<BarRow[]>(
    initial.bars.length
      ? initial.bars
      : [{ id: nextId(), label: "Progress", progress: initial.progress, goal: initial.goal, milestones: defaultMilestones() }],
  );
  const [selectedBarId, setSelectedBarId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Array<{ label: string; progress: number; goal?: number }>;
      if (!Array.isArray(saved) || !saved.length) return;
      setBars((current) =>
        current.map((bar, idx) => {
          const hit = saved.find((s) => s.label === bar.label);
          if (!hit) return bar;
          const nextProgress = clampNumber(hit.progress);
          const nextGoal = Number.isFinite(hit.goal) ? clampNumber(hit.goal || bar.goal, 1) : bar.goal;
          if (idx === 0) setProgress(nextProgress);
          return { ...bar, progress: nextProgress, goal: nextGoal };
        }),
      );
    } catch (err) {
      console.error("progress load failed", err);
    }
  }, []);

  useEffect(() => {
    if (!bars.length) return;
    const exists = bars.some((bar) => bar.id === selectedBarId);
    if (!selectedBarId || !exists) {
      setSelectedBarId(bars[0].id);
    }
  }, [bars, selectedBarId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload = bars.map((b) => ({ label: b.label, progress: b.progress, goal: b.goal }));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [bars]);

  useEffect(() => {
    setTitle(initial.title);
    setLabel(initial.label);
    setGoal(initial.goal);
    setProgress(initial.progress);
    setPrefix(initial.prefix);
    setSuffix(initial.suffix);
    setAccent(initial.accent);
    setTrack(initial.track);
    setText(initial.text);
    setBackground(initial.background);
    setLayoutMode(initial.layoutMode ?? DEFAULTS.layoutMode);
    setFontFamily(initial.fontFamily ?? DEFAULTS.fontFamily);
    setFontCustom(initial.fontCustom ?? false);
    setThemeName(initial.themeName ?? "custom");
    setShowMilestones(initial.showMilestones);
    setShowMilestoneList(initial.showMilestoneList);
    setShowPct(initial.showPct);
    setShowTotals(initial.showTotals);
    setFullPage(initial.fullPage);
    setAdjustMode("add");
    setDefaultStep(initial.defaultStep || 100);
    const nextBars = initial.bars.length
      ? initial.bars
      : [{ id: nextId(), label: "Progress", progress: initial.progress, goal: initial.goal, milestones: defaultMilestones() }];
    setBars(nextBars);
    setSelectedBarId(nextBars[0]?.id ?? null);
  }, [initial]);

  const showBuilder = initial.showBuilder;

  const primaryBar = bars[0];
  const activeBar = bars.find((b) => b.id === selectedBarId) ?? primaryBar;
  const activeMilestones = activeBar?.milestones ?? [];

  const updateBarProgress = (barId: string, compute: (prev: number) => number) => {
    setBars((current) => {
      const target = current.find((b) => b.id === barId);
      if (!target) return current;
      const nextValue = compute(target.progress);
      if (current[0]?.id === barId) {
        setProgress(nextValue);
      }
      return current.map((b) => (b.id === barId ? { ...b, progress: nextValue } : b));
    });
  };

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.search = "";
    url.searchParams.set("title", title);
    url.searchParams.set("label", label);
    url.searchParams.set("goal", String(goal));
    url.searchParams.set("progress", String(progress));
    url.searchParams.set("mode", layoutMode);
    url.searchParams.set("font", fontFamily);
    url.searchParams.set("theme", themeName || "custom");
    if (prefix) url.searchParams.set("prefix", prefix);
    if (suffix) url.searchParams.set("suffix", suffix);
    if (accent) url.searchParams.set("accent", accent.replace("#", ""));
    if (track) url.searchParams.set("track", track.replace("#", ""));
    if (text) url.searchParams.set("text", text.replace("#", ""));
    if (background) url.searchParams.set("bg", background.replace("#", ""));
    if (defaultStep !== 100) url.searchParams.set("step", String(defaultStep));
    if (showMilestoneList) url.searchParams.set("mlist", "1");
    if (!showPct) url.searchParams.set("pct", "0");
    if (!showTotals) url.searchParams.set("totals", "0");
    url.searchParams.set("full", fullPage ? "1" : "0");
    bars.forEach((bar, idx) => {
      url.searchParams.append("bar", `${bar.label}:${bar.progress}:${bar.goal}`);
      bar.milestones.forEach((ms) => {
        url.searchParams.append(`ms${idx}`, `${ms.label}:${ms.value}`);
      });
    });
    // Always generate the embed view URL so it opens directly to the widget (not the builder).
    url.searchParams.set("embed", "1");
    if (!showMilestones) url.searchParams.set("markers", "0");

    navigator.clipboard
      .writeText(url.toString())
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      })
      .catch(() => undefined);
  };

  const previewProps: PreviewProps = {
    title,
    label,
    goal,
    progress,
    prefix,
    suffix,
    accent,
    track,
    text,
    background,
    showMilestones,
    showMilestoneList,
    showPct,
    showTotals,
    fullPage,
    layoutMode,
    fontFamily,
    themeName,
    isEmbedView: false,
    defaultStep,
    onAdjustBar: (barId: string, delta: number) => {
      updateBarProgress(barId, (prev) => clampNumber(prev + delta));
    },
    bars,
  };

  if (!showBuilder) {
    if (fullPage) {
      const isMidnight = themeName === "midnight";
      const fullPageStyle = {
        minHeight: "100vh",
        width: "100%",
        backgroundColor: background,
        backgroundImage: isMidnight
          ? undefined
          : "radial-gradient(circle at 25% 25%, rgba(59,130,246,0.08), transparent 45%)",
        color: text,
        fontFamily,
      } as const;
      return (
        <div style={fullPageStyle}>
          <ProgressPreview {...previewProps} isEmbedView />
        </div>
      );
    }
    return (
      <WidgetContainer theme="light" className="bg-transparent" heightClassName="h-screen">
        <ProgressPreview {...previewProps} isEmbedView />
      </WidgetContainer>
    );
  }

  return (
    <>
    <main className="flex min-h-screen w-full items-start justify-center bg-zinc-950 px-4 py-10 text-zinc-100">
      <div className="grid w-full max-w-6xl grid-cols-1 gap-6 md:grid-cols-[340px,1fr]">
        {/* left widget container */}
        <section className="flex max-h-[88vh] flex-col gap-4 overflow-y-auto scrollbar-hide rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Progress Bar Builder</h2>
              <p className="text-sm text-zinc-400">Adjust values and copy your embed URL.</p>
            </div>
            <button
              className="rounded-full border border-white/10 p-2 text-zinc-200 transition hover:bg-white/10"
              onClick={() => {
                setTitle(DEFAULTS.title);
                setLabel(DEFAULTS.label);
                setGoal(DEFAULTS.goal);
                setProgress(DEFAULTS.progress);
                setPrefix(DEFAULTS.prefix);
                setSuffix(DEFAULTS.suffix);
                setAccent(DEFAULTS.accent);
                setTrack(DEFAULTS.track);
                setText(DEFAULTS.text);
                setBackground(DEFAULTS.background);
                setLayoutMode(DEFAULTS.layoutMode);
                setFontFamily(DEFAULTS.fontFamily);
                setFontCustom(false);
                setThemeName(DEFAULTS.themeName);
                const resetBar = {
                  id: nextId(),
                  label: "Progress",
                  progress: DEFAULTS.progress,
                  goal: DEFAULTS.goal,
                  milestones: defaultMilestones(),
                };
                setBars([resetBar]);
                setSelectedBarId(resetBar.id);
                setShowMilestones(true);
                setAdjustMode("add");
              }}
              aria-label="Reset"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <label className="space-y-1 text-sm">
              <span className="text-zinc-300">Title</span>
              <input className={fieldClass} value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-zinc-300">Label</span>
              <input className={fieldClass} value={label} onChange={(e) => setLabel(e.target.value)} />
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Display mode</span>
                <FancySelect
                  value={layoutMode}
                  onChange={(val) => setLayoutMode(val as LayoutMode)}
                  options={[
                    { value: "linear", label: "Horizontal bars" },
                    { value: "circular", label: "Circular dials" },
                  ]}
                />
              </label>

              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Theme</span>
                <FancySelect
                  value={themeName}
                  onChange={(nextTheme) => {
                    setThemeName(nextTheme);
                    const preset = THEME_PRESETS[nextTheme];
                    if (preset) {
                      setAccent(preset.accent);
                      setTrack(preset.track);
                      setText(preset.text);
                      setBackground(preset.background);
                      if (preset.font && !fontCustom) {
                        setFontFamily(preset.font);
                      }
                    }
                  }}
                  options={[
                    ...Object.keys(THEME_PRESETS).map((key) => ({
                      value: key,
                      label: key.charAt(0).toUpperCase() + key.slice(1),
                    })),
                    { value: "custom", label: "Custom" },
                  ]}
                />
              </label>

              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Typography</span>
                <FancySelect
                  value={fontFamily}
                  onChange={(val) => {
                    setFontFamily(val);
                    setFontCustom(true);
                  }}
                  dropdownClassName="-left-7"
                  options={[
                    { value: "var(--font-space-grotesk), 'Space Grotesk', 'Inter', system-ui, sans-serif", label: "Space Grotesk" },
                    { value: "var(--font-sora), 'Sora', 'Segoe UI', system-ui, sans-serif", label: "Sora" },
                    { value: "var(--font-plus-jakarta), 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif", label: "Plus Jakarta Sans" },
                    { value: "var(--font-manrope), 'Manrope', 'Inter', system-ui, sans-serif", label: "Manrope" },
                    { value: "var(--font-playfair), 'Playfair Display', 'Georgia', serif", label: "Playfair Display" },
                    { value: "var(--font-libre-baskerville), 'Libre Baskerville', 'Times New Roman', serif", label: "Libre Baskerville" },
                  ]}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Goal (primary)</span>
                <input
                  type="number"
                  min={0}
                  className={fieldClass}
                  value={goal}
                  onChange={(e) => {
                    const next = clampNumber(Number(e.target.value));
                    setGoal(next);
                    setBars((current) => current.map((b, i) => (i === 0 ? { ...b, goal: next } : b)));
                  }}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Progress (primary)</span>
                <input
                  type="number"
                  min={0}
                  className={fieldClass}
                  value={progress}
                  onChange={(e) => {
                    const next = clampNumber(Number(e.target.value));
                    setProgress(next);
                    setBars((current) => current.map((b, i) => (i === 0 ? { ...b, progress: next } : b)));
                  }}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Value Prefix</span>
                <input className={fieldClass} value={prefix} onChange={(e) => setPrefix(e.target.value)} />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Value Suffix</span>
                <input className={fieldClass} value={suffix} onChange={(e) => setSuffix(e.target.value)} />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Accent</span>
                <input
                  type="color"
                  className="color-swatch"
                  value={accent}
                  onChange={(e) => {
                    setThemeName("custom");
                    setAccent(e.target.value);
                  }}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Track</span>
                <input
                  type="color"
                  className="color-swatch"
                  value={track}
                  onChange={(e) => {
                    setThemeName("custom");
                    setTrack(e.target.value);
                  }}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Text</span>
                <input
                  type="color"
                  className="color-swatch"
                  value={text}
                  onChange={(e) => {
                    setThemeName("custom");
                    setText(e.target.value);
                  }}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Background</span>
                <input
                  type="color"
                  className="color-swatch"
                  value={background}
                  onChange={(e) => {
                    setThemeName("custom");
                    setBackground(e.target.value);
                  }}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-white/10"
                  checked={showMilestones}
                  onChange={(e) => setShowMilestones(e.target.checked)}
                />
                Show milestone markers
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-white/10"
                  checked={showMilestoneList}
                  onChange={(e) => setShowMilestoneList(e.target.checked)}
                />
                Show milestone breakdown
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-white/10"
                  checked={showPct}
                  onChange={(e) => setShowPct(e.target.checked)}
                />
                Show progress percent value
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-white/10"
                  checked={showTotals}
                  onChange={(e) => setShowTotals(e.target.checked)}
                />
                Show progress value
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-white/10"
                  checked={fullPage}
                  onChange={(e) => setFullPage(e.target.checked)}
                />
                Full-page transparent mode
              </label>
              <p className="text-xs text-zinc-400">Makes the embed span the page with no container chrome.</p>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">Quick adjust progress</span>
              <div className="flex items-center gap-3 text-xs">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="adjustMode"
                    value="add"
                    checked={adjustMode === "add"}
                    onChange={() => setAdjustMode("add")}
                  />
                  Add
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="adjustMode"
                    value="set"
                    checked={adjustMode === "set"}
                    onChange={() => setAdjustMode("set")}
                  />
                  Replace
                </label>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {activeMilestones.map((ms) => (
                <button
                  key={ms.id}
                  className="rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-sm text-white transition hover:bg-white/15"
                  onClick={() => {
                    if (!activeBar) return;
                    updateBarProgress(activeBar.id, (prev) =>
                      adjustMode === "add" ? clampNumber(prev + ms.value) : clampNumber(ms.value),
                    );
                  }}
                >
                  {ms.label} ({ms.value})
                </button>
              ))}
            </div>

            {/* pre-built example step button placeholder removed (adjustAmount unused) */}

            <div className="items-center gap-3 text-sm">
                <span className="text-zinc-300">Default step value:</span>

              <label className="flex items-center gap-2 py-1 max-w-">
                {/* <span className="text-zinc-300">Default +/- step</span> */}
                <input
                  type="number"
                  min={1}
                  className={`${compactFieldClass} no-spin`}
                  value={defaultStep}
                  onChange={(e) => setDefaultStep(Math.max(1, clampNumber(Number(e.target.value))))}
                />
              <span className="text-xs text-zinc-400">Shown as hover +/- on each bar</span>

              </label>
              {/* <span className="text-xs text-zinc-400">Shown as hover +/- on each bar</span> */}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <h3 className="font-semibold">Milestones:</h3>
                <div className="min-w-[140px] max-w-[160px]">
                  <FancySelect
                    value={activeBar?.id ?? ""}
                    onChange={(val) => setSelectedBarId(val)}
                    options={bars.map((bar) => ({ value: bar.id, label: bar.label || "Bar" }))}
                    buttonClassName="flex w-full items-center justify-between rounded-md border border-transparent bg-white/8 px-3 py-1.5 text-sm text-white/90 shadow-[0_1px_0_rgba(255,255,255,0.04)] transition focus:ring-2 focus:ring-white/12 focus:outline-none"
                  />
                </div>
              </div>
              <button
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1 text-sm font-medium text-white transition hover:bg-white/10"
                onClick={() => {
                  if (!activeBar) return;
                  setBars((current) =>
                    current.map((bar) =>
                      bar.id === activeBar.id
                        ? {
                            ...bar,
                            milestones: [
                              ...bar.milestones,
                              { id: nextId(), label: `+${bar.milestones.length + 1}`, value: Math.max(bar.progress, 0) },
                            ],
                          }
                        : bar,
                    ),
                  );
                }}
              >
                <Plus size={14} /> Add
              </button>
            </div>

            <div className="space-y-2">
              {activeMilestones.map((ms, index) => (
                <div key={ms.id} className="grid grid-cols-[1fr,110px,40px] items-center gap-2">
                  <input
                    className={fieldClass}
                    value={ms.label}
                    onChange={(e) =>
                      setBars((current) =>
                        current.map((bar) =>
                          bar.id === activeBar?.id
                            ? {
                                ...bar,
                                milestones: bar.milestones.map((item) =>
                                  item.id === ms.id ? { ...item, label: e.target.value } : item,
                                ),
                              }
                            : bar,
                        ),
                      )
                    }
                  />
                  <input
                    type="number"
                    min={0}
                    className={`${fieldClass} no-spin`}
                    value={ms.value}
                    onChange={(e) =>
                      setBars((current) =>
                        current.map((bar) =>
                          bar.id === activeBar?.id
                            ? {
                                ...bar,
                                milestones: bar.milestones.map((item) =>
                                  item.id === ms.id
                                    ? { ...item, value: clampNumber(Number(e.target.value)) }
                                    : item,
                                ),
                              }
                            : bar,
                        ),
                      )
                    }
                  />
                  <button
                    className="rounded-lg border h-full w-full flex items-center border-white/10 px-3 text-zinc-300 transition hover:bg-white/10"
                    onClick={() =>
                      setBars((current) =>
                        current.map((bar) =>
                          bar.id === activeBar?.id
                            ? { ...bar, milestones: bar.milestones.filter((item) => item.id !== ms.id) }
                            : bar,
                        ),
                      )
                    }
                    aria-label={`Remove milestone ${index + 1}`}
                  ><Trash  size={14}/></button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Additional bars</h3>
              <button
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1 text-sm font-medium text-white transition hover:bg-white/10"
                onClick={() =>
                  setBars((current) => {
                    const next = {
                      id: nextId(),
                      label: `Bar ${current.length + 1}`,
                      progress: 0,
                      goal: goal || 1,
                      milestones: defaultMilestones(),
                    };
                    setSelectedBarId(next.id);
                    return [...current, next];
                  })
                }
              >
                <Plus size={14} /> Add bar
              </button>
            </div>

            <div className="space-y-2">
              {bars.map((bar, index) => (
                <div key={bar.id} className="grid grid-cols-[1fr,1fr,1fr,40px] items-center gap-2">
                  <input
                    className={fieldClass}
                    value={bar.label}
                    onChange={(e) =>
                      setBars((current) => current.map((b) => (b.id === bar.id ? { ...b, label: e.target.value } : b)))
                    }
                  />
                  <input
                    type="number"
                    min={0}
                    className={`${fieldClass} no-spin`}
                    value={bar.progress}
                    onChange={(e) =>
                      setBars((current) => {
                        const next = clampNumber(Number(e.target.value));
                        if (index === 0) setProgress(next);
                        return current.map((b) => (b.id === bar.id ? { ...b, progress: next } : b));
                      })
                    }
                  />
                  <input
                    type="number"
                    min={1}
                    className={`${fieldClass} no-spin`}
                    value={bar.goal}
                    onChange={(e) =>
                      setBars((current) => {
                        const next = clampNumber(Number(e.target.value), 1);
                        if (index === 0) setGoal(next);
                        return current.map((b) => (b.id === bar.id ? { ...b, goal: next } : b));
                      })
                    }
                  />
                  <button
                    className="rounded-lg border h-full w-full flex items-center border-white/10 px-3 text-zinc-300 transition hover:bg-white/10"
                    onClick={() =>
                      setBars((current) => {
                        const filtered = current.filter((b) => b.id !== bar.id);
                        if (!filtered.length) {
                          const fallback = {
                            id: nextId(),
                            label: "Progress",
                            progress,
                            goal: goal || 1,
                            milestones: defaultMilestones(),
                          };
                          setProgress(fallback.progress);
                          setGoal(fallback.goal);
                          setSelectedBarId(fallback.id);
                          return [fallback];
                        }
                        if (index === 0) {
                          const first = filtered[0];
                          setProgress(first.progress);
                          setGoal(first.goal);
                          setSelectedBarId(first.id);
                        }
                        return filtered;
                      })
                    }
                    aria-label={`Remove bar ${index + 1}`}
                  >
                    <Trash size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-white"
            onClick={handleCopyLink}
          >
            <Copy size={16} /> {copied ? "Copied" : "Copy embed URL"}
          </button>
          <p className="text-xs text-zinc-400">
            Tip: add embed=1 to hide the builder when pasting into Notion.
          </p>
        </section>

        {/* right widget container */}
        <section
          className={`flex max-h-[88vh] items-center justify-center rounded-2xl overflow-y-auto scrollbar-hide ${
            fullPage ? "p-0 border border-transparent shadow-none" : "border border-white/10 bg-white/5 p-6 shadow-xl"
          }`}
          style={fullPage ? { background: background, width: "100%" } : undefined}
        >
          {fullPage ? (
            <div className="flex w-full items-center justify-center" style={{ background }}>
              <div className="w-full">
                <ProgressPreview {...previewProps} isEmbedView />
              </div>
            </div>
          ) : (
            <WidgetContainer theme="light" className="bg-transparent" heightClassName="h-auto" fullHeight={false} allowOverflow>
              <ProgressPreview {...previewProps} />
            </WidgetContainer>
          )}
        </section>
      </div>
    </main>
    <style jsx global>{`
      .no-spin::-webkit-inner-spin-button,
      .no-spin::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      .no-spin {
        -moz-appearance: textfield;
      }
    `}</style>
    </>
  );
}
