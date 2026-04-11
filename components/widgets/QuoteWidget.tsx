"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WidgetContainer } from "@/components/ui/WidgetContainer";
import {
  getQuotes,
  Quote,
  QUOTES_ADMIN_SECRET,
  QUOTE_STYLE_PRESETS,
  QUOTE_FONT_OPTIONS,
  QuoteStyleKey,
  QuoteFontKey,
} from "@/lib/quotes";
import { parseBooleanParam, parsePositiveIntParam, parseColorParam, resolveTheme } from "@/lib/utils";

type TransparentBgMode = "off" | "dark" | "light";
type CustomQuoteMode = "custom" | "database";

type QuoteEmbedParams = {
  instance?: string;
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
  style?: QuoteStyleKey;
  width?: number;
  quoteSize?: number;
  authorSize?: number;
  quoteFont?: QuoteFontKey;
  authorFont?: QuoteFontKey;
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
  pageTransparentMode?: TransparentBgMode;
  admin?: string;
  customText?: string;
  customAuthor?: string;
  customMode?: CustomQuoteMode;
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

function sanitizeInstance(value: string) {
  return value.replace(/[^a-z0-9_-]/gi, "");
}

function getCustomQuoteStorageKey(instance: string) {
  const safeInstance = sanitizeInstance(instance);
  return `quotes:custom:${safeInstance || "default"}`;
}

export function QuoteWidget({ embedParams }: { embedParams?: QuoteEmbedParams }) {
  const searchParams = useSearchParams();

  const instanceParam = (embedParams?.instance ?? searchParams.get("instance") ?? "").trim();
  const normalizedInstance = sanitizeInstance(instanceParam);

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
  const styleParam = (embedParams?.style ?? searchParams.get("style") ?? "").trim().toLowerCase();
  const widthParam = embedParams?.width ?? parsePositiveIntParam(searchParams.get("width"), 0);
  const quoteSizeParam = embedParams?.quoteSize ?? parsePositiveIntParam(searchParams.get("quotesize"), 0);
  const authorSizeParam = embedParams?.authorSize ?? parsePositiveIntParam(searchParams.get("authorsize"), 0);
  const quoteFontParam = (embedParams?.quoteFont ?? searchParams.get("quotefont") ?? "").trim().toLowerCase();
  const authorFontParam = (embedParams?.authorFont ?? searchParams.get("authorfont") ?? "").trim().toLowerCase();
  const stylePreset = QUOTE_STYLE_PRESETS[styleParam as QuoteStyleKey];
  const requestedTheme = resolveTheme(rawThemeParam);
  const theme: "dark" | "light" = requestedTheme === "light" ? "light" : "dark";
  const autoRotate = embedParams?.rotate ?? parseBooleanParam(searchParams.get("rotate"), false);
  const intervalSeconds = embedParams?.interval ?? parsePositiveIntParam(searchParams.get("interval"), 10);
  const modeParam = (embedParams?.mode ?? searchParams.get("mode") ?? "daily").trim().toLowerCase() as QuoteEmbedParams["mode"];
  const startIndexOneBased = embedParams?.startIndex ?? parsePositiveIntParam(searchParams.get("index"), 1);
  const startIndexParam = Math.max(1, startIndexOneBased);
  const queryParam = (embedParams?.q ?? searchParams.get("q") ?? "").trim().toLowerCase();
  const queryTerms = useMemo(() => queryParam.split(/\s+/).map((t) => t.trim()).filter(Boolean), [queryParam]);
  const showPinned = embedParams?.showPinned ?? parseBooleanParam(searchParams.get("pinned"), false);
  const showPersonal = embedParams?.showPersonal ?? parseBooleanParam(searchParams.get("personal"), false);
  // Removed showNoteOnly parameter
  const bgParam = embedParams?.bg ?? parseColorParam(searchParams.get("bg"));
  const borderParam = embedParams?.border ?? parseColorParam(searchParams.get("border"));
  const textParam = embedParams?.text ?? parseColorParam(searchParams.get("text"));
  const accentParam = embedParams?.accent ?? parseColorParam(searchParams.get("accent"));
  const pageBgParam = embedParams?.pageBg ?? parseColorParam(searchParams.get("pagebg"));
  const pageMatch = embedParams?.pageMatch ?? parseBooleanParam(searchParams.get("pagematch"), true);
  const pageTransparentModeParam = (embedParams?.pageTransparentMode ?? searchParams.get("pagetransparentmode") ?? "").trim().toLowerCase();
  const pageTransparent = embedParams?.pageTransparent ?? parseBooleanParam(searchParams.get("pagetransparent"), false);
  const transparentBgMode: TransparentBgMode =
    pageTransparentModeParam === "dark" || pageTransparentModeParam === "light"
      ? (pageTransparentModeParam as TransparentBgMode)
      : pageTransparent
        ? "dark"
        : "off";
  const adminParam = (embedParams?.admin ?? searchParams.get("admin") ?? "").trim();
  const customTextParam = (embedParams?.customText ?? searchParams.get("customtext") ?? "").trim();
  const customAuthorParam = (embedParams?.customAuthor ?? searchParams.get("customauthor") ?? "").trim();
  const customModeParam = (embedParams?.customMode ?? searchParams.get("custommode") ?? "").trim().toLowerCase();

  const [storedCustom, setStoredCustom] = useState<{ text: string; author: string; mode: CustomQuoteMode }>(
    { text: "", author: "", mode: "database" },
  );

  useEffect(() => {
    const hasCustomOverrides =
      customTextParam.length > 0 || customAuthorParam.length > 0 || customModeParam.length > 0;
    if (hasCustomOverrides || typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(getCustomQuoteStorageKey(normalizedInstance));
      if (!raw) {
        setStoredCustom({ text: "", author: "", mode: "database" });
        return;
      }
      const parsed = JSON.parse(raw) as Partial<{ text: string; author: string; mode: CustomQuoteMode }>;
      const nextMode = parsed.mode === "custom" ? "custom" : "database";
      setStoredCustom({ text: parsed.text ?? "", author: parsed.author ?? "", mode: nextMode });
    } catch {
      setStoredCustom({ text: "", author: "", mode: "database" });
    }
  }, [embedParams?.customText, embedParams?.customAuthor, embedParams?.customMode, normalizedInstance]);

  const customText = customTextParam || storedCustom.text;
  const customAuthor = customAuthorParam || storedCustom.author;
  const customMode = (customModeParam === "custom" || customModeParam === "database")
    ? (customModeParam as CustomQuoteMode)
    : storedCustom.mode;
  const customTextValue = customText.trim();
  const hasCustomQuote = customTextValue.length > 0;
  const useCustomOnly = customMode === "custom" && hasCustomQuote;
  const customQuote: Quote = {
    text: customTextValue,
    author: customAuthor.trim() || "Unknown",
    category: "custom",
  };

  const isAdminBypass = adminParam === QUOTES_ADMIN_SECRET;
  const effectiveShowPinned = isAdminBypass ? showPinned : false;
  const effectiveShowPersonal = isAdminBypass ? showPersonal : false;

  const restrictedAuthors = ["unknow", "unknown", "n/a"];
  const restrictedLanguages = ["hindi", "persian", "punjabi", "punjabi/hindi"];
  const restrictedSourceTypes = ["poetry", "quote", "saying", "series", "song"];

  const safeAuthorsParam = isAdminBypass ? authorsParam : authorsParam.filter((a) => !restrictedAuthors.includes(a));
  const safeLanguagesParam = isAdminBypass ? languagesParam : languagesParam.filter((l) => !restrictedLanguages.includes(l));
  const safeLanguageParam = !isAdminBypass && restrictedLanguages.includes(languageParam) ? "" : languageParam;
  const safeSourceTypesParam = isAdminBypass ? sourceTypesParam : sourceTypesParam.filter((s) => !restrictedSourceTypes.includes(s));
  const safeSourceTypeParam = !isAdminBypass && restrictedSourceTypes.includes(sourceTypeParam) ? "" : sourceTypeParam;

  const source: "local" | "notion" | "auto" =
    sourceParam === "local" || sourceParam === "notion" ? sourceParam : "auto";

  const baseQuotes = useMemo(() => (useCustomOnly ? [customQuote] : getQuotes(source)), [source, useCustomOnly, customQuote]);

  const filteredQuotes = useMemo(() => {
    if (useCustomOnly) return baseQuotes;

    const candidates = baseQuotes.filter((q) => {
      const hidden = q.show === false;
      if (!isAdminBypass && hidden) return false;
      
      if (effectiveShowPinned && !q.pinned) return false;
      if (effectiveShowPersonal && !q.personal) return false;
      if (categoriesParam.length && !categoriesParam.includes(q.category.toLowerCase())) return false;
      if (categoryParam && q.category.toLowerCase() !== categoryParam) return false;
      if (safeAuthorsParam.length && !safeAuthorsParam.includes(q.author.toLowerCase())) return false;
      if (tagsParam.length && !(q.tags || []).some((t) => tagsParam.includes(t))) return false;
      const langVal = (q.language || "").toLowerCase();
      if (safeLanguagesParam.length ? !safeLanguagesParam.includes(langVal) : safeLanguageParam && langVal !== safeLanguageParam) return false;
      const srcTypeVal = (q.sourceType || "").toLowerCase();
      if (safeSourceTypesParam.length ? !safeSourceTypesParam.includes(srcTypeVal) : safeSourceTypeParam && srcTypeVal !== safeSourceTypeParam) return false;
      if (queryTerms.length) {
        const haystack = (q.text || "").toLowerCase();
        if (!queryTerms.every((term) => haystack.includes(term))) return false;
      }
      return true;
    });
    return candidates;
  }, [
    baseQuotes,
    useCustomOnly,
    isAdminBypass,
    effectiveShowPinned,
    effectiveShowPersonal,
    categoryParam,
    categoriesParam,
    safeAuthorsParam,
    tagsParam,
    safeLanguagesParam,
    safeLanguageParam,
    safeSourceTypesParam,
    safeSourceTypeParam,
    queryTerms,
  ]);

  const filtersApplied = !useCustomOnly && Boolean(
    categoriesParam.length ||
      categoryParam ||
        safeAuthorsParam.length ||
      tagsParam.length ||
        safeLanguagesParam.length ||
        safeLanguageParam ||
        safeSourceTypesParam.length ||
        safeSourceTypeParam ||
        queryTerms.length ||
      effectiveShowPinned ||
      effectiveShowPersonal,
  );

  const availableQuotes = useMemo(
    () => (filteredQuotes.length > 0 ? filteredQuotes : filtersApplied ? [] : baseQuotes),
    [filteredQuotes, filtersApplied, baseQuotes],
  );

  const noQuotes = availableQuotes.length === 0;
  const canStep = modeParam === "flashcard" && availableQuotes.length > 1 && !noQuotes;

  const initialIndex = useMemo(() => {
    if (!availableQuotes.length) return 0;
    const zeroBased = Math.max(0, startIndexParam - 1);
    if (Number.isFinite(zeroBased)) return zeroBased % availableQuotes.length;
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

  const cardBackground = bgParam ?? stylePreset?.bg ?? (theme === "dark" ? "#000" : "#f4f4f5");
  const cardBorder = borderParam ?? stylePreset?.border ?? (theme === "dark" ? "#7c3aed" : "#d4d4d8");
  const quoteColor = textParam ?? stylePreset?.text ?? (theme === "dark" ? "#e5e7eb" : "#0f172a");
  const authorColor = accentParam ?? stylePreset?.accent ?? (theme === "dark" ? "#a1a1aa" : "#475569");
  const quoteFont =
    QUOTE_FONT_OPTIONS[quoteFontParam as QuoteFontKey]?.family ??
    stylePreset?.quoteFont ??
    "var(--font-playfair), serif";
  const authorFont =
    QUOTE_FONT_OPTIONS[authorFontParam as QuoteFontKey]?.family ??
    stylePreset?.authorFont ??
    "var(--font-karla), sans-serif";
  const cardMaxWidth = widthParam > 0 ? `${widthParam}px` : undefined;
  const quoteFontSize = quoteSizeParam > 0 ? `${quoteSizeParam}px` : undefined;
  const authorFontSize = authorSizeParam > 0 ? `${authorSizeParam}px` : undefined;
  const pageBackground = transparentBgMode !== "off"
    ? (transparentBgMode === "dark" ? "#191919" : "#ffffff")
    : pageMatch
      ? cardBackground
      : pageBgParam ?? (theme === "dark" ? "#191919" : "#f4f4f5");

  return (
    <div style={{ backgroundColor: pageBackground }} className="w-full h-full scroll-smooth md:scroll-auto">
      <WidgetContainer
        theme={theme}
        className="bg-transparent"
        contentClassName="w-full max-w-[90vw] rounded-none border-transparent bg-transparent p-0"
        heightClassName="min-h-[260px] max-h-[90vw]"
      >
        <article
          className="group relative flex h-full w-full flex-col items-center justify-center rounded-[1.1rem] border px-11 py-9 md:px-12 md:py-12"
          style={{
            backgroundColor: cardBackground,
            borderColor: cardBorder,
            maxWidth: cardMaxWidth,
          }}
        >
          <blockquote
            className="w-full max-w-[900px] whitespace-pre-wrap break-words text-center font-serif text-[clamp(1.25rem,2vw,2.1rem)] italic leading-[1.45]"
            style={{ color: quoteColor, fontFamily: quoteFont, fontSize: quoteFontSize }}
          >
            “{noQuotes ? "No quotes match your filters." : quote?.text ?? "Loading quote..."}”
          </blockquote>
          <footer
            className="mt-3 text-[clamp(1rem,1.2vw,1.2rem)] leading-none"
            style={{ color: authorColor, fontFamily: authorFont, fontSize: authorFontSize }}
          >
            {noQuotes ? "" : quote?.author ?? ""}
          </footer>

          {modeParam === "flashcard" && (
            <div className="mt-6 flex w-full items-center justify-center">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/70">
                {availableQuotes.length ? cardIndex + 1 : 0}/{availableQuotes.length}
              </span>
            </div>
          )}

          {canStep && (
            <>
              <button
                // className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 px-3 py-2 shadow-lg transition hover:bg-black/45"
                className="absolute -translate-x-0 md:left-3 left-2 top-1/2 -translate-y-1/2 opacity-1 pointer-events-none transition-opacity duration-200 ease-out group-hover:opacity-100 group-hover:pointer-events-auto focus-visible:opacity-100 focus-visible:pointer-events-auto"
                // className="absolute -translate-x-1 left-2 top-1/2 -translate-y-1/2 opacity-0 pointer-events-none transition-opacity duration-200 ease-out group-hover:opacity-100 group-hover:pointer-events-auto focus-visible:opacity-100 focus-visible:pointer-events-auto"
                onClick={() => stepCard(-1)}
                aria-label="Previous quote"
                style={{ color: quoteColor }}
              >
                <ChevronLeft size={30} strokeWidth={2} aria-hidden />
              </button>
              <button
                // className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 px-3 py-2 shadow-lg transition hover:bg-black/45"
                className="absolute translate-x-0 md:right-3 right-2 top-1/2 -translate-y-1/2 opacity-1 pointer-events-none transition-opacity duration-200 ease-out group-hover:opacity-100 group-hover:pointer-events-auto focus-visible:opacity-100 focus-visible:pointer-events-auto"
                // className="absolute translate-x-1.5 right-2 top-1/2 -translate-y-1/2 opacity-0 pointer-events-none transition-opacity duration-200 ease-out group-hover:opacity-100 group-hover:pointer-events-auto focus-visible:opacity-100 focus-visible:pointer-events-auto"

                onClick={() => stepCard(1)}
                aria-label="Next quote"
                style={{ color: quoteColor }}
              >
                <ChevronRight size={30} strokeWidth={2} aria-hidden />
                {/* <ChevronLeft size={30} strokeWidth={2} aria-hidden /> */}
              </button>
            </>
          )}
        </article>
      </WidgetContainer>
    </div>
  );
}
