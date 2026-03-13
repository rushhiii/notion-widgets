import type { Metadata } from "next";
import WeatherWidget from "@/components/widgets/WeatherWidget";

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
    // <main className="flex min-h-screen items-center justify-center bg-transparent">
    <main className="flex w-full min-h-screen items-center justify-center bg-transparent">
      <WeatherWidget />
    </main>
  );
}
