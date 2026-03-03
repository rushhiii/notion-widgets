export const dynamic = "force-static";

export default function HomePage() {
  return (
    <main className="flex h-screen w-full items-center justify-center bg-transparent px-6">
      <div className="w-full max-w-xl rounded-2xl border border-black/10 bg-white/70 p-6 text-center backdrop-blur-sm dark:border-white/10 dark:bg-zinc-900/60">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Notion Widgets</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Embed widgets via <span className="font-medium">/clock</span> and <span className="font-medium">/quotes</span>.
        </p>
      </div>
    </main>
  );
}
