import { Suspense } from "react";
import type { Metadata } from "next";
import AudioPlayerClient from "./AudioPlayerClient";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Audio Player Widget",
  description: "Custom MP3 audio player widget with small, medium, and large layouts for Notion embeds.",
  icons: {
    icon: "/icons/music_player_icon.png",
  },
};

export default function AudioPlayerPage() {
  return (
    <Suspense fallback={<main className="w-full min-h-screen flex items-center justify-center bg-[#202020]" aria-busy="true" />}>
      <AudioPlayerClient />
    </Suspense>
  );
}
