"use client";

import { useSearchParams } from "next/navigation";
import { QuoteWidget } from "@/components/widgets/QuoteWidget";
import QuotesBuilder from "./Builder";

// Chooses builder vs embed at runtime so the page can stay statically exported.
export function QuotesClientView() {
  const searchParams = useSearchParams();
  const embed = searchParams.get("embed") === "1";

  if (embed) return <QuoteWidget />;
  return <QuotesBuilder />;
}

export default QuotesClientView;
