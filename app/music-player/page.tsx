import { Suspense } from "react";
import type { Metadata } from "next";
import MusicPlayerClient from "./MusicPlayerClient";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Music Player Widget",
  description: "Embeddable music player powered by APlayer and MetingJS for Netease and Tencent.",
  icons: {
    icon: "/icons/quotes.png",
  },
};

export default function MusicPlayerPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-zinc-950" aria-busy="true" />}>
      <MusicPlayerClient />
    </Suspense>
  );
}
