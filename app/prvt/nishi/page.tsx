"use client";
import { QuoteWidget } from "@/components/widgets/QuoteWidget";
import { useSession, signOut } from "next-auth/react";
import React, { useRef, useState } from "react";
import type { Session } from "next-auth";
import AccountSettingsForm from "../AccountSettingsForm";


// Custom blue shade for Nishi's dashboard
const nishiBlue = {
  bg: "#1e3a8a", // deep blue
  bgLight: "#2563eb", // lighter blue
  accent: "#2563eb", // vibrant blue
  accentLight: "#93c5fd", // light blue
  text: "#dbeafe", // blue-50
};

type SessionWithUser = Session & {
  user: Session["user"] & { id: string; username?: string; role?: string };
};

export default function NishiPage() {
  const { data: session, status } = useSession();
  const typedSession = session as SessionWithUser | null;
  const displayName = ((typedSession?.user?.name || typedSession?.user?.username || "").trim()) || "User";
  const [showAccountModal, setShowAccountModal] = useState(false);
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

  if (status === "loading") {
    return <div className="flex items-center bg-blue-950 text-zinc-100 justify-center min-h-screen text-lg">Loading...</div>;
  }

  if (!typedSession) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-blue-950 text-zinc-100">
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="mb-6">You must be logged in to view this page.</p>
        <a href="/prvt/login" className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-xl font-semibold transition">Go to Login</a>
      </div>
    );
  }

  return (
    <main className="landing relative h-screen w-full overflow-hidden bg-blue-950 px-6 py-0 text-zinc-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.18),transparent_55%)]" />
      <div className="relative mx-auto flex h-full w-full px-0 py-10 max-w-6xl flex-col overflow-y-auto scrollbar-hide">
        <header className="mb-7">
                    {/* <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl md:text-3xl font-bold text-blue-200">👋 {greeting}{session?.user?.name ? `, ${session.user.name}` : ''}!</span>
                    </div> */}
            <div className="flex justify-between items-center">
              <p
                className="badge inline-flex rounded-full border px-3 py-1 text-xs font-medium tracking-wide"
                style={{ background: nishiBlue.bg, borderColor: nishiBlue.accent, color: nishiBlue.accentLight }}
              >
                {`${displayName}'s Dashboard`}
              </p>
              <div className="relative flex items-center rounded-full">
                <button
                  onClick={() => setShowAccountModal(true)}
                  className="rounded-full bg-[#22222D00] opacity-70 transition duration-700 ease-in-out hover:opacity-100 inline-flex mx-0 my-auto text-xs font-medium tracking-wide text-white"
                  aria-label="Account Settings"
                  onMouseEnter={e => e.currentTarget.nextElementSibling?.classList.add('opacity-100','pointer-events-auto')}
                  onMouseLeave={e => e.currentTarget.nextElementSibling?.classList.remove('opacity-100','pointer-events-auto')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="size-8 fill-blue-200">
                    <path d="M463 448.2C440.9 409.8 399.4 384 352 384L288 384C240.6 384 199.1 409.8 177 448.2C212.2 487.4 263.2 512 320 512C376.8 512 427.8 487.3 463 448.2zM64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320zM320 336C359.8 336 392 303.8 392 264C392 224.2 359.8 192 320 192C280.2 192 248 224.2 248 264C248 303.8 280.2 336 320 336z"/>
                  </svg>
                </button>
                {showAccountModal && typedSession?.user?.id && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
                    <div className="relative w-full max-w-md rounded-2xl border border-blue-700 bg-[#0f1f3a] shadow-2xl overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.18),transparent_55%)]" />
                      <div className="relative p-6">
                        <button
                          className="absolute top-2 right-4 text-blue-200 hover:text-white text-3xl"
                          onClick={() => setShowAccountModal(false)}
                          aria-label="Close"
                        >
                          &times;
                        </button>
                        <h2 className="text-xl font-bold mb-4 text-blue-100 text-center tracking-tight">Account Settings</h2>
                        <AccountSettingsForm session={typedSession as SessionWithUser} setShowAccountModal={setShowAccountModal} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          <h1
            className="hero-title mt-4 text-3xl font-semibold tracking-tight md:text-5xl"
            style={{ color: nishiBlue.accentLight, textShadow: `0 2px 8px ${nishiBlue.bgLight}` }}
          >
            {`${greeting} ${displayName}, welcome to your private access`}
          </h1>
          <p className="lead mt-3 max-w-3xl text-sm md:text-base text-blue-200">
            This is your private dashboard. Only authenticated users can see this page. Add your private widgets and content here.
          </p>
        </header>
        <section className="flex flex-col gap-8 mt-6">
          {/* <DdayWidget /> */}
          <QuoteWidget />
          {/* <NishiCustomWidget /> */}
        </section>
      </div>
    </main>
  );
}
