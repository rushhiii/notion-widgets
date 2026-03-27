"use client";

import React, { useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import AccountSettingsForm from "./AccountSettingsForm";




export default function Page() {
  return <AccountSettingsForm />;
}


export default function PrvtPage() {
  const { data: session, status } = useSession();
  // Account modal state must be defined at the top
  const [showAccountModal, setShowAccountModal] = useState(false);

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
            {/* <div className="flex items-center gap-3"> */}
            <p className="badge inline-flex rounded-full border px-3 py-1 text-xs font-medium bg-white/40 tracking-wide">
              {"Admin's Dashboard"}
            </p>
              {/* <button
                className="text-xs font-medium px-2 py-1 rounded-lg border border-violet-700 bg-violet-900/60 text-violet-100 hover:bg-violet-800/80 transition"
                onClick={() => setShowAccountModal(true)}
                aria-label="Account settings"
              >
                Account
              </button> */}
            {/* </div> */}
            <div className="relative group rounded-full">
              {/* <button
                onClick={() => signOut({ callbackUrl: "/prvt/signout" })}
                className="rounded-full bg-[#22222D00] opacity-70 transition duration-700 ease-in-out hover:opacity-100 inline-flex mx-0 my-0 text-xs font-medium tracking-wide text-white"
                aria-label="Logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="size-7 fill-[#E0DBFD]">
                  <path d="M569 337C578.4 327.6 578.4 312.4 569 303.1L425 159C418.1 152.1 407.8 150.1 398.8 153.8C389.8 157.5 384 166.3 384 176L384 256L272 256C245.5 256 224 277.5 224 304L224 336C224 362.5 245.5 384 272 384L384 384L384 464C384 473.7 389.8 482.5 398.8 486.2C407.8 489.9 418.1 487.9 425 481L569 337zM224 160C241.7 160 256 145.7 256 128C256 110.3 241.7 96 224 96L160 96C107 96 64 139 64 192L64 448C64 501 107 544 160 544L224 544C241.7 544 256 529.7 256 512C256 494.3 241.7 480 224 480L160 480C142.3 480 128 465.7 128 448L128 192C128 174.3 142.3 160 160 160L224 160z" />
                </svg>
              </button>
              <div className="pointer-events-none absolute -right-0 top-0 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 bg-zinc-900 text-white text-xs px-4 py-1 rounded-lg shadow-lg border border-zinc-700 select-none min-w-max max-w-xs whitespace-nowrap">
                Logout
              </div> */}

              <div className="relative flex items-center rounded-full">
                <button
                  onClick={() => setShowAccountModal(true)}
                  className="rounded-full bg-[#22222D00] opacity-70 transition duration-700 ease-in-out hover:opacity-100 inline-flex mx-0 my-auto text-xs font-medium tracking-wide text-white"
                  aria-label="Account Settings"
                  onMouseEnter={e => e.currentTarget.nextElementSibling?.classList.add('opacity-100','pointer-events-auto')}
                  onMouseLeave={e => e.currentTarget.nextElementSibling?.classList.remove('opacity-100','pointer-events-auto')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="size-8 fill-[#E0DBFD]">
                    <path d="M463 448.2C440.9 409.8 399.4 384 352 384L288 384C240.6 384 199.1 409.8 177 448.2C212.2 487.4 263.2 512 320 512C376.8 512 427.8 487.3 463 448.2zM64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320zM320 336C359.8 336 392 303.8 392 264C392 224.2 359.8 192 320 192C280.2 192 248 224.2 248 264C248 303.8 280.2 336 320 336z"/>
                  </svg>
                </button>
                <div className="pointer-events-none absolute right-9 top-1 opacity-0 transition-all duration-200 border border-violet-700 bg-violet-900/60 text-violet-100 text-white text-xs px-4 py-1 rounded-lg shadow-lg border border-zinc-700 select-none min-w-max max-w-xs whitespace-nowrap">
                  Account Settings
                </div>
              </div>

            </div>
          </div>
                {/* Account Modal */}
                {showAccountModal && session?.user && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 w-full max-w-md shadow-2xl relative">
                      <button
                        className="absolute top-2 right-5 text-zinc-400 hover:text-white text-4xl"
                        onClick={() => setShowAccountModal(false)}
                        aria-label="Close"
                      >
                        &times;
                      </button>
                      <h2 className="text-2xl font-bold mb-6 text-violet-200 text-center tracking-tight">Account Settings</h2>
                      <AccountSettingsForm session={session} setShowAccountModal={setShowAccountModal} />
                    </div>
                  </div>
                )}
                {/* End Account Modal */}

          <h1 className="hero-title mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
            {session?.user?.name ? `Greetings ${session.user.name}, welcome to your private access` : 'Welcome to Your Private Widgets'}
          </h1>
          <p className="lead mt-3 max-w-3xl text-sm md:text-base">
            This is your private dashboard. Only authenticated users can see this page. Add your private widgets and content here.
          </p>
        </header>
        {/* Admin-only dashboard: show all widgets if admin, else show nothing */}
          <section className="flex flex-col gap-8 mt-6">
            {/* <DdayWidget />
            <ClockWidget />
            <QuoteWidget /> */}
          </section>
  
      </div>
    </main>
  );
}

// --- SignOutModal: visually matches login card ---

function SignOutModal({ onClose }) {
  const [mousePos, setMousePos] = useState({ x: 120, y: 60 });
  const cardRef = useRef(null);
  function handleMouseMove(e) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }
  const cardBg = {
    background:
      `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.04) 0%, transparent 30%),` +
      `rgba(17,17,23,.92)`
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.18),transparent_60%)] pointer-events-none z-0" />
      <div
        ref={cardRef}
        className="relative z-10 flex flex-col w-full max-w-md rounded-3xl border border-zinc-800 backdrop-blur p-8 shadow-xl transition-colors duration-300 bg-zinc-950"
        style={cardBg}
        onMouseMove={handleMouseMove}
      >
        <button
          className="absolute top-2 right-5 text-zinc-400 hover:text-white text-4xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6 text-violet-200 text-center tracking-tight">Sign Out</h2>
        <p className="text-zinc-300 text-center mb-6">Are you sure you want to sign out?</p>
        <div className="flex gap-3 mt-2">
          <button
            className="cta flex-1 inline-flex items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium px-4 py-2 transition shadow"
            onClick={() => { signOut({ callbackUrl: "/prvt/signout" }); }}
          >
            Sign Out
          </button>
          <button
            className="flex-1 inline-flex items-center justify-center rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium px-4 py-2 transition border border-zinc-700"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}