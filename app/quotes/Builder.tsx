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
  const [authors, setAuthors] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [sourceTypes, setSourceTypes] = useState<string[]>([]);
  const [mode, setMode] = useState<"daily" | "random" | "interval" | "flashcard">("daily");
  const [startIndex, setStartIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [showPinned, setShowPinned] = useState(false);
  const [showPersonal, setShowPersonal] = useState(false);
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

  const availableAuthors = useMemo<FancyOption[]>(() => {
    const vals = Array.from(new Set(sourceQuotes.map((q) => (q.author || "").trim()).filter(Boolean))).sort();
    return vals.map((v) => ({ value: v, label: v }));
  }, [sourceQuotes]);

  const availableTags = useMemo<FancyOption[]>(() => {
    const vals = Array.from(new Set(sourceQuotes.flatMap((q) => q.tags || []).filter(Boolean))).sort();
    return vals.map((v) => ({ value: v, label: v }));
  }, [sourceQuotes]);

  const availableLanguages = useMemo<FancyOption[]>(() => {
    const vals = Array.from(new Set(sourceQuotes.map((q) => (q.language || "").trim()).filter(Boolean))).sort();
    return [{ value: "", label: "Any language" }, ...vals.map((v) => ({ value: v, label: v }))];
  }, [sourceQuotes]);

  const availableSourceTypes = useMemo<FancyOption[]>(() => {
    const vals = Array.from(new Set(sourceQuotes.map((q) => (q.sourceType || "").trim()).filter(Boolean))).sort();
    return [{ value: "", label: "Any source" }, ...vals.map((v) => ({ value: v, label: v }))];
  }, [sourceQuotes]);

  useEffect(() => {
    const next = defaultsForTheme(theme);
    setBg(next.bg);
    setBorder(next.border);
    setText(next.text);
    setAccent(next.accent);
  }, [theme]);

  const reset = () => {
    setAuthors([]);
    setTags([]);
    setLanguages([]);
    setSourceTypes([]);
    setMode("daily");
    setStartIndex(0);
    setQuery("");
    setShowPinned(false);
    setShowPersonal(false);
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
    if (authors.length) p.set("authors", authors.join(","));
    if (tags.length) p.set("tags", tags.join(","));
    if (languages.length) p.set("languages", languages.join(","));
    if (sourceTypes.length) p.set("sourcetypes", sourceTypes.join(","));
    if (source !== "auto") p.set("source", source);
    p.set("mode", mode);
    if (startIndex > 0) p.set("index", String(startIndex));
    if (query.trim()) p.set("q", query.trim());
    if (showPinned) p.set("pinned", "1");
    if (showPersonal) p.set("personal", "1");
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
  }, [source, theme, rotate, interval, bg, border, text, accent, pageBg, pageMatch, pageTransparent]);

  const livePreviewParams = useMemo(
    () => ({
      authors: authors.join(","),
      tags: tags.join(","),
      languages: languages.join(","),
      sourceTypes: sourceTypes.join(","),
      source,
      theme,
      rotate,
      interval,
      mode,
      startIndex,
      q: query,
      showPinned,
      showPersonal,
      bg,
      border,
      text,
      accent,
      pageBg: pageMatch ? undefined : pageBg,
      pageMatch,
      pageTransparent,
    }),
    [authors, tags, languages, sourceTypes, source, theme, rotate, interval, mode, startIndex, query, showPinned, showPersonal, bg, border, text, accent, pageBg, pageMatch, pageTransparent]
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
              <span className="text-zinc-300">Authors</span>
              <div className="flex flex-wrap gap-2">
                {availableAuthors.map((opt) => (
                  <button
                    key={opt.value}
                    className={`rounded-full border px-3 py-1 text-xs ${authors.includes(opt.value.toLowerCase()) ? "border-white/70 bg-white/15" : "border-white/10 bg-white/5"}`}
                    onClick={() =>
                      setAuthors((prev) => {
                        const val = opt.value.toLowerCase();
                        return prev.includes(val) ? prev.filter((a) => a !== val) : [...prev, val];
                      })
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </label>

            {/* <label className="space-y-1 text-sm">
              <span className="text-zinc-300">Tags</span>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((opt) => (
                  <button
                    key={opt.value}
                    className={`rounded-full border px-3 py-1 text-xs ${tags.includes(opt.value.toLowerCase()) ? "border-white/70 bg-white/15" : "border-white/10 bg-white/5"}`}
                    onClick={() =>
                      setTags((prev) => {
                        const val = opt.value.toLowerCase();
                        return prev.includes(val) ? prev.filter((t) => t !== val) : [...prev, val];
                      })
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </label> */}

            <label className="space-y-1 text-sm">
              <span className="text-zinc-300">Languages</span>
              <div className="flex flex-wrap gap-2">
                {availableLanguages.slice(1).map((opt) => (
                  <button
                    key={opt.value}
                    className={`rounded-full border px-3 py-1 text-xs ${languages.includes(opt.value.toLowerCase()) ? "border-white/70 bg-white/15" : "border-white/10 bg-white/5"}`}
                    onClick={() =>
                      setLanguages((prev) => {
                        const val = opt.value.toLowerCase();
                        return prev.includes(val) ? prev.filter((l) => l !== val) : [...prev, val];
                      })
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </label>

            <label className="space-y-1 text-sm">
              <span className="text-zinc-300">Source types</span>
              <div className="flex flex-wrap gap-2">
                {availableSourceTypes.slice(1).map((opt) => (
                  <button
                    key={opt.value}
                    className={`rounded-full border px-3 py-1 text-xs ${sourceTypes.includes(opt.value.toLowerCase()) ? "border-white/70 bg-white/15" : "border-white/10 bg-white/5"}`}
                    onClick={() =>
                      setSourceTypes((prev) => {
                        const val = opt.value.toLowerCase();
                        return prev.includes(val) ? prev.filter((l) => l !== val) : [...prev, val];
                      })
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Mode</span>
                <FancySelect
                  value={mode}
                  onChange={(val) => setMode(val as typeof mode)}
                  options={[
                    { value: "daily", label: "Daily" },
                    { value: "random", label: "Random" },
                    { value: "interval", label: "Interval" },
                    { value: "flashcard", label: "Flashcard" },
                  ]}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-zinc-300">Start index</span>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                  value={startIndex}
                  onChange={(e) => setStartIndex(Math.max(0, Number(e.target.value) || 0))}
                />
              </label>
            </div>

            <label className="space-y-1 text-sm">
              <span className="text-zinc-300">Search text</span>
              <input
                type="text"
                className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search quote/author"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-white/10" checked={showPinned} onChange={(e) => setShowPinned(e.target.checked)} />
                Pinned only
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-white/10" checked={showPersonal} onChange={(e) => setShowPersonal(e.target.checked)} />
                Personal only
              </label>
            </div>

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
