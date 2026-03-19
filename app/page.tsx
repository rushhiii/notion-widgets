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
        <header className="mb-10">
          <p className="badge inline-flex rounded-full border px-3 py-1 text-xs font-medium tracking-wide">
            Notion Widget Suite
          </p>
          <h1 className="hero-title mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
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

            <div className="mt-auto pt-6">
              <Link
                href="/clock"
                className="cta inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium text-white transition"
              >
                Open Clock
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

            <div className="mt-auto pt-6">
              <Link
                href="/quotes"
                className="cta inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium text-white transition"
              >
                Open Quotes
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

            <div className="mt-auto pt-6">
              <Link
                href="/dday"
                className="cta inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium text-white transition"
              >
                Open D-Day
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

            <div className="mt-auto pt-6">
              <Link
                href="/weather"
                className="cta inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium text-white transition"
              >
                Open Weather
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

            <div className="mt-auto pt-6">
              <Link
                href="/progress"
                className="cta inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium text-white transition"
              >
                Open Progress
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
