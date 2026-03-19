"use client";

import { useSearchParams } from "next/navigation";
import WeatherWidget from "@/components/widgets/WeatherWidget";
import WeatherBuilder from "./Builder";

export default function WeatherClient() {
  const searchParams = useSearchParams();
  const embed = searchParams.get("embed") === "1";

  if (embed) {
    return (
      <main className="flex w-full min-h-screen items-center justify-center bg-transparent">
        <WeatherWidget />
      </main>
    );
  }

  return <WeatherBuilder />;
}
