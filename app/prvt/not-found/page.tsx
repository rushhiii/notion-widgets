import Link from "next/link";
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
        {/* <div className="landing-card flex flex-col items-center rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 backdrop-blur shadow-xl"> */}
        <div className=" flex flex-col items-center ">
          <div className="text-[7rem] md:text-[20rem] font-extrabold text-white/80 leading-none mb-2 select-none" style={{letterSpacing: '-0.005em'}}>404</div>
          <div className="text-base md:text-lg text-zinc-400 mb-6 text-center max-w-md">
            Authentication required.<br/>
            <span className="text-xs md:text-sm text-zinc-500">You do not have Admin&apos;s permission.</span>
          </div>
          <Link href="/" className=" inline-flex items-center rounded-xl px-5 py-2.5 text-base font-medium text-white/80 border-zinc-800 bg-zinc-950/80 hover:text-white transition shadow-md">
          {/* rounded-3xl border border-zinc-800 bg-zinc-950/80 p-10 backdrop-blur shadow-xl */}
            Back to Home
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 ml-2 lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>
      </div>
    </main>
  );
}
