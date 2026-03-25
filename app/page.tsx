"use client";
import React, { useRef, useState } from "react";
import Link from "next/link";

export const dynamic = "force-static";


// For each card, track hover and mouse position
function useCardHover() {
  const cardRef = useRef<HTMLDivElement>(null);
  // Track if the card has ever been hovered
  const [hasHovered, setHasHovered] = useState(false);
  // Store the last mouse position (SSR-safe: fixed initial value)
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 80, y: 80 });
  // On mount (client only), set a random position if never hovered
  React.useEffect(() => {
    if (cardRef.current && !hasHovered) {
      const rect = cardRef.current.getBoundingClientRect();
      setMousePos({
        x: Math.floor(Math.random() * (rect.width - 60) + 30),
        y: Math.floor(Math.random() * (rect.height - 60) + 30),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setHasHovered(true);
  }

  // Always use the last mousePos (even after mouse leave)
  const cardBg = {
    background:
      `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.04) 0%, transparent 30%),` +
      `rgba(17,17,23,.8)`
  };

  return { cardRef, handleMouseMove, cardBg };
}

export default function HomePage() {

  // Card data for mapping
  const cards = [
    {
      title: "Clock Widget",
      desc: "Live clock with timezone, 12/24-hour format, seconds toggle, and dark-first theme.",
      links: [
        { label: "/clock", url: "/clock" },
        { label: "/clock?tz=America/Toronto&format=24&theme=dark", url: null },
      ],
      actions: [
        { label: "Open Clock", url: "/clock" },
      ],
    },
    {
      title: "Quotes Widget",
      desc: "Rotating quotes from local data or synced Notion source, with category and timing controls.",
      links: [
        { label: "/quotes", url: "/quotes" },
        { label: "/quotes?source=notion&theme=dark&rotate=true&interval=8", url: null },
      ],
      actions: [
        { label: "Open Builder", url: "/quotes" },
        { label: "View", url: "/quotes/?embed=1" },
      ],
    },
    {
      title: "D-Day Widget",
      desc: "Countdown/elapsed badges with days, weeks, months, years, hours, minutes, seconds, and mega-seconds.",
      links: [
        { label: "/dday", url: "/dday" },
        { label: "/dday?date=2026-12-31&day=1&hours=1&minutes=1&seconds=1&timeColor=0d9488&totalseconds=1&megaseconds=1&units=1&weeks=1&months=1&years=1", url: null },
      ],
      actions: [
        { label: "Open Builder", url: "/dday" },
        { label: "View", url: "/dday/?embed=1" },
      ],
    },
    {
      title: "Weather Widget",
      desc: "Current conditions from OpenWeather with city or lat/lon, metric or imperial units, optional details.",
      links: [
        { label: "/weather", url: "/weather" },
        { label: "/weather?location=Toronto&units=metric&bg=eaf1ec&accent=10b981", url: null },
      ],
      actions: [
        { label: "Open Builder", url: "/weather" },
        { label: "View", url: "/weather/?embed=1" },
      ],
    },
    {
      title: "Progress Widget",
      desc: "Customizable progress bar with milestones, prefixes/suffixes, and a built-in embed link copier.",
      links: [
        { label: "/progress", url: "/progress" },
        { label: "/progress?goal=23300&progress=5000&prefix=%2A&ms=+1:8200&ms=+bundle:15000&ms=+3:20000&embed=1", url: null },
      ],
      actions: [
        { label: "Open Builder", url: "/progress" },
        { label: "View", url: "/progress/?embed=1" },
      ],
    },
  ];

  return (
    <main className="landing relative h-screen w-full overflow-hidden bg-zinc-950 px-6 py-0 text-zinc-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.2),transparent_55%)]" />

      <div className="relative mx-auto flex h-full w-full px-0 py-10 max-w-6xl flex-col overflow-y-auto scrollbar-hide">
        <header className="mb-7">
          <div className="flex justify-between items-center">
            <p className="badge inline-flex rounded-full border px-3 py-1 text-xs font-medium tracking-wide">
              Notion Widget Suite
            </p>
            <a aria-label="GitHub repository" target="_blank" rel="noopener noreferrer" href="https://github.com/rushhiii/notion-widgets" className="rounded-full bg-[#22222dcc] opacity-70 transition duration-700 ease-in-out hover:opacity-100 inline-flex mx-0 my-1 text-xs font-medium tracking-wide">
              <svg viewBox="0 0 20 20" className="size-7 fill-[#E0DBFD]">
                <path d="M10 0C4.475 0 0 4.475 0 10a9.994 9.994 0 006.838 9.488c.5.087.687-.213.687-.476 0-.237-.013-1.024-.013-1.862-2.512.463-3.162-.612-3.362-1.175-.113-.287-.6-1.175-1.025-1.412-.35-.188-.85-.65-.013-.663.788-.013 1.35.725 1.538 1.025.9 1.512 2.337 1.087 2.912.825.088-.65.35-1.088.638-1.338-2.225-.25-4.55-1.112-4.55-4.937 0-1.088.387-1.987 1.025-2.688-.1-.25-.45-1.274.1-2.65 0 0 .837-.262 2.75 1.026a9.28 9.28 0 012.5-.338c.85 0 1.7.112 2.5.337 1.912-1.3 2.75-1.024 2.75-1.024.55 1.375.2 2.4.1 2.65.637.7 1.025 1.587 1.025 2.687 0 3.838-2.337 4.688-4.562 4.938.362.312.675.912.675 1.85 0 1.337-.013 2.412-.013 2.75 0 .262.188.574.688.474A10.016 10.016 0 0020 10c0-5.525-4.475-10-10-10z">
                </path>
              </svg>
            </a>

            {/* <button
              className="rounded-full bg-[rgba(0 0 0 / 0)] opacity-70 transition duration-700 ease-in-out hover:opacity-100 inline-flex mx-0 my-1 text-xs font-medium tracking-wide text-white"

            >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="size-7 fill-[#E0DBFD]"><path d="M569 337C578.4 327.6 578.4 312.4 569 303.1L425 159C418.1 152.1 407.8 150.1 398.8 153.8C389.8 157.5 384 166.3 384 176L384 256L272 256C245.5 256 224 277.5 224 304L224 336C224 362.5 245.5 384 272 384L384 384L384 464C384 473.7 389.8 482.5 398.8 486.2C407.8 489.9 418.1 487.9 425 481L569 337zM224 160C241.7 160 256 145.7 256 128C256 110.3 241.7 96 224 96L160 96C107 96 64 139 64 192L64 448C64 501 107 544 160 544L224 544C241.7 544 256 529.7 256 512C256 494.3 241.7 480 224 480L160 480C142.3 480 128 465.7 128 448L128 192C128 174.3 142.3 160 160 160L224 160z" /></svg>
            </button> */}

          </div>
          <h1 className="hero-title mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
            Beautiful, embeddable widgets for Notion
          </h1>
          <p className="lead mt-3 max-w-3xl text-sm md:text-base">
            Use the links below to open widgets directly, customize through URL params, and paste them into Notion via
            /embed.
          </p>
        </header>

        <section className="grid flex-1 grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <Card key={card.title} card={card} />
          ))}
        </section>
        <footer className="mt-6 text-xs text-zinc-500 space-y-1">
          <p>Tip: In Notion, type /embed and paste any widget URL.</p>
        </footer>
      </div>
    </main>
  );
}

