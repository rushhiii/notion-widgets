"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { WidgetContainer } from "@/components/ui/WidgetContainer";
import { getQuotes, Quote } from "@/lib/quotes";
import { parseBooleanParam, parsePositiveIntParam, resolveTheme } from "@/lib/utils";

function randomFrom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function QuoteWidget() {
  const searchParams = useSearchParams();

  const categoryParam = (searchParams.get("category") ?? "").trim().toLowerCase();
  const sourceParam = (searchParams.get("source") ?? "auto").trim().toLowerCase();
  const theme = resolveTheme(searchParams.get("theme"));
  const autoRotate = parseBooleanParam(searchParams.get("rotate"), false);
  const intervalSeconds = parsePositiveIntParam(searchParams.get("interval"), 10);

  const source: "local" | "notion" | "auto" =
    sourceParam === "local" || sourceParam === "notion" ? sourceParam : "auto";

  const baseQuotes = useMemo(() => getQuotes(source), [source]);

  const filteredQuotes = useMemo(() => {
    if (!categoryParam) return baseQuotes;
    return baseQuotes.filter((quote) => quote.category.toLowerCase() === categoryParam);
  }, [categoryParam, baseQuotes]);

  const availableQuotes = filteredQuotes.length > 0 ? filteredQuotes : baseQuotes;
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    setQuote(randomFrom(availableQuotes));
  }, [availableQuotes]);

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

  return (
    <WidgetContainer
      theme={theme}
      className={
        theme === "dark"
          ? "bg-[#0e0f12]"
          : theme === "light"
            ? "bg-[#e6e6e8]"
            : "bg-transparent"
      }
    //   contentClassName="max-w-[980px] rounded-none border-transparent bg-transparent p-0"
      contentClassName="max-w-[70%] rounded-none border-transparent bg-transparent p-0"
      heightClassName="h-[240px]"
    >
      <article
        className={
          theme === "dark"
            ? "flex h-full w-full flex-col items-center justify-center rounded-[14px] border border-purple-500/90 bg-black px-5"
            : "flex h-full w-full flex-col items-center justify-center rounded-[14px] border border-zinc-300 bg-[#f4f4f5] px-5"
        }
      >
        <blockquote
          className={
            theme === "dark"
              ? "max-w-[900px] text-center font-serif text-[clamp(1.65rem,2.1vw,2.1rem)] italic leading-[1.45] text-zinc-100"
              : "max-w-[900px] text-center font-serif text-[clamp(1.65rem,2.1vw,2.1rem)] italic leading-[1.45] text-zinc-900"
          }
        >
          “{quote?.text ?? "Loading quote..."}”
        </blockquote>
        <footer
          className={
            theme === "dark"
              ? "mt-3 text-[clamp(1rem,1.2vw,1.2rem)] leading-none text-zinc-400"
              : "mt-3 text-[clamp(1rem,1.2vw,1.2rem)] leading-none text-zinc-600"
          }
        >
          {quote?.author ?? ""}
        </footer>
      </article>
    </WidgetContainer>
  );
}
