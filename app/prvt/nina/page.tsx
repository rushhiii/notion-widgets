"use client";
import React, { useState } from "react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";
import AccountSettingsForm from "../AccountSettingsForm";


// Custom red shade for Nina's dashboard
const ninaRed = {
  bg: "#7f1d1d", // deep maroon
  bgLight: "#991b1b", // lighter maroon
  accent: "#dc2626", // vibrant red
  accentLight: "#FEBCBC", // light red
  text: "#fff1f2", // rose-50
};

export default function NinaPage() {
  const { data: session } = useSession();
  type SessionWithUser = Session & { user: Session["user"] & { id?: string; username?: string; role?: string } };
  const typedSession = session as SessionWithUser | null;
  const displayName = ((typedSession?.user?.name || typedSession?.user?.username || "").trim()) || "User";
  const [showAccountModal, setShowAccountModal] = useState(false);
  // Dynamic greeting based on time, with live update
  const [greeting, setGreeting] = useState("");
  React.useEffect(() => {
    function getGreeting() {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) return "Good Morning";
      if (hour >= 12 && hour < 17) return "Good Afternoon";
      if (hour >= 17 && hour < 21) return "Good Evening";
      if (hour >= 21 || hour === 0) return "Good Night";
      if (hour >= 1 && hour < 5) return "Good Midnight";
      return "Greetings";
    }
    setGreeting(getGreeting());
    const interval = setInterval(() => setGreeting(getGreeting()), 60000);
    return () => clearInterval(interval);
  }, []);
  return (
    <main className="landing relative h-screen w-full overflow-hidden" style={{ background: ninaRed.bg }}>
      <div className="absolute inset-0" style={{ background: `radial-gradient(circle at top,${ninaRed.bgLight},transparent 55%)` }} />
      <div className="relative mx-auto flex h-full w-full px-0 py-10 max-w-6xl flex-col overflow-y-auto scrollbar-hide">
        <header className="mb-7">
          <div className="flex justify-between items-center ">
            <p className="badge inline-flex rounded-full border px-3 py-1 text-xs font-medium bg-white/40 tracking-wide" style={{ background: ninaRed.bg, borderColor: ninaRed.accent, color: ninaRed.accentLight }}>
              {`${displayName}\'s Dashboard`}
            </p>
            <div className="relative group">
              <button
                onClick={() => signOut({ callbackUrl: "/prvt/login" })}
                className="rounded-full transition duration-700 ease-in-out hover:opacity-100 inline-flex mx-0 my-0 text-xs font-medium tracking-wide text-white"
                aria-label="Logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="size-7" style={{ fill: ninaRed.accentLight }}>
                  <path d="M569 337C578.4 327.6 578.4 312.4 569 303.1L425 159C418.1 152.1 407.8 150.1 398.8 153.8C389.8 157.5 384 166.3 384 176L384 256L272 256C245.5 256 224 277.5 224 304L224 336C224 362.5 245.5 384 272 384L384 384L384 464C384 473.7 389.8 482.5 398.8 486.2C407.8 489.9 418.1 487.9 425 481L569 337zM224 160C241.7 160 256 145.7 256 128C256 110.3 241.7 96 224 96L160 96C107 96 64 139 64 192L64 448C64 501 107 544 160 544L224 544C241.7 544 256 529.7 256 512C256 494.3 241.7 480 224 480L160 480C142.3 480 128 465.7 128 448L128 192C128 174.3 142.3 160 160 160L224 160z" />
                </svg>
              </button>
              <div className="pointer-events-none absolute -right-0 top-0 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 bg-red-900 text-white text-xs px-4 py-1 rounded-lg shadow-lg border border-red-700 select-none min-w-max max-w-xs whitespace-nowrap">
                Logout
              </div>
            </div>
            <div className="relative group">
              <button
                onClick={() => setShowAccountModal(true)}
                className="rounded-full transition duration-300 ease-in-out bg-red-900/50 hover:bg-red-800/70 text-white text-xs font-semibold px-3 py-2 border border-red-700 shadow"
                aria-label="Account settings"
              >
                Account
              </button>
              <div className="pointer-events-none absolute -right-0 top-0 translate-y-8 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-red-900 text-white text-xs px-3 py-1 rounded-lg shadow border border-red-700 select-none whitespace-nowrap">
                Account Settings
              </div>
            </div>
          </div>
          <h1 className="hero-title mt-4 text-3xl font-semibold tracking-tight md:text-5xl" style={{ color: ninaRed.accentLight }}>
            {`${greeting} ${displayName}, welcome to your private access`}
          </h1>
          <p className="lead mt-3 max-w-3xl text-sm md:text-base" style={{ color: ninaRed.text }}>
            This is your private dashboard. Only you can see this page. Add your private widgets and content here.
          </p>
        </header>
        {showAccountModal && typedSession?.user?.id && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="relative w-full max-w-md rounded-2xl border border-red-700 bg-[#2a0f0f] shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.18),transparent_55%)]" />
              <div className="relative p-6">
                <button
                  className="absolute top-2 right-4 text-red-200 hover:text-white text-3xl"
                  onClick={() => setShowAccountModal(false)}
                  aria-label="Close"
                >
                  &times;
                </button>
                <h2 className="text-xl font-bold mb-4 text-red-100 text-center tracking-tight">Account Settings</h2>
                <AccountSettingsForm session={typedSession as any} setShowAccountModal={setShowAccountModal} />
              </div>
            </div>
          </div>
        )}
        <section className="flex flex-col gap-8 mt-6">
          {/* <DdayWidget />
          <ClockWidget />
          <QuoteWidget /> */}
          {/* <NinaCustomWidget /> */}
          {/* <PrivateLandingCard /> */}
        </section>
      </div>
    </main>
  );
}
