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

type WeatherPageProps = { searchParams?: Record<string, string | string[] | undefined> };

export default function WeatherPage() {
  return <WeatherClient />;
}
