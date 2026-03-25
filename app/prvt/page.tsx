




"use client";

import React, { useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import DdayWidget from "@/components/widgets/DdayWidget";
// Card hover effect hook (copied from HomePage)
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

  const cardBg = {
    background:
      `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.04) 0%, transparent 30%),` +
      `rgba(17,17,23,.8)`
  };
  return { cardRef, handleMouseMove, cardBg };
}

function PrivateLandingCard() {
  const { cardRef, handleMouseMove, cardBg } = useCardHover();
  return (
    <article
      ref={cardRef}
      className="landing-card flex flex-col rounded-3xl border p-6 backdrop-blur"
      style={cardBg}
      onMouseMove={handleMouseMove}
    >
      <h2 className="text-2xl font-semibold text-white">Secret Widget</h2>
      <p className="mt-2 text-sm text-zinc-400">This widget is only visible to you.</p>
      <div className="mt-5 space-y-2 text-sm">
        <p className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-zinc-300">/prvt/secret</p>
      </div>
      <div className="mt-auto pt-6 flex items-center gap-3">
        <Link
          href="/prvt/secret"
          className="cta inline-flex flex items-center rounded-xl px-4 py-2 text-sm font-medium text-white transition"
        >
          Open Secret
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 ml-1 lucide lucide-square-arrow-up-right-icon lucide-square-arrow-up-right"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M8 8h8v8" /><path d="m8 16 8-8" /></svg>
        </Link>
      </div>
    </article>
  );
}

export default function PrvtPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="flex items-center bg-zinc-950 text-zinc-100 justify-center min-h-screen text-lg">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-100">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="mb-6">You must be logged in to view this page.</p>
        <Link href="/prvt/login" className="bg-violet-700 hover:bg-violet-800 text-white px-4 py-2 rounded-xl font-semibold transition">Go to Login</Link>
      </div>
    );
  }

  return (
    <main className="landing relative h-screen w-full overflow-hidden bg-zinc-950 px-6 py-0 text-zinc-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.2),transparent_55%)]" />
      <div className="relative mx-auto flex h-full w-full px-0 py-10 max-w-6xl flex-col overflow-y-auto scrollbar-hide">
        <header className="mb-7">
          <div className="flex justify-between items-center">
            <p className="badge inline-flex rounded-full border px-3 py-1 text-xs font-medium tracking-wide">
              Private Dashboard
            </p>
            <div className="relative group">
              <button
                onClick={() => signOut({ callbackUrl: "/prvt/login" })}
                className="rounded-full bg-[#22222D00] opacity-70 transition duration-700 ease-in-out hover:opacity-100 inline-flex mx-0 my-0 text-xs font-medium tracking-wide text-white"
                aria-label="Logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="size-7 fill-[#E0DBFD]">
                  <path d="M569 337C578.4 327.6 578.4 312.4 569 303.1L425 159C418.1 152.1 407.8 150.1 398.8 153.8C389.8 157.5 384 166.3 384 176L384 256L272 256C245.5 256 224 277.5 224 304L224 336C224 362.5 245.5 384 272 384L384 384L384 464C384 473.7 389.8 482.5 398.8 486.2C407.8 489.9 418.1 487.9 425 481L569 337zM224 160C241.7 160 256 145.7 256 128C256 110.3 241.7 96 224 96L160 96C107 96 64 139 64 192L64 448C64 501 107 544 160 544L224 544C241.7 544 256 529.7 256 512C256 494.3 241.7 480 224 480L160 480C142.3 480 128 465.7 128 448L128 192C128 174.3 142.3 160 160 160L224 160z" />
                </svg>
              </button>
              <div className="pointer-events-none absolute -right-0 top-0 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 bg-zinc-900 text-white text-xs px-4 py-1 rounded-lg shadow-lg border border-zinc-700 select-none min-w-max max-w-xs whitespace-nowrap">
                Logout
              </div>
            </div>
          </div>
          <h1 className="hero-title mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
            {session?.user?.name ? `Greetings ${session.user.name}, welcome to your private access` : 'Welcome to Your Private Widgets'}
          </h1>
          <p className="lead mt-3 max-w-3xl text-sm md:text-base">
            This is your private dashboard. Only authenticated users can see this page. Add your private widgets and content here.
          </p>
        </header>
        <section className="grid flex-1 grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {/* Example private widgets or links */}
          <PrivateLandingCard />
          {/* Add more private widgets or links here */}
        </section>
      </div>
    </main>
  );
}
    );
  }
}