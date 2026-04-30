import notionQuotes from "@/lib/quotes.notion.json";

export type QuoteCategory = string;

export type Quote = {
  text: string;
  author: string;
  category: QuoteCategory;
  reference?: string;
  resources?: string;
  sourceType?: string;
  language?: string;
  tags?: string[];
  show?: boolean;
  pinned?: boolean;
  personal?: boolean;
};

export const QUOTES_ADMIN_SECRET = process.env.NEXT_PUBLIC_QUOTES_ADMIN_KEY || "error";

export type QuoteStyleKey = "paper" | "slate" | "graphite" | "lavender" | "moss";

export type QuoteStylePreset = {
  label: string;
  bg: string;
  border: string;
  text: string;
  accent: string;
  quoteFont: string;
  authorFont: string;
};

export const QUOTE_STYLE_PRESETS: Record<QuoteStyleKey, QuoteStylePreset> = {
  paper: {
    label: "Paper",
    bg: "#f6f1e7",
    border: "#e2d7c5",
    text: "#2f2a26",
    accent: "#5b4b3b",
    quoteFont: "var(--font-libre-baskerville), serif",
    authorFont: "var(--font-karla), sans-serif",
  },
  slate: {
    label: "Slate",
    bg: "#f4f5f7",
    border: "#d9dde3",
    text: "#1f2937",
    accent: "#4b5563",
    quoteFont: "var(--font-plus-jakarta), sans-serif",
    authorFont: "var(--font-manrope), sans-serif",
  },
  graphite: {
    label: "Graphite",
    bg: "#0f1115",
    border: "#2a2f39",
    text: "#e5e7eb",
    accent: "#9ca3af",
    quoteFont: "var(--font-space-grotesk), sans-serif",
    authorFont: "ui-monospace, SFMono-Regular, Menlo, monospace",
  },
  lavender: {
    label: "Lavender",
    bg: "#f3effa",
    border: "#d9d0f1",
    text: "#2a2238",
    accent: "#6c5a95",
    quoteFont: "var(--font-playfair), serif",
    authorFont: "var(--font-sora), sans-serif",
  },
  moss: {
    label: "Moss",
    bg: "#eef3ee",
    border: "#cfdccf",
    text: "#203026",
    accent: "#4b6b57",
    quoteFont: "var(--font-manrope), sans-serif",
    authorFont: "var(--font-karla), sans-serif",
  },
};

export const QUOTE_STYLE_ORDER: QuoteStyleKey[] = ["paper", "slate", "graphite", "lavender", "moss"];

export type QuoteFontKey = "playfair" | "libre" | "karla" | "manrope" | "sora" | "space" | "jakarta" | "mono";

export const QUOTE_FONT_OPTIONS: Record<QuoteFontKey, { label: string; family: string }> = {
  playfair: { label: "Playfair Display", family: "var(--font-playfair), serif" },
  libre: { label: "Libre Baskerville", family: "var(--font-libre-baskerville), serif" },
  karla: { label: "Karla", family: "var(--font-karla), sans-serif" },
  manrope: { label: "Manrope", family: "var(--font-manrope), sans-serif" },
  sora: { label: "Sora", family: "var(--font-sora), sans-serif" },
  space: { label: "Space Grotesk", family: "var(--font-space-grotesk), sans-serif" },
  jakarta: { label: "Plus Jakarta Sans", family: "var(--font-plus-jakarta), sans-serif" },
  mono: { label: "Mono", family: "ui-monospace, SFMono-Regular, Menlo, monospace" },
};

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
  const raw = input as Record<string, unknown>;
  const resolveResourceValue = () => {
    const candidates = [
      input.resources,
      input.reference,
      raw.resources,
      raw.resource,
      raw.reference,
      raw.Resources,
      raw.Resource,
      raw.Reference,
    ];
    for (const value of candidates) {
      if (typeof value === "string" && value.trim()) return value.trim();
    }
    return undefined;
  };

  const text = (input.text ?? "").trim();
  const author = (input.author ?? "").trim() || "Unknown";
  const category = (input.category ?? "general").trim().toLowerCase() || "general";
  const resourceValue = resolveResourceValue();
  if (!text || text.toLowerCase() === "untitled") return null;

  return {
    text,
    author,
    reference: resourceValue,
    resources: resourceValue,
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
