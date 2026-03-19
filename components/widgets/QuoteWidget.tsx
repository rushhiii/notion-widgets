"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { WidgetContainer } from "@/components/ui/WidgetContainer";
import { getQuotes, Quote } from "@/lib/quotes";
import { parseBooleanParam, parsePositiveIntParam, parseColorParam, resolveTheme } from "@/lib/utils";

type QuoteEmbedParams = {
  category?: string;
  source?: "auto" | "local" | "notion";
  theme?: "dark" | "light";
  rotate?: boolean;
  interval?: number;
  mode?: "daily" | "random";
  bg?: string;
  border?: string;
  text?: string;
  accent?: string;
  pageBg?: string;
  pageMatch?: boolean;
  pageTransparent?: boolean;
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

export function QuoteWidget({ embedParams }: { embedParams?: QuoteEmbedParams }) {
  const searchParams = useSearchParams();

  const categoryParam = (embedParams?.category ?? searchParams.get("category") ?? "").trim().toLowerCase();
  const sourceParam = (embedParams?.source ?? searchParams.get("source") ?? "auto").trim().toLowerCase();
  const rawThemeParam = (embedParams?.theme ?? searchParams.get("theme") ?? "").trim().toLowerCase();
  const requestedTheme = resolveTheme(rawThemeParam);
  const theme: "dark" | "light" = requestedTheme === "light" ? "light" : "dark";
  const autoRotate = embedParams?.rotate ?? parseBooleanParam(searchParams.get("rotate"), false);
  const intervalSeconds = embedParams?.interval ?? parsePositiveIntParam(searchParams.get("interval"), 10);
  const modeParam = (embedParams?.mode ?? searchParams.get("mode") ?? "daily").trim().toLowerCase();
  const bgParam = embedParams?.bg ?? parseColorParam(searchParams.get("bg"));
  const borderParam = embedParams?.border ?? parseColorParam(searchParams.get("border"));
  const textParam = embedParams?.text ?? parseColorParam(searchParams.get("text"));
  const accentParam = embedParams?.accent ?? parseColorParam(searchParams.get("accent"));
  const pageBgParam = embedParams?.pageBg ?? parseColorParam(searchParams.get("pagebg"));
  const pageMatch = embedParams?.pageMatch ?? parseBooleanParam(searchParams.get("pagematch"), true);
  const pageTransparent = embedParams?.pageTransparent ?? parseBooleanParam(searchParams.get("pagetransparent"), false);

  const source: "local" | "notion" | "auto" =
    sourceParam === "local" || sourceParam === "notion" ? sourceParam : "auto";

  const baseQuotes = useMemo(() => getQuotes(source), [source]);

  const filteredQuotes = useMemo(() => {
    if (!categoryParam) return baseQuotes;
    return baseQuotes.filter((quote) => quote.category.toLowerCase() === categoryParam);
  }, [categoryParam, baseQuotes]);

  const availableQuotes = filteredQuotes.length > 0 ? filteredQuotes : baseQuotes;
  const initialQuote = useMemo(() => {
    if (modeParam === "random") return availableQuotes.length ? randomFrom(availableQuotes) : null;
    return pickDailyQuote(availableQuotes, categoryParam, source);
  }, [availableQuotes, categoryParam, source, modeParam]);

  const [quote, setQuote] = useState<Quote | null>(initialQuote);

  useEffect(() => {
    setQuote(initialQuote);
  }, [initialQuote]);

  useEffect(() => {
    if (!autoRotate || availableQuotes.length <= 1) return;

    const id = window.setInterval(() => {
      setQuote((current) => {
        if (availableQuotes.length === 1) return availableQuotes[0];

        let next = randomFrom(availableQuotes);
        while (next.text === current?.text && availableQuotes.length > 1) {
          next = randomFrom(availableQuotes);
        }
        return next;
      });
    }, intervalSeconds * 1000);

    return () => window.clearInterval(id);
  }, [autoRotate, intervalSeconds, availableQuotes]);

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
        </article>
      </WidgetContainer>
    </div>
  );
}
