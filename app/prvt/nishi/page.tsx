"use client";
import { QuoteWidget } from "@/components/widgets/QuoteWidget";
import { useSession, signOut } from "next-auth/react";
import React, { useRef, useState } from "react";
import type { Session } from "next-auth";


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
                {typedSession?.user?.name ? `${typedSession.user.name}'s Dashboard` : "User Dashboard"}
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
                {showAccountModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-blue-950 border border-blue-800 rounded-2xl p-8 w-full max-w-md shadow-2xl relative">
                      <button
                        className="absolute top-2 right-5 text-blue-400 hover:text-white text-4xl"
                        onClick={() => setShowAccountModal(false)}
                        aria-label="Close"
                      >
                        &times;
                      </button>
                      <h2 className="text-2xl font-bold mb-6 text-blue-200 text-center tracking-tight">Account Settings</h2>
                      <NishiAccountSettingsForm session={typedSession} setShowAccountModal={setShowAccountModal} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          <h1
            className="hero-title mt-4 text-3xl font-semibold tracking-tight md:text-5xl"
            style={{ color: nishiBlue.accentLight, textShadow: `0 2px 8px ${nishiBlue.bgLight}` }}
          >
            {typedSession?.user?.name ? `${greeting} ${typedSession.user.name}, welcome to your private access` : 'Welcome to Your Private Widgets'}
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

type AccountFormProps = {
  session: SessionWithUser;
  setShowAccountModal: (open: boolean) => void;
};

function NishiAccountSettingsForm({ session, setShowAccountModal }: AccountFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const name = nameRef.current?.value.trim() || "";
    const usernameVal = usernameRef.current?.value.trim() || "";
    const password = passwordRef.current?.value || "";
    if (!session?.user?.id) {
      setError("Session missing user id. Please sign in again.");
      setLoading(false);
      return;
    }
    if (!usernameVal) {
      setError("Username is required.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: session.user.id, name, username: usernameVal, password }),
      });
      let data;
      try {
        data = await res.json();
      } catch {
        setError("Server error: Invalid JSON response");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError((data && data.error ? data.error : "Failed to update user") + (data && data.details ? ": " + data.details : ""));
      } else {
        setSuccess("Account updated! You will be logged out to apply changes.");
        if (setShowAccountModal) setShowAccountModal(false);
        setTimeout(() => {
          signOut({ callbackUrl: "/prvt/signout", redirect: false }).finally(() => {
            window.location.replace("/prvt/signout");
          });
        }, 1200);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError("Server error: " + msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-blue-300">Display Name</span>
        <input ref={nameRef} type="text" className="rounded-lg px-3 py-2 bg-blue-900 border border-blue-700 text-blue-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-700 outline-none transition" defaultValue={session?.user?.name || ""} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-blue-300">Username</span>
        <input
          ref={usernameRef}
          type="text"
          required
          className="rounded-lg px-3 py-2 bg-blue-900 border border-blue-700 text-blue-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-700 outline-none transition"
          defaultValue={session?.user?.username || ""}
          key={session?.user?.username || "username-field"}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-blue-300">Password</span>
        <input ref={passwordRef} type="password" className="rounded-lg px-3 py-2 bg-blue-900 border border-blue-700 text-blue-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-700 outline-none transition" placeholder="New password" autoComplete="new-password" />
      </label>
      {error && <div className="text-red-400 text-sm font-medium text-center mt-1">{error}</div>}
      {success && <div className="text-green-400 text-sm font-medium text-center mt-1">{success}</div>}
      <div className="flex gap-2 mt-4">
        <button type="submit" disabled={loading} className="flex-1 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-xl font-semibold transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? "Saving..." : "Save Changes"}
        </button>
        {/* <button
          type="button"
          onClick={() => {
            signOut({ callbackUrl: "/prvt/signout", redirect: false }).finally(() => {
              window.location.replace("/prvt/signout");
            });
          }}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-800 hover:bg-red-700 text-red-200 hover:text-white px-4 py-2 rounded-xl font-semibold transition shadow-md border border-red-700"
        >
          Logout
        </button> */}
       <button
          type="button"
          onClick={() => {
            signOut({ callbackUrl: "/prvt/signout", redirect: false }).finally(() => {
              window.location.replace("/prvt/signout");
            });
          }}
          className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-red-700 text-red-200 hover:text-white px-4 py-2 rounded-xl font-semibold transition shadow-md border border-red-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="size-5 fill-red-200 group-hover:fill-white">
            <path d="M569 337C578.4 327.6 578.4 312.4 569 303.1L425 159C418.1 152.1 407.8 150.1 398.8 153.8C389.8 157.5 384 166.3 384 176L384 256L272 256C245.5 256 224 277.5 224 304L224 336C224 362.5 245.5 384 272 384L384 384L384 464C384 473.7 389.8 482.5 398.8 486.2C407.8 489.9 418.1 487.9 425 481L569 337zM224 160C241.7 160 256 145.7 256 128C256 110.3 241.7 96 224 96L160 96C107 96 64 139 64 192L64 448C64 501 107 544 160 544L224 544C241.7 544 256 529.7 256 512C256 494.3 241.7 480 224 480L160 480C142.3 480 128 465.7 128 448L128 192C128 174.3 142.3 160 160 160L224 160z" />
          </svg>
          Logout
        </button>
      </div>
    </form>
  );
}
