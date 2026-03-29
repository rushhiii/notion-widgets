"use client";
import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

// --- SignOutModal: visually matches login card ---
function SignOutModal({ onClose }: { onClose: () => void }) {
  const [mousePos, setMousePos] = useState({ x: 120, y: 60 });
  const cardRef = useRef<HTMLDivElement>(null);
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
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
    // <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
    <div className="fixed inset-0  flex items-center justify-center bg-black/90">

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
            onClick={() => { signOut({ callbackUrl: "/prvt/signout", redirect: false }).finally(() => { window.location.replace("/prvt/signout"); }); }}
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

export default function SignOutPage() {
  const router = useRouter();
  // Show modal immediately, close returns to dashboard
  return <SignOutModal onClose={() => router.push("/prvt/")} />;
}
