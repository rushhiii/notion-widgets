import { Suspense } from "react";
import type { Metadata } from "next";
import QuotesClientView from "./ClientView";

export const metadata: Metadata = {
  title: "Quotes",
  description: "Embeddable quote widget with optional Notion source",
  icons: {
    icon: "/icons/quotes.png",
    // icon: "/icons/bw_quotes.png",
  },
};

export default function QuotesPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-zinc-950" aria-busy="true" />}> 
      <QuotesClientView />
    </Suspense>
  );
}
