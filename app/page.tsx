"use client";
import React, { useRef, useState } from "react";
import Link from "next/link";

export const dynamic = "force-static";

function useCardHover() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hasHovered, setHasHovered] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 80, y: 80 });
  React.useEffect(() => {
    if (cardRef.current && !hasHovered) {
      const rect = cardRef.current.getBoundingClientRect();
      setMousePos({
        x: Math.floor(Math.random() * (rect.width - 60) + 30),
        y: Math.floor(Math.random() * (rect.height - 60) + 30),
      });
    }
  }, [hasHovered]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setHasHovered(true);
  }

  const cardBg = {
    background:
      `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(20,184,184,0.08) 0%, transparent 40%),` +
      `linear-gradient(135deg, rgba(15,23,42,0.8) 0%, rgba(20,25,40,0.9) 100%)`
  };

  return { cardRef, handleMouseMove, cardBg };
}

export default function HomePage() {
  const cards = [
    {
      title: "Clock Widget",
      desc: "Live clock with timezone, 12/24-hour format, seconds toggle, and dark-first theme.",
      icon: "🕐",
      links: [
        { label: "/clock", url: "/clock" },
        { label: "/clock?tz=America/Toronto&format=24&theme=dark", url: null },
      ],
      actions: [
        { label: "Open Clock", url: "/clock" },
      ],
    },
    {
      title: "Progress Widget",
      desc: "Customizable progress bar with milestones, prefixes/suffixes, and a built-in embed link copier.",
      icon: "📊",
      links: [
        { label: "/progress", url: "/progress" },
        { label: "/progress?goal=23300&progress=5000&prefix=%2A&ms=+1:8200&ms=+bundle:15000&ms=+3:20000&embed=1", url: null },
      ],
      actions: [
        { label: "Open Builder", url: "/progress" },
        { label: "View", url: "/progress/?embed=1" },
      ],
    },
    {
      title: "Quotes Widget",
      desc: "Rotating quotes from local data or synced Notion source, with category and timing controls.",
      icon: "💬",
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
      icon: "⏳",
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
      icon: "🌤️",
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
      title: "Music Player Widget",
      desc: "APlayer + MetingJS embed with Netease and Tencent support, playlist/song/album/search/artist modes.",
      icon: "🎵",
      links: [
        { label: "/music-player", url: "/music-player" },
        { label: "/music-player?server=tencent&type=playlist&id=7888484143&embed=1", url: null },
      ],
      actions: [
        { label: "Open Builder", url: "/music-player" },
        { label: "View", url: "/music-player/?server=netease&type=playlist&id=12528089157&embed=1" },
      ],
    },
  ];

  return (
    <main className="landing relative min-h-screen w-full overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(20,184,184,0.15),rgba(200,100,255,0.05),transparent_80%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.05),transparent_70%)]" />

      <div className="relative mx-auto flex w-full flex-col px-6 py-16 max-w-7xl">
        <header className="mb-24 pt-4">
          <div className="flex justify-between items-start mb-12">
            <div className="inline-flex rounded-full border border-teal-500/30 bg-teal-500/5 px-4 py-2 text-sm font-medium text-teal-300 tracking-wide">
              Notion Widget Suite
            </div>
            <a
              aria-label="GitHub repository"
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/rushhiii/notion-widgets"
              className="group relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-800/50 hover:bg-slate-700/50 transition-colors duration-300"
              title="View on GitHub"
            >
              <svg viewBox="0 0 20 20" className="w-5 h-5 fill-slate-300 group-hover:fill-teal-300 transition-colors">
                <path d="M10 0C4.475 0 0 4.475 0 10a9.994 9.994 0 006.838 9.488c.5.087.687-.213.687-.476 0-.237-.013-1.024-.013-1.862-2.512.463-3.162-.612-3.362-1.175-.113-.287-.6-1.175-1.025-1.412-.35-.188-.85-.65-.013-.663.788-.013 1.35.725 1.538 1.025.9 1.512 2.337 1.087 2.912.825.088-.65.35-1.088.638-1.338-2.225-.25-4.55-1.112-4.55-4.937 0-1.088.387-1.987 1.025-2.688-.1-.25-.45-1.274.1-2.65 0 0 .837-.262 2.75 1.026a9.28 9.28 0 012.5-.338c.85 0 1.7.112 2.5.337 1.912-1.3 2.75-1.024 2.75-1.024.55 1.375.2 2.4.1 2.65.637.7 1.025 1.587 1.025 2.687 0 3.838-2.337 4.688-4.562 4.938.362.312.675.912.675 1.85 0 1.337-.013 2.412-.013 2.75 0 .262.188.574.688.474A10.016 10.016 0 0020 10c0-5.525-4.475-10-10-10z" />
              </svg>
            </a>
          </div>

          <div className="space-y-8">
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight leading-tight">
              <span className="block text-slate-100">Embeddable</span>
              <span className="block bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                widgets for Notion.
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
              Beautiful, interactive widgets you can customize and embed directly into your Notion pages. Use URL parameters for configuration, then paste with <code className="text-teal-300 font-mono bg-slate-900/50 px-2 py-1 rounded">/embed</code>.
            </p>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {cards.map((card) => (
            <Card key={card.title} card={card} />
          ))}
        </section>

        <footer className="mt-8 pt-12 border-t border-slate-800/50 text-center space-y-4">
          <p className="text-sm text-slate-500">
            💡 <span className="text-slate-400">Tip: All widgets are fully embeddable and customizable via URL parameters.</span>
          </p>
        </footer>
      </div>
    </main>
  );
}

type CardProps = {
  card: {
    title: string;
    desc: string;
    icon?: string;
    links: { label: string; url: string | null }[];
    actions: { label: string; url: string | null }[];
  };
};

function Card({ card }: CardProps) {
  const { cardRef, handleMouseMove, cardBg } = useCardHover();
  return (
    <article
      ref={cardRef}
      className="landing-card group flex flex-col rounded-2xl border border-slate-700/40 p-7 backdrop-blur-sm transition-all duration-300 hover:border-teal-500/50 hover:shadow-xl hover:shadow-teal-500/10"
      style={cardBg}
      onMouseMove={handleMouseMove}
    >
      {card.icon && (
        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
          {card.icon}
        </div>
      )}
      <h2 className="text-xl font-bold text-slate-100 group-hover:text-teal-300 transition-colors">{card.title}</h2>
      <p className="mt-3 text-sm text-slate-400 leading-relaxed">{card.desc}</p>

      <div className="mt-6 space-y-2">
        {card.links.map((l, i) => (
          <div key={i} className="group/link">
            <p className="rounded-lg border border-slate-700/60 bg-slate-900/30 px-3 py-2 text-xs text-slate-400 overflow-hidden overflow-x-auto scrollbar-hide font-mono group-hover/link:border-teal-500/30 group-hover/link:text-slate-300 transition-all">
              {l.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-6 flex items-center gap-2 flex-wrap">
        {card.actions.map((a, i) => (
          a.url ? (
            <Link
              key={i}
              href={a.url}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 px-3 py-2 text-xs font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/30 hover:-translate-y-0.5"
            >
              {a.label}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <path d="M7 7h10v10M7 17l10-10" />
              </svg>
            </Link>
          ) : null
        ))}
      </div>
    </article>
  );
}
