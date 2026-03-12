import { NextResponse } from "next/server";

const API_KEY = process.env.OPENWEATHER_API_KEY;

function buildUrl(searchParams: URLSearchParams) {
  const q = searchParams.get("q") || searchParams.get("location");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const units = (searchParams.get("units") || "metric").toLowerCase();

  if (!q && !(lat && lon)) {
    throw new Error("Provide either q/location or lat and lon");
  }

  const params = new URLSearchParams();
  params.set("appid", API_KEY || "");
  params.set("units", units === "imperial" ? "imperial" : "metric");

  if (q) {
    params.set("q", q);
  } else {
    params.set("lat", lat as string);
    params.set("lon", lon as string);
  }

  return `https://api.openweathermap.org/data/2.5/weather?${params.toString()}`;
}

export async function GET(request: Request) {
  try {
    if (!API_KEY) {
      return NextResponse.json({ error: "Missing OPENWEATHER_API_KEY" }, { status: 500 });
    }

    const url = new URL(request.url);
    const targetUrl = buildUrl(url.searchParams);

    const res = await fetch(targetUrl, { next: { revalidate: 300 } });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      const message = payload?.message || "Failed to fetch weather";
      return NextResponse.json({ error: message }, { status: res.status });
    }

    const data = await res.json();

    return NextResponse.json({
      name: data?.name,
      country: data?.sys?.country,
      temp: data?.main?.temp,
      feels_like: data?.main?.feels_like,
      humidity: data?.main?.humidity,
      wind_speed: data?.wind?.speed,
      clouds: data?.clouds?.all,
      description: data?.weather?.[0]?.description,
      icon: data?.weather?.[0]?.icon,
      units: (url.searchParams.get("units") || "metric").toLowerCase() === "imperial" ? "imperial" : "metric",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unexpected error" }, { status: 400 });
  }
}
