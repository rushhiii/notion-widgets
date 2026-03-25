

"use client";
import type { Metadata } from "next";




import React, { useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Private Page | Rn. Widgets",
  icons: {
    icon: "/icons/r_icon.png",
  },
};


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

export default function PrvtPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen text-lg">Loading...</div>;
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
            <button
              onClick={() => signOut({ callbackUrl: "/prvt/login" })}
              className="rounded-full bg-[#22222dcc] opacity-70 transition duration-700 ease-in-out hover:opacity-100 inline-flex mx-3 my-1 text-xs font-medium tracking-wide px-4 py-2 text-white"
            >
              Logout
            </button>
          </div>
          <h1 className="hero-title mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
            Welcome to Your Private Widgets
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
  )
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
}