// Card component moved outside HomePage for correct hook usage
type CardProps = {
  card: {
    title: string;
    desc: string;
    links: { label: string; url: string | null }[];
    actions: { label: string; url: string | null }[];
  };
};

function Card({ card }: CardProps) {
  const { cardRef, handleMouseMove, cardBg } = useCardHover();
  return (
    <article
      ref={cardRef}
      className="landing-card flex flex-col rounded-3xl border p-6 backdrop-blur transition-colors duration-300"
      style={cardBg}
      onMouseMove={handleMouseMove}
    >
      <h2 className="text-2xl font-semibold text-white">{card.title}</h2>
      <p className="mt-2 text-sm text-zinc-400">{card.desc}</p>
      <div className="mt-5 space-y-2 text-sm">
        {card.links.map((l, i) => (
          <p key={i} className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-zinc-300 overflow-hidden overflow-x-auto scrollbar-hide">
            {l.label}
          </p>
        ))}
      </div>
      <div className="mt-auto pt-6 flex items-center gap-3">
        {card.actions.map((a, i) => (
          a.url ? (
            <Link
              key={i}
              href={a.url}
              target="_blank"
              className="cta inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium text-white transition"
            >
              {a.label}
              {a.label === "View" || a.label === "Open Clock" ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 ml-1 lucide lucide-square-arrow-up-right-icon lucide-square-arrow-up-right"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M8 8h8v8" /><path d="m8 16 8-8" /></svg>
              ) : null}
            </Link>
          ) : null
        ))}
      </div>
    </article>
  );
}
