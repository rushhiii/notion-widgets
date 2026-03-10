import Link from "next/link";

export const dynamic = "force-static";

export default function HomePage() {
  return (
    <main className="landing relative h-screen w-full overflow-hidden bg-zinc-950 px-6 py-10 text-zinc-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.2),transparent_55%)]" />

      <div className="relative mx-auto flex h-full w-full max-w-6xl flex-col">
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

        <section className="grid flex-1 grid-cols-1 gap-5 md:grid-cols-2">
          <article className="landing-card flex flex-col rounded-3xl border p-6 backdrop-blur">
            <h2 className="text-2xl font-semibold text-white">Clock Widget</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Live clock with timezone, 12/24-hour format, seconds toggle, and dark-first theme.
            </p>

            <div className="mt-5 space-y-2 text-sm">
              <p className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-zinc-300">/clock</p>
              <p className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-zinc-300">
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
              <p className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-zinc-300">
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

        </section>

        <footer className="mt-6 text-xs text-zinc-500 space-y-1">
          <p>Tip: In Notion, type /embed and paste any widget URL.</p>
          {/* <p>
            Inspiration: <a className="underline hover:text-zinc-300" href="https://www.omgubuntu.co.uk/2016/11/gluqlo-flipqlo-screensaver-ubuntu">Gluqlo flip clock screensaver</a>
          </p> */}
        </footer>
      </div>
    </main>
  );
}
