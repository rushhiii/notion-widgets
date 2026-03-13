import WeatherWidget from "@/components/widgets/WeatherWidget";

export const dynamic = "force-static";

export default function WeatherPage() {
  return (
    // <main className="flex min-h-screen items-center justify-center bg-transparent">
    <main className="flex w-full min-h-screen items-center justify-center bg-transparent">
      <WeatherWidget />
    </main>
  );
}
