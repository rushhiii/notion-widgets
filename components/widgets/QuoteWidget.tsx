"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { WidgetContainer } from "@/components/ui/WidgetContainer";
import { getQuotes, Quote } from "@/lib/quotes";
import { parseBooleanParam, parsePositiveIntParam, parseColorParam, resolveTheme } from "@/lib/utils";

type QuoteEmbedParams = {
  category?: string;
  categories?: string;
  authors?: string;
  tags?: string;
  language?: string;
  languages?: string;
  sourceType?: string;
  sourceTypes?: string;
  source?: "auto" | "local" | "notion";
  theme?: "dark" | "light";
  rotate?: boolean;
  interval?: number;
  mode?: "daily" | "random" | "interval" | "flashcard";
  startIndex?: number;
  q?: string;
  showPinned?: boolean;
  showPersonal?: boolean;
  bg?: string;
  border?: string;
  text?: string;
  accent?: string;
  pageBg?: string;
  pageMatch?: boolean;
  pageTransparent?: boolean;
  admin?: string;
};

function randomFrom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function pickDailyQuote(quotes: Quote[], category: string, source: string): Quote | null {
  if (!quotes.length) return null;
  const dateKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  const seed = `${dateKey}|${category}|${source}|${quotes.length}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const index = hash % quotes.length;
  return quotes[index];
}

function normalizeList(raw: string | undefined | null) {
  if (!raw) return [] as string[];
  return raw
    .split(/[|,]/)
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => v.toLowerCase());
}

export function QuoteWidget({ embedParams }: { embedParams?: QuoteEmbedParams }) {
  const searchParams = useSearchParams();

  const categoryParam = (embedParams?.category ?? searchParams.get("category") ?? "").trim().toLowerCase();
  const categoriesParam = normalizeList(embedParams?.categories ?? searchParams.get("categories") ?? categoryParam);
  const authorsParam = normalizeList(embedParams?.authors ?? searchParams.get("authors") ?? "");
  const tagsParam = normalizeList(embedParams?.tags ?? searchParams.get("tags") ?? "");
  const languagesParam = normalizeList(embedParams?.languages ?? searchParams.get("languages") ?? "");
  const languageParam = (embedParams?.language ?? searchParams.get("lang") ?? "").trim().toLowerCase();
  const sourceTypesParam = normalizeList(embedParams?.sourceTypes ?? searchParams.get("sourcetypes") ?? "");
  const sourceTypeParam = (embedParams?.sourceType ?? searchParams.get("sourcetype") ?? "").trim().toLowerCase();
  const sourceParam = (embedParams?.source ?? searchParams.get("source") ?? "auto").trim().toLowerCase();
  const rawThemeParam = (embedParams?.theme ?? searchParams.get("theme") ?? "").trim().toLowerCase();
  const requestedTheme = resolveTheme(rawThemeParam);
  const theme: "dark" | "light" = requestedTheme === "light" ? "light" : "dark";
  const autoRotate = embedParams?.rotate ?? parseBooleanParam(searchParams.get("rotate"), false);
  const intervalSeconds = embedParams?.interval ?? parsePositiveIntParam(searchParams.get("interval"), 10);
  const modeParam = (embedParams?.mode ?? searchParams.get("mode") ?? "daily").trim().toLowerCase() as QuoteEmbedParams["mode"];
  const startIndexParam = embedParams?.startIndex ?? parsePositiveIntParam(searchParams.get("index"), 0);
  const queryParam = (embedParams?.q ?? searchParams.get("q") ?? "").trim().toLowerCase();
  const showPinned = embedParams?.showPinned ?? parseBooleanParam(searchParams.get("pinned"), false);
  const showPersonal = embedParams?.showPersonal ?? parseBooleanParam(searchParams.get("personal"), false);
  // Removed showNoteOnly parameter
  const bgParam = embedParams?.bg ?? parseColorParam(searchParams.get("bg"));
  const borderParam = embedParams?.border ?? parseColorParam(searchParams.get("border"));
  const textParam = embedParams?.text ?? parseColorParam(searchParams.get("text"));
  const accentParam = embedParams?.accent ?? parseColorParam(searchParams.get("accent"));
  const pageBgParam = embedParams?.pageBg ?? parseColorParam(searchParams.get("pagebg"));
  const pageMatch = embedParams?.pageMatch ?? parseBooleanParam(searchParams.get("pagematch"), true);
  const pageTransparent = embedParams?.pageTransparent ?? parseBooleanParam(searchParams.get("pagetransparent"), false);
  const adminParam = (embedParams?.admin ?? searchParams.get("admin") ?? "").trim();

  const ADMIN_SECRET = "dumbass";
  const isAdminBypass = adminParam === ADMIN_SECRET;

  const source: "local" | "notion" | "auto" =
    sourceParam === "local" || sourceParam === "notion" ? sourceParam : "auto";

  const baseQuotes = useMemo(() => getQuotes(source), [source]);

  const filteredQuotes = useMemo(() => {
    const candidates = baseQuotes.filter((q) => {
      const hidden = q.show === false;
      if (!isAdminBypass && hidden) return false;
      
      if (showPinned && !q.pinned) return false;
      if (showPersonal && !q.personal) return false;
      if (categoriesParam.length && !categoriesParam.includes(q.category.toLowerCase())) return false;
      if (categoryParam && q.category.toLowerCase() !== categoryParam) return false;
      if (authorsParam.length && !authorsParam.includes(q.author.toLowerCase())) return false;
      if (tagsParam.length && !(q.tags || []).some((t) => tagsParam.includes(t))) return false;
      const langVal = (q.language || "").toLowerCase();
      if (languagesParam.length ? !languagesParam.includes(langVal) : languageParam && langVal !== languageParam) return false;
      const srcTypeVal = (q.sourceType || "").toLowerCase();
      if (sourceTypesParam.length ? !sourceTypesParam.includes(srcTypeVal) : sourceTypeParam && srcTypeVal !== sourceTypeParam) return false;
      if (queryParam && !(`${q.text} ${q.author} ${q.category}`.toLowerCase().includes(queryParam))) return false;
      return true;
    });
    return candidates;
  }, [baseQuotes, categoryParam, categoriesParam, authorsParam, tagsParam, languagesParam, languageParam, sourceTypesParam, sourceTypeParam, queryParam, showPinned, showPersonal]);

  const availableQuotes = filteredQuotes.length > 0 ? filteredQuotes : baseQuotes;

  const initialIndex = useMemo(() => {
    if (!availableQuotes.length) return 0;
    if (Number.isFinite(startIndexParam) && startIndexParam >= 0) return startIndexParam % availableQuotes.length;
    return 0;
  }, [availableQuotes.length, startIndexParam]);

  const initialQuote = useMemo(() => {
    if (modeParam === "random") return availableQuotes.length ? randomFrom(availableQuotes) : null;
    if (modeParam === "flashcard" || modeParam === "interval") return availableQuotes[initialIndex] ?? null;
    return pickDailyQuote(availableQuotes, categoryParam, source);
  }, [availableQuotes, categoryParam, source, modeParam, initialIndex]);

  const [quote, setQuote] = useState<Quote | null>(initialQuote);
  const [cardIndex, setCardIndex] = useState<number>(initialIndex);

  useEffect(() => {
    setQuote(initialQuote);
    setCardIndex(initialIndex);
  }, [initialQuote, initialIndex]);

  useEffect(() => {
    if (!(modeParam === "interval" || autoRotate) || availableQuotes.length <= 1) return;

    const id = window.setInterval(() => {
      setCardIndex((prev) => {
        const next = (prev + 1) % availableQuotes.length;
        setQuote(availableQuotes[next]);
        return next;
      });
    }, intervalSeconds * 1000);

    return () => window.clearInterval(id);
  }, [autoRotate, intervalSeconds, availableQuotes, modeParam]);

  const stepCard = (delta: number) => {
    if (!availableQuotes.length) return;
    setCardIndex((prev) => {
      const next = (prev + delta + availableQuotes.length) % availableQuotes.length;
      setQuote(availableQuotes[next]);
      return next;
    });
  };

  const cardBackground = bgParam ?? (theme === "dark" ? "#000" : "#f4f4f5");
  const cardBorder = borderParam ?? (theme === "dark" ? "#7c3aed" : "#d4d4d8");
  const quoteColor = textParam ?? (theme === "dark" ? "#e5e7eb" : "#0f172a");
  const authorColor = accentParam ?? (theme === "dark" ? "#a1a1aa" : "#475569");
  const pageBackground = pageTransparent
    ? "transparent"
    : pageMatch
      ? cardBackground
      : pageBgParam ?? (theme === "dark" ? "#050607" : "#f2f2f2");

  return (
    <div style={{ backgroundColor: pageBackground }} className="w-full h-full">
      <WidgetContainer
        theme={theme}
        className="bg-transparent"
        contentClassName="w-full max-w-[90vw] rounded-none border-transparent bg-transparent p-0"
        heightClassName="min-h-[260px] max-h-[90vw]"
      >
        <article
          className="flex h-full w-full flex-col items-center justify-center rounded-[1.1rem] border px-6 py-8 md:px-10 md:py-10"
          style={{
            backgroundColor: cardBackground,
            borderColor: cardBorder,
          }}
        >
          <blockquote
            className="w-full max-w-[900px] whitespace-pre-wrap break-words text-center font-serif text-[clamp(1.25rem,2vw,2.1rem)] italic leading-[1.45]"
            style={{ color: quoteColor }}
          >
            “{quote?.text ?? "Loading quote..."}”
          </blockquote>
          <footer
            className="mt-3 text-[clamp(1rem,1.2vw,1.2rem)] leading-none"
            style={{ color: authorColor }}
          >
            {quote?.author ?? ""}
          </footer>

          {modeParam === "flashcard" && (
            <div className="relative mt-6 flex w-full items-center justify-center">
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/20 px-3 py-2 text-white/80 transition hover:bg-white/10"
                onClick={() => stepCard(-1)}
                aria-label="Previous quote"
              >
                ←
              </button>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/70">
                {availableQuotes.length ? cardIndex + 1 : 0}/{availableQuotes.length}
              </span>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/20 px-3 py-2 text-white/80 transition hover:bg-white/10"
                onClick={() => stepCard(1)}
                aria-label="Next quote"
              >
                →
              </button>
            </div>
          )}
        </article>
      </WidgetContainer>
    </div>
  );
}
