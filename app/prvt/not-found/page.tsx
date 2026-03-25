import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication Required | 404",
  icons: {
    icon: "/icons/ees.png",
  },
};

export default function NotFound() {
  return (
    <main className="landing relative h-screen w-full overflow-hidden bg-zinc-950 px-6 py-0 text-zinc-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.18),transparent_60%)]" />
      <div className="relative mx-auto flex h-full w-full px-0 py-10 max-w-2xl flex-col items-center justify-center">
        <div className="landing-card flex flex-col items-center rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 backdrop-blur shadow-xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">404 - Not Found</h1>
          <p className="text-lg md:text-xl text-zinc-400 mb-6 text-center max-w-md">Authentication required to access this page.<br/>You do not have permission or the page does not exist.</p>
          <a href="/" className="cta inline-flex items-center rounded-xl px-5 py-2.5 text-base font-medium text-white bg-violet-700 hover:bg-violet-800 transition shadow-md">
            Go to Home
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 ml-2 lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </main>
  );
}
