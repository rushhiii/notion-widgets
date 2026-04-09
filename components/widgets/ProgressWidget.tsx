"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Copy, Plus, RefreshCw, Trash } from "lucide-react";

import { WidgetContainer } from "@/components/ui/WidgetContainer";
import { parseBooleanParam, parseColorParam } from "@/lib/utils";

type Milestone = { id: string; label: string; value: number };
type BarRow = { id: string; label: string; progress: number; goal: number; milestones: Milestone[] };
type LayoutMode = "linear" | "circular" | "counter";
type TransparentBgMode = "off" | "dark" | "light";

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
  widthPct: number;
  fontSizePct: number;
  showTitle: boolean;
  showLabelText: boolean;
  showBorder: boolean;
  showProgressLabel: boolean;
  transparentBgMode: TransparentBgMode;
  isEmbedView?: boolean;
  defaultStep: number;
  onAdjustBar?: (barId: string, delta: number) => void;
  onAdjustMilestone?: (barId: string, milestoneId: string, delta: number) => void;
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
  widthPct: 100,
  fontSizePct: 100,
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

function parseTransparentBgMode(value: string | null): TransparentBgMode {
  if (!value) return "off";
  const normalized = value.toLowerCase();
  if (normalized === "dark" || normalized === "light") return normalized;
  // Legacy support: transparentbg=1 or true maps to dark mode.
  return parseBooleanParam(value, false) ? "dark" : "off";
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
  widthPct,
  fontSizePct,
  showTitle,
  showLabelText,
  showBorder,
  showProgressLabel,
  transparentBgMode,
  isEmbedView = false,
  defaultStep,
  onAdjustBar,
  onAdjustMilestone,
  bars,
}: PreviewProps) {
  // Animation: fade/slide-in for preview container and each bar row
  const [showPreview, setShowPreview] = useState(false);
  useEffect(() => {
    setShowPreview(true);
  }, []);

  const baseBar = { id: "base", label, progress, goal, milestones: defaultMilestones() };
  const rows = bars.length ? bars : [baseBar];
  const contentScale = fontSizePct / 100;
  const labelText = (label || "").trim();
  const transparent = fullPage && isEmbedView;
  const transparentBgColor = transparentBgMode === "dark" ? "#191919" : "#ffffff";
  const effectiveBg = transparentBgMode === "off" ? (transparent ? "transparent" : background) : transparentBgColor;
  const isMidnight = themeName === "midnight";
  const containerClass = transparent
    ? "flex w-full flex-col justify-center gap-3 p-2 sm:p-6"
    : isMidnight
      ? "flex w-full max-w-4xl flex-col justify-center gap-3 rounded-2xl px-7 py-6"
      : "flex w-full max-w-4xl flex-col justify-center gap-3 rounded-2xl px-7 py-6";
  const containerStyle = {
    color: text,
    fontFamily,
    borderColor: showBorder ? text : "transparent",
    backgroundColor: effectiveBg,
    backgroundImage: transparentBgMode !== "off" || transparent || isMidnight
      ? undefined
      : "",
      // : "radial-gradient(circle at 25% 25%, rgba(59,130,246,0.08), transparent 45%)",
    transition: "background-color 180ms ease, color 180ms ease, border-color 180ms ease, opacity 0.7s cubic-bezier(.4,0,.2,1), transform 0.7s cubic-bezier(.4,0,.2,1)",
    opacity: showPreview ? 1 : 0,
    transform: showPreview ? 'translateY(0)' : 'translateY(24px)',
    width: `${widthPct}%`,
    minHeight: fullPage ? "100vh" : undefined,
    marginInline: "auto",
  } as const;

  return (
    <div className={containerClass} style={containerStyle}>
      <div
        style={{
          transform: `scale(${contentScale})`,
          transformOrigin: "top center",
          width: contentScale < 1 ? "100%" : `${100 / contentScale}%`,
          minHeight: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
      {(showTitle || showLabelText) && (title || labelText) && (
        <div className="space-y-1">
          {showTitle && title && (
            <h2 className="text-3xl text-left font-semibold tracking-tight" style={{ color: accent }}>
              {title}
            </h2>
          )}
          {showLabelText && labelText && (
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
              <div
                key={row.id}
                className="space-y-3 rounded-2xl border p-4 shadow-sm"
                style={{ backgroundColor: transparentBgMode === "off" ? background : transparentBgColor, borderColor: showBorder ? text : "transparent", ...rowAnim }}
              >
                {showProgressLabel && row.label.trim() !== "" && (
                  <div className="flex items-center justify-between text-sm font-semibold" style={{ color: text }}>
                    <span>{row.label.trim()}</span>
                    <span>
                      {prefix}
                      {formatNumber(row.goal)}
                      {suffix}
                    </span>
                  </div>
                )}

                <div className="group relative flex flex-col items-center gap-3">
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
                      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        {sortedMilestones.map((ms, index) => {
                          const angle = (ms.pct / 100) * 2 * Math.PI - Math.PI / 2;
                          const x = center + Math.cos(angle) * radius;
                          const y = center + Math.sin(angle) * radius;
                          const labelRadius = radius + 22;
                          const lx = center + Math.cos(angle) * labelRadius;
                          const ly = center + Math.sin(angle) * labelRadius;
                          return (
                            <div key={`${row.id}-mk-${ms.id}`} className="contents">
                              <div
                                className="absolute rounded-full border border-white/70 shadow-sm"
                                style={{ left: x, top: y, width: 10, height: 10, background: accent, transform: "translate(-50%, -50%)" }}
                                title={ms.label}
                              />
                              {!showMilestoneList && (
                                <div
                                  className="absolute"
                                  style={{ left: lx, top: ly, transform: "translate(-50%, -50%)" }}
                                >
                                  <div
                                    className="rounded-md border border-white/20 bg-black/70 px-2 py-1 text-[11px] font-medium text-white shadow-md backdrop-blur-sm opacity-0 scale-95 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0"
                                    style={{ transitionDelay: `${index * 45}ms` }}
                                  >
                                    {ms.label}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center" style={{ color: text }}>
                      {showPct && <div className="text-2xl font-semibold">{pct.toFixed(1)}%</div>}
                      {showTotals && (
                        <div className="group/value pointer-events-auto mt-1 flex items-center justify-center gap-2 text-sm text-zinc-600" style={{ color: text }}>
                          {onAdjustBar && (
                            <button
                              className="rounded px-1 text-base font-semibold leading-none opacity-0 transition-opacity duration-150 group-hover/value:opacity-100"
                              onClick={() => onAdjustBar(row.id, -defaultStep)}
                              aria-label="Decrement progress"
                            >
                              -
                            </button>
                          )}
                          <span>{formatNumber(row.progress)}</span>
                          {onAdjustBar && (
                            <button
                              className="rounded px-1 text-base font-semibold leading-none opacity-0 transition-opacity duration-150 group-hover/value:opacity-100"
                              onClick={() => onAdjustBar(row.id, defaultStep)}
                              aria-label="Increment progress"
                            >
                              +
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {showMilestoneList && (
                    <div className="w-full space-y-2">
                      {sortedMilestones.map((ms) => {
                        const progressToTargetPct = ms.value > 0 ? clampNumber((row.progress / ms.value) * 100, 0, 100) : 0;
                        return (
                          <div key={`${row.id}-list-${ms.id}`} className="group/ms space-y-1">
                            <div className="flex items-center justify-between text-xs font-medium" style={{ color: text }}>
                              <span>{ms.label}</span>
                              <div className="flex items-center gap-2">
                                <button
                                  className="rounded px-1 text-[16px] opacity-0 transition-opacity duration-200 group-hover/ms:opacity-100"
                                  onClick={() => onAdjustMilestone?.(row.id, ms.id, -defaultStep)}
                                  aria-label="Decrease milestone value"
                                >
                                  -
                                </button>
                                <span>{formatNumber(row.progress)} / {formatNumber(ms.value)} ({progressToTargetPct.toFixed(1)}%)</span>
                                <button
                                  className="rounded px-1 text-[16px] opacity-0 transition-opacity duration-200 group-hover/ms:opacity-100"
                                  onClick={() => onAdjustMilestone?.(row.id, ms.id, defaultStep)}
                                  aria-label="Increase milestone value"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div className="relative h-2 w-full rounded-full" style={{ background: track }}>
                              <div
                                className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
                                style={{ width: `${progressToTargetPct}%`, background: accent }}
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

          if (layoutMode === "counter") {
            const progressDeltaToZero = row.progress;
            const progressPct = safeGoal > 0 ? clampNumber((row.progress / safeGoal) * 100, 0, 100) : 0;

            return (
              <div
                key={row.id}
                className="space-y-3 rounded-2xl border p-5 "
                style={{ backgroundColor: transparentBgMode === "off" ? background : transparentBgColor, borderColor: showBorder ? text : "transparent", ...rowAnim }}
              >
                {showProgressLabel && row.label.trim() !== "" && (
                  <div className="text-center text-lg font-semibold" style={{ color: text }}>
                    {row.label.trim()}
                  </div>
                )}

                <div className="group/value flex items-center justify-center gap-4">
                  {onAdjustBar && (
                    <button
                      className="h-12 w-12 rounded-xl bg-black/10 text-2xl font-medium opacity-80 transition hover:opacity-100"
                      onClick={() => onAdjustBar(row.id, -defaultStep)}
                      aria-label="Decrement counter"
                    >
                      -
                    </button>
                  )}

                  <div className="text-center">
                    <div className="text-5xl font-semibold leading-none" style={{ color: text }}>
                      {formatNumber(row.progress)}
                    </div>
                    {showPct && <div className="mt-2 text-sm opacity-80" style={{ color: text }}>{progressPct.toFixed(1)}%</div>}
                  </div>

                  {onAdjustBar && (
                    <button
                      className="h-12 w-12 rounded-xl bg-black/10 text-2xl font-medium opacity-80 transition hover:opacity-100"
                      onClick={() => onAdjustBar(row.id, defaultStep)}
                      aria-label="Increment counter"
                    >
                      +
                    </button>
                  )}
                </div>

                {onAdjustBar && (
                  <button
                    className="mx-auto block text-sm opacity-80 transition hover:opacity-100"
                    style={{ color: text }}
                    onClick={() => onAdjustBar(row.id, -progressDeltaToZero)}
                    aria-label="Reset counter"
                  >
                    reset
                  </button>
                )}

                {showTotals && (
                  <div className="text-center text-sm" style={{ color: text }}>
                    target: {formatNumber(row.goal)}
                  </div>
                )}
              </div>
            );
          }

          return (
            <div key={row.id} className="space-y-2 group">
              {showProgressLabel && row.label.trim() !== "" && (
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
                  <div className="pointer-events-none absolute left-0 right-0 top-0 opacity-0 transition-all duration-200 group-hover:opacity-100">
                    {sortedMilestones.map((ms) => (
                      <div
                        key={`${row.id}-${ms.id}`}
                        className="absolute flex -translate-x-1/2 flex-col items-center"
                        style={{ left: `${ms.pct-.7}%`, top: -34 }}
                      >
                        <div
                          className="progress-marker-label relative rounded-md px-2 py-1 text-sm font-medium shadow-sm transition-all duration-200 whitespace-nowrap"
                          style={{
                            backgroundColor: track,
                            color: text,
                            ['--marker-label-bg' as string]: track,
                          }}
                          title={`${ms.label} (${formatNumber(ms.value)})`}
                        >
                          {ms.label}
                        </div>
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
                    const progressToTargetPct = ms.value > 0 ? clampNumber((row.progress / ms.value) * 100, 0, 100) : 0;
                    return (
                      <div key={`${row.id}-list-${ms.id}`} className="group/ms space-y-1">
                        <div className="flex items-center justify-between text-xs font-medium text-zinc-600" style={{ color: text }}>
                          <span>{ms.label}</span>
                          <div className="flex items-center gap-2">
                            <button
                              className="rounded px-1 text-[11px] opacity-0 transition-opacity duration-200 group-hover/ms:opacity-100"
                              onClick={() => onAdjustMilestone?.(row.id, ms.id, -defaultStep)}
                              aria-label="Decrease milestone value"
                            >
                              -
                            </button>
                            <span>{formatNumber(row.progress)} / {formatNumber(ms.value)} ({progressToTargetPct.toFixed(1)}%)</span>
                            <button
                              className="rounded px-1 text-[11px] opacity-0 transition-opacity duration-200 group-hover/ms:opacity-100"
                              onClick={() => onAdjustMilestone?.(row.id, ms.id, defaultStep)}
                              aria-label="Increase milestone value"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="relative h-2 w-full rounded-full" style={{ background: track }}>
                          <div
                            className="absolute inset-y-0 left-0 rounded-full transition-all duration-300"
                            style={{ width: `${progressToTargetPct}%`, background: accent }}
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
    </div>
  );
}

export function ProgressWidget() {
  const searchParams = useSearchParams();

  const fieldClass = "w-full rounded-lg border border-white/12 bg-white/10 px-3 py-2 text-sm text-white/90 placeholder:text-zinc-500 shadow-[0_1px_0_rgba(255,255,255,0.08)] transition focus:border-white/40 focus:ring-2 focus:ring-white/15 focus:outline-none";
  const compactFieldClass = "w-full rounded-md border border-transparent bg-white/10 px-3 py-1.5 text-sm text-white/90 placeholder:text-zinc-500 shadow-[0_1px_0_rgba(255,255,255,0.06)] transition focus:ring-2 focus:ring-white/15 focus:outline-none";

  const sanitizeInstance = (value: string) => value.replace(/[^a-z0-9_-]/gi, "");
  const instanceParam = (searchParams.get("instance") ?? "").trim();
  const [instanceId, setInstanceId] = useState(instanceParam);
  const normalizedInstance = sanitizeInstance(instanceId);
  const storageKey = normalizedInstance ? `${STORAGE_KEY}:${normalizedInstance}` : STORAGE_KEY;

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
    const widthParam = clampNumber(parseNumberParam(searchParams.get("width"), DEFAULTS.widthPct), 40, 140);
    const fontSizeParam = clampNumber(parseNumberParam(searchParams.get("fsize"), DEFAULTS.fontSizePct), 70, 160);

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
      widthPct: widthParam,
      fontSizePct: fontSizeParam,
      showBuilder: !parseBooleanParam(searchParams.get("embed"), false) && !parseBooleanParam(searchParams.get("bare"), false),
      showMilestones: parseBooleanParam(searchParams.get("markers"), false),
      showMilestoneList: parseBooleanParam(searchParams.get("mlist"), false),
      showPct: parseBooleanParam(searchParams.get("pct"), true),
      showTotals: parseBooleanParam(searchParams.get("totals"), true),
      fullPage: parseBooleanParam(searchParams.get("full"), true),
      transparentBgMode: parseTransparentBgMode(searchParams.get("transparentbg")),
      showTitle: parseBooleanParam(searchParams.get("showtitle"), true),
      showLabelText: parseBooleanParam(searchParams.get("showlabel"), true),
      showBorder: parseBooleanParam(searchParams.get("showborder"), true),
      showProgressLabel: parseBooleanParam(searchParams.get("showprogresslabel"), true),
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
  const [widthPct, setWidthPct] = useState(initial.widthPct ?? DEFAULTS.widthPct);
  const [fontSizePct, setFontSizePct] = useState(initial.fontSizePct ?? DEFAULTS.fontSizePct);
  const [copied, setCopied] = useState(false);
  const [showMilestones, setShowMilestones] = useState(initial.showMilestones);
  const [showMilestoneList, setShowMilestoneList] = useState(initial.showMilestoneList);
  const [showPct, setShowPct] = useState(initial.showPct);
  const [showTotals, setShowTotals] = useState(initial.showTotals);
  const [fullPage, setFullPage] = useState(initial.fullPage);
  const [transparentBgMode, setTransparentBgMode] = useState<TransparentBgMode>(initial.transparentBgMode ?? "off");
  const [showTitle, setShowTitle] = useState(initial.showTitle ?? true);
  const [showLabelText, setShowLabelText] = useState(initial.showLabelText ?? true);
  const [showBorder, setShowBorder] = useState(initial.showBorder ?? true);
  const [showProgressLabel, setShowProgressLabel] = useState(initial.showProgressLabel ?? true);
  const [adjustMode, setAdjustMode] = useState<"add" | "set">("add");
  const [defaultStep, setDefaultStep] = useState(initial.defaultStep || 100);
  const [bars, setBars] = useState<BarRow[]>(
    initial.bars.length
      ? initial.bars
      : [{ id: nextId(), label: "Progress", progress: initial.progress, goal: initial.goal, milestones: defaultMilestones() }],
  );
  const [selectedBarId, setSelectedBarId] = useState<string | null>(null);
  const [storageApplied, setStorageApplied] = useState(false);
  const [storageAttempted, setStorageAttempted] = useState(false);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as Array<{ label: string; progress: number; goal?: number }>;
        if (Array.isArray(saved) && saved.length) {
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
          setStorageApplied(true);
        }
      }
    } catch (err) {
      console.error("progress load failed", err);
    } finally {
      // Enable saving even when storage is empty on first load.
      setStorageAttempted(true);
      setStorageReady(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!bars.length) return;
    const exists = bars.some((bar) => bar.id === selectedBarId);
    if (!selectedBarId || !exists) {
      setSelectedBarId(bars[0].id);
    }
  }, [bars, selectedBarId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!storageReady) return;
    const payload = bars.map((b) => ({ label: b.label, progress: b.progress, goal: b.goal }));
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  }, [bars, storageReady, storageKey]);

  useEffect(() => {
    if (!storageAttempted) return;
    if (storageApplied) return;
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
    setWidthPct(initial.widthPct ?? DEFAULTS.widthPct);
    setFontSizePct(initial.fontSizePct ?? DEFAULTS.fontSizePct);
    setShowMilestones(initial.showMilestones);
    setShowMilestoneList(initial.showMilestoneList);
    setShowPct(initial.showPct);
    setShowTotals(initial.showTotals);
    setFullPage(initial.fullPage);
    setTransparentBgMode(initial.transparentBgMode ?? "off");
    setShowTitle(initial.showTitle ?? true);
    setShowLabelText(initial.showLabelText ?? true);
    setShowBorder(initial.showBorder ?? true);
    setShowProgressLabel(initial.showProgressLabel ?? true);
    setAdjustMode("add");
    setDefaultStep(initial.defaultStep || 100);
    const nextBars = initial.bars.length
      ? initial.bars
      : [{ id: nextId(), label: "Progress", progress: initial.progress, goal: initial.goal, milestones: defaultMilestones() }];
    setBars(nextBars);
    setSelectedBarId(nextBars[0]?.id ?? null);
  }, [initial, storageApplied, storageAttempted]);

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

  const updateMilestoneValue = (barId: string, milestoneId: string, delta: number) => {
    setBars((current) =>
      current.map((bar) =>
        bar.id === barId
          ? {
              ...bar,
              milestones: bar.milestones.map((ms) =>
                ms.id === milestoneId ? { ...ms, value: clampNumber(ms.value + delta, 0) } : ms,
              ),
            }
          : bar,
      ),
    );
  };

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.search = "";
    if (normalizedInstance) url.searchParams.set("instance", normalizedInstance);
    url.searchParams.set("title", title);
    url.searchParams.set("label", label);
    url.searchParams.set("goal", String(goal));
    url.searchParams.set("progress", String(progress));
    url.searchParams.set("mode", layoutMode);
    url.searchParams.set("font", fontFamily);
    url.searchParams.set("theme", themeName || "custom");
    if (widthPct !== DEFAULTS.widthPct) url.searchParams.set("width", String(widthPct));
    if (fontSizePct !== DEFAULTS.fontSizePct) url.searchParams.set("fsize", String(fontSizePct));
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
    if (transparentBgMode !== "off") url.searchParams.set("transparentbg", transparentBgMode);
    if (!showTitle) url.searchParams.set("showtitle", "0");
    if (!showLabelText) url.searchParams.set("showlabel", "0");
    if (!showBorder) url.searchParams.set("showborder", "0");
    if (!showProgressLabel) url.searchParams.set("showprogresslabel", "0");
    bars.forEach((bar, idx) => {
      url.searchParams.append("bar", `${bar.label}:${bar.progress}:${bar.goal}`);
      bar.milestones.forEach((ms) => {
        url.searchParams.append(`ms${idx}`, `${ms.label}:${ms.value}`);
      });
    });
    // Always generate the embed view URL so it opens directly to the widget (not the builder).
    url.searchParams.set("embed", "1");
    url.searchParams.set("markers", showMilestones ? "1" : "0");

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
    widthPct,
    fontSizePct,
    showTitle,
    showLabelText,
    showBorder,
    showProgressLabel,
    transparentBgMode,
    isEmbedView: false,
    defaultStep,
    onAdjustBar: (barId: string, delta: number) => {
      updateBarProgress(barId, (prev) => clampNumber(prev + delta));
    },
    onAdjustMilestone: (barId: string, milestoneId: string, delta: number) => {
      updateMilestoneValue(barId, milestoneId, delta);
    },
    bars,
  };

  if (!showBuilder) {
    if (fullPage) {
      const transparentBgColor = transparentBgMode === "dark" ? "#191919" : "#ffffff";
      const fullPageStyle = {
        minHeight: "100vh",
        width: "100%",
        backgroundColor: transparentBgMode === "off" ? background : transparentBgColor,
        backgroundImage: themeName === "midnight"
          ? undefined
          : "",
          // : "radial-gradient(circle at 25% 25%, rgba(59,130,246,0.08), transparent 45%)",
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
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          backgroundColor: transparentBgMode === "off" ? background : transparentBgMode === "dark" ? "#191919" : "#ffffff",
        }}
      >
        <WidgetContainer theme="light" className="bg-transparent" heightClassName="h-screen">
          <ProgressPreview {...previewProps} isEmbedView />
        </WidgetContainer>
      </div>
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
                setWidthPct(DEFAULTS.widthPct);
                setFontSizePct(DEFAULTS.fontSizePct);
                setShowTitle(true);
                setShowLabelText(true);
                setShowBorder(true);
                setShowProgressLabel(true);
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
                setTransparentBgMode("off");
                setAdjustMode("add");
                setInstanceId(instanceParam);
              }}
              aria-label="Reset"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <label className="space-y-1 text-sm">
              <span className="text-zinc-300">Instance</span>
              <input
                className={fieldClass}
                value={instanceId}
                onChange={(e) => setInstanceId(e.target.value)}
                onBlur={(e) => setInstanceId(sanitizeInstance(e.target.value))}
                placeholder="main"
              />
            </label>
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
                  onChange={(val) => {
                    const nextMode = val as LayoutMode;
                    setLayoutMode(nextMode);
                    if (nextMode === "counter") {
                      const preset = THEME_PRESETS.daylight;
                      setThemeName("daylight");
                      setAccent(preset.accent);
                      setTrack(preset.track);
                      setText(preset.text);
                      setBackground(preset.background);
                      // Counter mode defaults (match builder preset shown in screenshot).
                      setShowPct(false);
                      setShowTotals(false);
                      setShowTitle(false);
                      setShowLabelText(false);
                      setShowBorder(false);
                      setShowProgressLabel(false);
                      setFullPage(true);
                      // setTransparentBgMode("dark");
                      if (preset.font && !fontCustom) {
                        setFontFamily(preset.font);
                      }
                    }
                  }}
                  options={[
                    { value: "linear", label: "Horizontal bars" },
                    { value: "circular", label: "Circular dials" },
                    { value: "counter", label: "Counter mode" },
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
              {showMilestones ? (
                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/20 bg-white/10"
                    checked={showMilestoneList}
                    onChange={(e) => setShowMilestoneList(e.target.checked)}
                  />
                  Show milestone breakdown
                </label>
              ) : (
                <div />
              )}
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
                {layoutMode === "counter" ? "Show target value" : "Show progress value"}
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-white/10"
                  checked={showTitle}
                  onChange={(e) => setShowTitle(e.target.checked)}
                />
                Show title
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-white/10"
                  checked={showLabelText}
                  onChange={(e) => setShowLabelText(e.target.checked)}
                />
                Show label
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-white/10"
                  checked={showBorder}
                  onChange={(e) => setShowBorder(e.target.checked)}
                />
                Show border
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-white/10"
                  checked={showProgressLabel}
                  onChange={(e) => setShowProgressLabel(e.target.checked)}
                />
                Show progress label
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
                Full-page mode
              </label>
              <div className="space-y-2">
                <label className="inline-flex items-center gap-2 text-sm text-zinc-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/20 bg-white/10"
                    checked={transparentBgMode !== "off"}
                    onChange={(e) => setTransparentBgMode(e.target.checked ? "dark" : "off")}
                  />
                  Transparent BG
                </label>
                <label
                  className={`relative inline-flex items-center gap-2 text-sm select-none ${
                    transparentBgMode === "off" ? "text-zinc-500 cursor-not-allowed" : "text-zinc-300 cursor-pointer"
                  }`}
                >
                  <span>Dark</span>
                  <input
                    type="checkbox"
                    className="peer absolute h-0 w-0 opacity-0"
                    checked={transparentBgMode === "light"}
                    disabled={transparentBgMode === "off"}
                    onChange={(e) => setTransparentBgMode(e.target.checked ? "light" : "dark")}
                  />
                  <span
                    className={`relative h-5 w-11 rounded-full transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-6 ${
                      transparentBgMode === "off"
                        ? "bg-zinc-700/40"
                        : "bg-zinc-500/90 peer-checked:bg-zinc-300"
                    }`}
                  />
                  <span>Light</span>
                </label>
              </div>
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-300">Widget width</span>
                <span className="text-zinc-400">{widthPct}%</span>
              </div>
              <input
                type="range"
                min={40}
                max={140}
                step={1}
                value={widthPct}
                onChange={(e) => setWidthPct(clampNumber(Number(e.target.value), 40, 140))}
                className="w-full accent-white"
              />
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-zinc-300">Font size</span>
                <span className="text-zinc-400">{fontSizePct}%</span>
              </div>
              <input
                type="range"
                min={70}
                max={160}
                step={1}
                value={fontSizePct}
                onChange={(e) => setFontSizePct(clampNumber(Number(e.target.value), 70, 160))}
                className="w-full accent-white"
              />
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
            fullPage ? "p-0 border border-transparent shadow-none" : "border border-white/10 bg-transparent p-6 shadow-xl"
          }`}
          style={{ background: transparentBgMode === "off" ? background : transparentBgMode === "dark" ? "#191919" : "#ffffff", width: "100%" }}
        >
          {fullPage ? (
            <div className="flex w-full items-center justify-center" style={{ background: transparentBgMode === "off" ? background : transparentBgMode === "dark" ? "#191919" : "#ffffff" }}>
              <div className="w-full">
                <ProgressPreview {...previewProps} />
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
