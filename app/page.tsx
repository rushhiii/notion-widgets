import Link from "next/link";

export const dynamic = "force-static";

export default function HomePage() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-zinc-950 px-6 py-10 text-zinc-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.2),transparent_55%)]" />

      <div className="relative mx-auto flex h-full w-full max-w-6xl flex-col">
        <header className="mb-10">
          <p className="inline-flex rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1 text-xs font-medium tracking-wide text-zinc-300">
            Notion Widget Suite
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Beautiful, embeddable widgets for Notion
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-zinc-400 md:text-base">
            Use the links below to open widgets directly, customize through URL params, and paste them into Notion via
            /embed.
          </p>
        </header>

        <section className="grid flex-1 grid-cols-1 gap-5 md:grid-cols-2">
          <article className="flex flex-col rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur">
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
                className="inline-flex items-center rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-400"
              >
                Open Clock
              </Link>
            </div>
          </article>

          <article className="flex flex-col rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur">
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
                className="inline-flex items-center rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-400"
              >
                Open Quotes
              </Link>
            </div>
          </article>

        </section>

        <footer className="mt-6 text-xs text-zinc-500">
          Tip: In Notion, type /embed and paste any widget URL.
        </footer>
      </div>
    </main>
  );
}
