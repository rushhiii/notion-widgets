import notionQuotes from "@/lib/quotes.notion.json";

export type QuoteCategory = string;

export type Quote = {
  text: string;
  author: string;
  category: QuoteCategory;
  sourceType?: string;
  language?: string;
  tags?: string[];
  show?: boolean;
  pinned?: boolean;
  personal?: boolean;
};

export const QUOTES_ADMIN_SECRET = process.env.NEXT_PUBLIC_QUOTES_ADMIN_KEY || "error";

export const QUOTES: Quote[] = [
  {
    text: "You have power over your mind—not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
    category: "stoic",
  },
  {
    text: "We suffer more in imagination than in reality.",
    author: "Seneca",
    category: "stoic",
  },
  {
    text: "Concentrate all your thoughts upon the work in hand.",
    author: "Alexander Graham Bell",
    category: "focus",
  },
  {
    text: "Starve your distractions, feed your focus.",
    author: "Unknown",
    category: "focus",
  },
  {
    text: "Success is the product of daily habits—not once-in-a-lifetime transformations.",
    author: "James Clear",
    category: "growth",
  },
  {
    text: "Small daily improvements over time lead to stunning results.",
    author: "Robin Sharma",
    category: "growth",
  },
  {
    text: "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.",
    author: "Thich Nhat Hanh",
    category: "mindfulness",
  },
  {
    text: "The present moment is the only time over which we have dominion.",
    author: "Thich Nhat Hanh",
    category: "mindfulness",
  },
];

function sanitizeQuote(input: Partial<Quote>): Quote | null {
  const text = (input.text ?? "").trim();
  const author = (input.author ?? "").trim() || "Unknown";
  const category = (input.category ?? "general").trim().toLowerCase() || "general";
  if (!text || text.toLowerCase() === "untitled") return null;

  return {
    text,
    author,
    category,
    sourceType: input.sourceType?.trim().toLowerCase() || undefined,
    language: input.language?.trim().toLowerCase() || undefined,
    tags: input.tags?.map((t) => t.trim().toLowerCase()).filter(Boolean),
    show: input.show !== false,
    pinned: Boolean(input.pinned),
    personal: Boolean(input.personal),
  };
}

export const NOTION_QUOTES: Quote[] = (notionQuotes as Partial<Quote>[])
  .map(sanitizeQuote)
  .filter((quote): quote is Quote => quote !== null);

export function getQuotes(source: "local" | "notion" | "auto" = "auto"): Quote[] {
  if (source === "local") return QUOTES;
  if (source === "notion") return NOTION_QUOTES.length > 0 ? NOTION_QUOTES : QUOTES;
  return NOTION_QUOTES.length > 0 ? NOTION_QUOTES : QUOTES;
}
