"use client";
import { QuoteWidget } from "@/components/widgets/QuoteWidget";
import DdayWidget from "@/components/widgets/DdayWidget";
import { signOut } from "next-auth/react";
import NishiCustomWidget from "./custom-widget";

export default function NishiPage() {
  return (
    <main className="landing min-h-screen w-full bg-blue-950 px-6 py-0 text-zinc-100 flex flex-col items-center justify-center">
      <div className="max-w-xl w-full mt-10">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Greetings Nishi!</h1>
          <p className="text-blue-200 mb-4">Welcome to your private dashboard. Here are your widgets:</p>
          <button
            onClick={() => signOut({ callbackUrl: "/prvt/login" })}
            className="rounded-full bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 font-semibold transition"
          >
            Logout
          </button>
        </header>
        <section className="flex flex-col gap-8 items-center">
          <DdayWidget />
          <QuoteWidget />
          <NishiCustomWidget />
        </section>
      </div>
    </main>
  );
}
