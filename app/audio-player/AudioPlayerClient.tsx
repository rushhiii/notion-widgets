"use client";

import { useSearchParams } from "next/navigation";
import AudioPlayerWidget from "@/components/widgets/AudioPlayerWidget";
import AudioPlayerBuilder from "./Builder";

export default function AudioPlayerClient() {
  const searchParams = useSearchParams();
  const embed = searchParams.get("embed") === "1";

  if (embed) {
    return (
      <main className="w-full min-h-screen flex items-center justify-center bg-[#191919]">
        <AudioPlayerWidget />
      </main>
    );
  }

  return <AudioPlayerBuilder />;
}
