import Link from "next/link";

export const dynamic = "force-static";

export default function HomePage() {
  return (
    // <main className="landing relative h-screen w-full overflow-hidden bg-zinc-950 px-6 py-10 text-zinc-100 overflow-y-auto scrollbar-hide">
    // <main className="landing relative h-screen w-full overflow-hidden bg-zinc-950 px-6 py-10 text-zinc-100">
    <main className="landing relative h-screen w-full overflow-hidden bg-zinc-950 px-6 py-0 text-zinc-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.2),transparent_55%)]" />

      <div className="relative mx-auto flex h-full w-full px-0 py-10 max-w-6xl flex-col overflow-y-auto scrollbar-hide">
        {/* <div className="relative mx-auto flex h-full w-full max-w-6xl flex-col"> */}
        <header className="mb-7">
          <div className="flex justify-between items-center">
            <p className="badge inline-flex rounded-full border px-3 py-1 text-xs font-medium tracking-wide">
              Notion Widget Suite
            </p>
            {/* <Link
              href="https://github.com/rushhiii/notion-widgets"
              target="_blank"
              rel="noopener noreferrer"
              className="badge inline-flex rounded-full border px-3 py-1 text-xs font-medium tracking-wide"
            > Visit repo
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 21.13V25" />
              </svg>
            </Link> */}
            <a aria-label="GitHub repository" target="_blank" rel="noopener noreferrer" href="https://github.com/rushhiii/notion-widgets" className="rounded-full bg-[#22222dcc] opacity-70 transition duration-700 ease-in-out hover:opacity-100 inline-flex mx-3 my-1 text-xs font-medium tracking-wide">
              <svg viewBox="0 0 20 20" className="size-7 fill-[#E0DBFD]">
                <path d="M10 0C4.475 0 0 4.475 0 10a9.994 9.994 0 006.838 9.488c.5.087.687-.213.687-.476 0-.237-.013-1.024-.013-1.862-2.512.463-3.162-.612-3.362-1.175-.113-.287-.6-1.175-1.025-1.412-.35-.188-.85-.65-.013-.663.788-.013 1.35.725 1.538 1.025.9 1.512 2.337 1.087 2.912.825.088-.65.35-1.088.638-1.338-2.225-.25-4.55-1.112-4.55-4.937 0-1.088.387-1.987 1.025-2.688-.1-.25-.45-1.274.1-2.65 0 0 .837-.262 2.75 1.026a9.28 9.28 0 012.5-.338c.85 0 1.7.112 2.5.337 1.912-1.3 2.75-1.024 2.75-1.024.55 1.375.2 2.4.1 2.65.637.7 1.025 1.587 1.025 2.687 0 3.838-2.337 4.688-4.562 4.938.362.312.675.912.675 1.85 0 1.337-.013 2.412-.013 2.75 0 .262.188.574.688.474A10.016 10.016 0 0020 10c0-5.525-4.475-10-10-10z">
                </path>
              </svg>
            </a>
          </div>
          <h1 className="hero-title mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
            Beautiful, embeddable widgets for Notion
          </h1>
          <p className="lead mt-3 max-w-3xl text-sm md:text-base">
            Use the links below to open widgets directly, customize through URL params, and paste them into Notion via
            /embed.
          </p>
        </header>

        <section className="grid flex-1 grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <article className="landing-card flex flex-col rounded-3xl border p-6 backdrop-blur">
            <h2 className="text-2xl font-semibold text-white">Clock Widget</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Live clock with timezone, 12/24-hour format, seconds toggle, and dark-first theme.
            </p>

            <div className="mt-5 space-y-2 text-sm">
              <p className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-zinc-300">/clock</p>
              <p className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-zinc-300 overflow-hidden overflow-x-auto scrollbar-hide">
                /clock?tz=America/Toronto&format=24&theme=dark
              </p>
            </div>

            <div className="mt-auto pt-6 flex items-center gap-3">
              {/* <Link
                href="/clock"
                className="cta inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium text-white transition"
              >
                Widget Builder
              </Link> */}
              <Link
                href="/clock"
                target="_blank"
                className="cta inline-flex flex items-center rounded-xl px-4 py-2 text-sm font-medium text-white transition"
              >
                {/* Open Clock Builder */}
                <span className="pb-[2px]">Open Clock</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 ml-1 lucide lucide-square-arrow-up-right-icon lucide-square-arrow-up-right"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M8 8h8v8" /><path d="m8 16 8-8" /></svg>
              </Link>
            </div>
          </article>

          <article className="landing-card flex flex-col rounded-3xl border p-6 backdrop-blur">
            <h2 className="text-2xl font-semibold text-white">Quotes Widget</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Rotating quotes from local data or synced Notion source, with category and timing controls.
            </p>

            <div className="mt-5 space-y-2 text-sm">
              <p className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-zinc-300">/quotes</p>
              <p className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-zinc-300 overflow-hidden overflow-x-auto scrollbar-hide">
                /quotes?source=notion&theme=dark&rotate=true&interval=8
              </p>
            </div>

            <div className="mt-auto pt-6 flex items-center gap-3">
              <Link
                href="/quotes"
                target="_blank"
                className="cta inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium text-white transition"
              >
                {/* Open Quotes */}
                Open Builder
              </Link>
              <Link
                href="/quotes/?embed=1"
                target="_blank"
                className="cta inline-flex flex items-center rounded-xl px-4 py-2 text-sm font-medium text-white transition"
              >
                {/* Open Quotes */}
                <span className="pb-[2px]">View</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 ml-1 lucide lucide-square-arrow-up-right-icon lucide-square-arrow-up-right"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M8 8h8v8" /><path d="m8 16 8-8" /></svg>
              </Link>
            </div>
          </article>

          <article className="landing-card flex flex-col rounded-3xl border p-6 backdrop-blur">
            <h2 className="text-2xl font-semibold text-white">D-Day Widget</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Countdown/elapsed badges with days, weeks, months, years, hours, minutes, seconds, and mega-seconds.
            </p>

            <div className="mt-5 space-y-2 text-sm">
              <p className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-zinc-300">/dday</p>
              <p className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-zinc-300 overflow-hidden overflow-x-auto scrollbar-hide">
                /dday?date=2026-12-31&day=1&hours=1&minutes=1&seconds=1&timeColor=0d9488&totalseconds=1&megaseconds=1&units=1&weeks=1&months=1&years=1
              </p>
            </div>

            <div className="mt-auto pt-6 flex items-center gap-3">
              <Link
                href="/dday"
                target="_blank"
                className="cta inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium text-white transition"
              >
                {/* Open Quotes */}
                Open Builder
              </Link>
              <Link
                href="/dday/?embed=1"
                target="_blank"
                className="cta inline-flex flex items-center rounded-xl px-4 py-2 text-sm font-medium text-white transition"
              >
                {/* Open Quotes */}
                <span className="pb-[2px]">View</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 ml-1 lucide lucide-square-arrow-up-right-icon lucide-square-arrow-up-right"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M8 8h8v8" /><path d="m8 16 8-8" /></svg>
              </Link>
            </div>
          </article>

          <article className="landing-card flex flex-col rounded-3xl border p-6 backdrop-blur">
            <h2 className="text-2xl font-semibold text-white">Weather Widget</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Current conditions from OpenWeather with city or lat/lon, metric or imperial units, optional details.
            </p>

            <div className="mt-5 space-y-2 text-sm">
              <p className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-zinc-300">/weather</p>
              <p className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-zinc-300 overflow-hidden overflow-x-auto scrollbar-hide">
                /weather?location=Toronto&units=metric&bg=eaf1ec&accent=10b981
              </p>
            </div>


            <div className="mt-auto pt-6 flex items-center gap-3">
              <Link
                href="/weather"
                target="_blank"
                className="cta inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium text-white transition"
              >
                {/* Open Weather */}
                Open Builder
              </Link>
              <Link
                href="/weather/?embed=1"
                target="_blank"
                className="cta inline-flex flex items-center rounded-xl px-4 py-2 text-sm font-medium text-white transition"
              >
                {/* Open Quotes */}
                <span className="pb-[2px]">View</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 ml-1 lucide lucide-square-arrow-up-right-icon lucide-square-arrow-up-right"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M8 8h8v8" /><path d="m8 16 8-8" /></svg>
              </Link>
            </div>
          </article>

          <article className="landing-card flex flex-col rounded-3xl border p-6 backdrop-blur">
            <h2 className="text-2xl font-semibold text-white">Progress Widget</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Customizable progress bar with milestones, prefixes/suffixes, and a built-in embed link copier.
            </p>

            <div className="mt-5 space-y-2 text-sm">
              <p className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-zinc-300">/progress</p>
              <p className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-zinc-300 overflow-hidden overflow-x-auto scrollbar-hide">
                /progress?goal=23300&progress=5000&prefix=%2A&ms=+1:8200&ms=+bundle:15000&ms=+3:20000&embed=1
              </p>
            </div>


            <div className="mt-auto pt-6 flex items-center gap-3">
              <Link
                href="/progress"
                target="_blank"
                className="cta inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium text-white transition"
              >
                {/* Open Progress */}
                Open Builder
              </Link>
              <Link
                href="/progress/?embed=1"
                target="_blank"
                className="cta inline-flex flex items-center rounded-xl px-4 py-2 text-sm font-medium text-white transition"
              >
                {/* Open Quotes */}
                <span className="pb-[2px]">View</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 ml-1 lucide lucide-square-arrow-up-right-icon lucide-square-arrow-up-right"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M8 8h8v8" /><path d="m8 16 8-8" /></svg>
              </Link>
            </div>
          </article>
        </section>

        <footer className="mt-6 text-xs text-zinc-500 space-y-1">
          <p>Tip: In Notion, type /embed and paste any widget URL.</p>
          {/* <p>
            Inspiration: <a className="underline hover:text-zinc-300" href="https://www.omgubuntu.co.uk/2016/11/gluqlo-flipqlo-screensaver-ubuntu">Gluqlo flip clock screensaver</a>
          </p> */}
        </footer>
        {/* <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent backdrop-blur-sm" aria-hidden /> */}
      </div>
      {/* <div className="pointer-events-none fixed bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-zinc-900/65 px-3 py-1 text-zinc-200 shadow-lg ring-1 ring-white/5 scroll-cue">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v5" />
          <path d="m15 12-3 3-3-3" />
        </svg>
        <span className="text-xs font-medium">Scroll for more</span>
      </div> */}
      {/* <div className="pointer-events-none absolute inset-x-0 bottom-0 h-11 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent backdrop-blur-sm" aria-hidden /> */}

    </main>
  );
}
