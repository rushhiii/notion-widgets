import { Suspense } from "react";
import type { Metadata } from "next";
import WeatherClient from "./WeatherClient";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Countdowns",
  description: "Embeddable Countdown/elapsed badges with days, weeks, months and much more",
  icons: {
    // icon: "/icons/accuweather_icon.png",
    icon: "/icons/weather_icon.png",
  },
};

export default function WeatherPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-zinc-950" aria-busy="true" />}> 
      <WeatherClient />
    </Suspense>
  );
}
