import type { Metadata } from "next";
import QuotesClientView from "./ClientView";

export const metadata: Metadata = {
  title: "Quotes",
  description: "Embeddable quote widget with optional Notion source",
  icons: {
    // icon: "/icons/quotes.png",
    icon: "/icons/bw_quotes.png",
  },
};

export default function QuotesPage() {
  return <QuotesClientView />;
}
