"use client";

import { useSearchParams } from "next/navigation";
import MusicPlayerWidget from "@/components/widgets/MusicPlayerWidget";
import MusicPlayerBuilder from "./Builder";

export default function MusicPlayerClient() {
  const searchParams = useSearchParams();
  const embed = searchParams.get("embed") === "1";

  if (embed) {
    return (
      <main className="flex w-full min-h-screen items-center justify-center bg-transparent">
        <MusicPlayerWidget />
      </main>
    );
  }

  return <MusicPlayerBuilder />;
}
