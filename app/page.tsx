"use client";
import React, { useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import ModernNavbar from "../components/ui/ModernNavbar";
import ModernFooter from "../components/ui/ModernFooter";
import {
  Clock,
  TrendingUp,
  MessageCircle,
  Hourglass,
  Cloud,
  Music,
  ArrowUpRight,
} from "lucide-react";

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
      // `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(139,92,246,0.12) 0%, transparent 55%),` +
      `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(139,92,246,0.12) 0%, transparent 34%),` +
      `linear-gradient(160deg, rgba(11,10,18,0.94) 0%, rgba(16,12,26,0.96) 34%, rgba(10,8,18,0.98) 100%)`
  };

  return { cardRef, handleMouseMove, cardBg };
}

const iconMap: { [key: string]: React.ReactNode } = {
  Clock: <Clock className="w-6 h-6" />,
  TrendingUp: <TrendingUp className="w-6 h-6" />,
  MessageCircle: <MessageCircle className="w-6 h-6" />,
  Hourglass: <Hourglass className="w-6 h-6" />,
  Cloud: <Cloud className="w-6 h-6" />,
  Music: <Music className="w-6 h-6" />,
};

export default function HomePage() {
  const cards = [
    {
      title: "Clock Widget",
      desc: "Live clock with timezone, 12/24-hour format, seconds toggle, and dark-first theme.",
      icon: "Clock",
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
      icon: "TrendingUp",
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
      icon: "MessageCircle",
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
      icon: "Hourglass",
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
      icon: "Cloud",
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
      icon: "Music",
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
    //     background-color: rgb(9 9 11 / var(--tw-bg-opacity, 1));
    <main className="landing relative min-h-screen w-full overflow-x-hidden bg-[#09090b] text-white overflow-y-hidden">
      {/* <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.2),transparent_55%)]" /> */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#8B5CF633,transparent_20%)]" />
      <ModernNavbar />

      {/* 
    max-width: var(--maxw);
    margin: 0 auto;
    padding: clamp(48px, 10vw, 120px) var(--pad) clamp(40px, 6vw, 80px);
    position: relative;
}

*/}
      <div className="relative mx-auto flex w-full flex-col px-6 py-14 sm:py-24 lg:py-28 max-w-[1180px]">
        {/* <div className="relative mx-auto flex w-full flex-col px-6 py-48 max-w-[1180px]"> */}
        <motion.header
          className="mb-16 pt-7 sm:mb-20 lg:mb-24 sm:pt-8"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.4 }}
        >
          <div className="space-y-5 sm:space-y-8 max-w-6xl">
            <motion.div
              className="flex flex-wrap items-center gap-3 text-[0.06rem] sm:text-[0.65rem] uppercase"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              viewport={{ once: true, amount: 0.6 }}
            >
              <span className="accent-pill">Notion Widgets</span>
              <span className="tag tag--muted">
                URL-first embeds
              </span>
            </motion.div>
            <motion.h1
              className="hero-title text-[clamp(2.2rem,5.2vw,5.6rem)] font-extrabold leading-[1.02] tracking-[-0.02em]"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
              viewport={{ once: true, amount: 0.6 }}
            >
              <span className="block text-white">The embeddable stack</span>
              <span className="block text-white">
                for <span className="hero-italic">Notion widgets.</span>
              </span>
            </motion.h1>
            <div className="space-y-5 max-w-2xl">
              <motion.p
                className="text-xs sm:text-sm text-[var(--acc-muted)] font-mono "
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.08 }}
                viewport={{ once: true, amount: 0.6 }}
              >
                <span className="text-[var(--acc)]">[thesis]</span> url params in, pixel-perfect embeds <span className="text-[var(--acc)]">out.</span>
              </motion.p>
              <motion.p
                className="hero-description"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.12 }}
                viewport={{ once: true, amount: 0.6 }}
              >
                Use the links below to open widgets directly, customize through URL params, and paste them into Notion with <span className="text-[var(--acc)] bg-white/5 text-xs sm:text-sm font-mono">/embed</span>.
              </motion.p>
            </div>

            <motion.div
              className="flex flex-col sm:flex-row flex-wrap gap-4 pt-2 sm:pt-4"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
              viewport={{ once: true, amount: 0.6 }}
            >
              <a
                href="#widgets"
                // className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3 border border-violet-300/60 text-violet-100 font-semibold rounded-lg hover:bg-violet-500/15 transition-all duration-300"
                className="btn-github-hero inline-flex items-center gap-2 px-6 py-3 font-semibold"
              >
                Explore Widgets
                <ArrowUpRight className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/rushhiii/notion-widgets"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary-hero inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3"
                // className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-slate-200 font-semibold rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                View on GitHub
              </a>
            </motion.div>
          </div>
        </motion.header>

        <motion.section
          id="widgets"
          className="grid grid-cols-1 gap-5 sm:gap-6 lg:gap-7 md:grid-cols-2 lg:grid-cols-3 mb-0"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.2 }}
        >
          {cards.map((card, index) => (
            <Card key={card.title} card={card} index={index} />
          ))}
        </motion.section>
      </div>

      <ModernFooter />
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
  index: number;
};

function Card({ card, index }: CardProps) {
  const { cardRef, handleMouseMove, cardBg } = useCardHover();
  const icon = card.icon ? iconMap[card.icon] : null;

  return (
    <motion.article
      ref={cardRef}
      className="landing-card group flex flex-col rounded-3xl p-6 transition-all duration-300 hover:border-violet-300/50"
      style={cardBg}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", delay: Math.min(index * 0.06, 0.3) }}
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="mb-4 flex items-center gap-3">
        {icon && (
          <div className="text-violet-200 transition-all duration-300 group-hover:text-violet-100">
            {icon}
          </div>
        )}
        <h2 className="card-title text-2xl font-bold text-white transition-colors group-hover:text-violet-100">{card.title}</h2>
      </div>
      <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{card.desc}</p>

      <div className="mt-6 space-y-2">
        {card.links.map((l, i) => (
          <div key={i} className="group/link">
            {/* <p className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-zinc-300 overflow-hidden overflow-x-auto scrollbar-hide"> */}
              {/* {l.label} */}
            
            {/* </p> */}
            
            <p className="overflow-hidden overflow-x-auto rounded-lg border border-white/10 bg-zinc-950/80 px-3 py-2 font-mono text-xs text-slate-300 transition-all scrollbar-hide">
              {l.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
        {card.actions.map((a, i) => (
          a.url ? (
            <Link
              key={i}
              href={a.url}
              target="_blank"
              className="cta inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-white transition"
            >
              {a.label}
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          ) : null
        ))}
      </div>
    </motion.article>
  );
}
