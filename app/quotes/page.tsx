import type { Metadata } from "next";
import { QuoteWidget } from "@/components/widgets/QuoteWidget";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Quotes",
  description: "Embeddable quote widget with optional Notion source",
  icons: {
    icon: "/icons/quotes.png",
  },
};

export default function QuotesPage() {
  return <QuoteWidget />;
}
