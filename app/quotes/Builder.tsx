"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, RefreshCw, Info } from "lucide-react";
import { QuoteWidget } from "@/components/widgets/QuoteWidget";
import { getQuotes, Quote } from "@/lib/quotes";

type ThemeKey = "dark" | "light";

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

function defaultsForTheme(theme: ThemeKey) {
  if (theme === "light") {
    return {
      bg: "#f4f4f5",
      border: "#d4d4d8",
      text: "#0f172a",
      accent: "#475569",
    };
  }
  return {
    bg: "#000000",
    border: "#7c3aed",
    text: "#e5e7eb",
    accent: "#a1a1aa",
  };
}

export function QuotesBuilder() {
  const [category, setCategory] = useState("");
  const [source, setSource] = useState<"auto" | "local" | "notion">("auto");
  const [theme, setTheme] = useState<ThemeKey>("dark");
  const [rotate, setRotate] = useState(false);
  const [interval, setInterval] = useState(10);
  const [bg, setBg] = useState(defaultsForTheme("dark").bg);
  const [border, setBorder] = useState(defaultsForTheme("dark").border);
  const [text, setText] = useState(defaultsForTheme("dark").text);
  const [accent, setAccent] = useState(defaultsForTheme("dark").accent);
  const [pageBg, setPageBg] = useState("#0a0a0b");
  const [pageMatch, setPageMatch] = useState(true);
  const [pageTransparent, setPageTransparent] = useState(false);
  const [copied, setCopied] = useState(false);
  const sourceQuotes = useMemo<Quote[]>(() => getQuotes(source), [source]);
  const availableCategories = useMemo<FancyOption[]>(() => {
    const cats = Array.from(
      new Set(
        sourceQuotes
          .map((q) => (q.category || "").trim().toLowerCase())
          .filter(Boolean),
      ),
    ).sort();
    return [{ value: "", label: "All categories" }, ...cats.map((c) => ({ value: c, label: c }))];
  }, [sourceQuotes]);

  useEffect(() => {
    const next = defaultsForTheme(theme);
    setBg(next.bg);
    setBorder(next.border);
    setText(next.text);
    setAccent(next.accent);
  }, [theme]);

  const reset = () => {
    setCategory("");
    setSource("auto");
    setTheme("dark");
    setRotate(false);
    setInterval(10);
    const next = defaultsForTheme("dark");
    setBg(next.bg);
    setBorder(next.border);
    setText(next.text);
    setAccent(next.accent);
    setPageBg("#0a0a0b");
    setPageMatch(true);
    setPageTransparent(false);
  };

  const params = useMemo(() => {
    const p = new URLSearchParams();
    p.set("embed", "1");
    p.set("theme", theme);
    if (category.trim()) p.set("category", category.trim());
    if (source !== "auto") p.set("source", source);
    if (rotate) p.set("rotate", "1");
    if (interval !== 10) p.set("interval", String(interval));
    if (bg) p.set("bg", bg.replace("#", ""));
    if (border) p.set("border", border.replace("#", ""));
    if (text) p.set("text", text.replace("#", ""));
    if (accent) p.set("accent", accent.replace("#", ""));
    if (!pageTransparent && !pageMatch && pageBg) p.set("pagebg", pageBg.replace("#", ""));
    if (pageMatch) p.set("pagematch", "1");
    if (pageTransparent) p.set("pagetransparent", "1");
    return p;
  }, [category, source, theme, rotate, interval, bg, border, text, accent, pageBg, pageMatch, pageTransparent]);

  const livePreviewParams = useMemo(
    () => ({ category, source, theme, rotate, interval, bg, border, text, accent, pageBg: pageMatch ? undefined : pageBg, pageMatch, pageTransparent }),
    [category, source, theme, rotate, interval, bg, border, text, accent, pageBg, pageMatch, pageTransparent]
  );

  const copyLink = () => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.origin + "/quotes");
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
              <h2 className="text-lg font-semibold">Quote Widget Builder</h2>
              <p className="text-sm text-zinc-400">Pick a source, theme, and colors.</p>
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
              <span className="text-zinc-300">Category filter</span>
              <FancySelect
                value={category}
                onChange={(val) => setCategory(val)}
                options={availableCategories}
                placeholder="Select category"
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="text-zinc-300">Source</span>
              <FancySelect
                value={source}
                onChange={(val) => setSource(val as typeof source)}
                options={[
                  { value: "auto", label: "Auto" },
                  { value: "local", label: "Local file" },
                  { value: "notion", label: "Notion" },
                ]}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Theme</span>
                <FancySelect
                  value={theme}
                  onChange={(val) => setTheme(val as ThemeKey)}
                  options={[
                    { value: "dark", label: "Dark" },
                    { value: "light", label: "Light" },
                  ]}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Rotate quotes</span>
                <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/20 bg-white/10"
                    checked={rotate}
                    onChange={(e) => setRotate(e.target.checked)}
                  />
                  <span>{rotate ? "On" : "Off"}</span>
                </div>
              </label>
            </div>

            <label className="space-y-1 text-sm">
              <span className="text-zinc-300">Rotation interval (seconds)</span>
              <input
                type="number"
                min={3}
                className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                value={interval}
                onChange={(e) => setInterval(Math.max(3, Number(e.target.value) || 3))}
                disabled={!rotate}
              />
            </label>

            <div className="grid grid-cols-1 gap-3">
              <div className="grid grid-cols-2 gap-3 items-center">
                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/20 bg-white/10"
                    checked={pageMatch}
                    onChange={(e) => {
                      setPageMatch(e.target.checked);
                      if (e.target.checked) setPageTransparent(false);
                    }}
                  />
                  Match page background to card
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/20 bg-white/10"
                    checked={pageTransparent}
                    onChange={(e) => {
                      setPageTransparent(e.target.checked);
                      if (e.target.checked) setPageMatch(false);
                    }}
                  />
                  Transparent page background
                </label>
              </div>

              {!pageTransparent && !pageMatch && (
                <label className="space-y-1 text-sm">
                  <span className="text-zinc-300">Page background</span>
                  <input
                    type="color"
                    className="color-swatch"
                    value={pageBg}
                    onChange={(e) => setPageBg(e.target.value)}
                  />
                </label>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Background</span>
                <input
                  type="color"
                  className="color-swatch"
                  value={bg}
                  onChange={(e) => setBg(e.target.value)}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Border</span>
                <input
                  type="color"
                  className="color-swatch"
                  value={border}
                  onChange={(e) => setBorder(e.target.value)}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Quote text</span>
                <input
                  type="color"
                  className="color-swatch"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Author</span>
                <input
                  type="color"
                  className="color-swatch"
                  value={accent}
                  onChange={(e) => setAccent(e.target.value)}
                />
              </label>
            </div>
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

        {/* <section className="flex max-h-[88vh] items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl overflow-hidden"> */}
        <section className="flex max-h-[88vh] flex-col items-stretch justify-center rounded-2xl border border-white/10 bg-white/5 p-0 shadow-xl overflow-hidden">
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              background: pageTransparent ? "transparent" : pageMatch ? bg : pageBg,
            }}
          >
            <div className="w-full p-4">
              <QuoteWidget embedParams={livePreviewParams} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default QuotesBuilder;
