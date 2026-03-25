"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { WidgetContainer } from "@/components/ui/WidgetContainer";
import { parseBooleanParam, parseColorParam } from "@/lib/utils";
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
} from "lucide-react";

type WeatherResponse = {
  name?: string;
  country?: string;
  temp?: number;
  feels_like?: number;
  humidity?: number;
  wind_speed?: number;
  clouds?: number;
  description?: string;
  icon?: string;
  units?: "metric" | "imperial";
  error?: string;
};

type OpenWeatherApiResponse = {
  name?: string;
  sys?: { country?: string };
  main?: { temp?: number; feels_like?: number; humidity?: number };
  wind?: { speed?: number };
  clouds?: { all?: number };
  weather?: Array<{ description?: string; icon?: string }>;
  message?: string;
};

const THEME_PRESETS: Record<
  string,
  { bg: string; text: string; accent: string; border?: string }
> = {
  mint: { bg: "#eef5ef", text: "#0f172a", accent: "#27ae60" },
  sand: { bg: "#f5f0e6", text: "#3b2f2f", accent: "#c47c2c" },
  dusk: { bg: "#0f172a", text: "#e2e8f0", accent: "#7c3aed" },
  sky: { bg: "#e8f3fb", text: "#0b2345", accent: "#1d8fe1" },
};

type EmbedParams = Record<string, string | number | boolean | undefined>;

function formatTemp(value: number | undefined, units: "metric" | "imperial") {
  if (typeof value !== "number") return "--";
  const rounded = Math.round(value);
  return units === "imperial" ? `${rounded}°F` : `${rounded}°C`;
}

const ICON_MAP = {
  clear: Sun,
  few: CloudSun,
  clouds: Cloud,
  rain: CloudRain,
  storm: CloudLightning,
  snow: CloudSnow,
  fog: CloudFog,
};

function pickIcon(icon?: string) {
  if (!icon) return ICON_MAP.clouds;
  if (icon.startsWith("01")) return ICON_MAP.clear;
  if (icon.startsWith("02")) return ICON_MAP.few;
  if (icon.startsWith("03") || icon.startsWith("04")) return ICON_MAP.clouds;
  if (icon.startsWith("09") || icon.startsWith("10")) return ICON_MAP.rain;
  if (icon.startsWith("11")) return ICON_MAP.storm;
  if (icon.startsWith("13")) return ICON_MAP.snow;
  if (icon.startsWith("50")) return ICON_MAP.fog;
  return ICON_MAP.clouds;
}

export function WeatherWidget({ embedParams }: { embedParams?: EmbedParams }) {
  const [paramString, setParamString] = useState<string | null>(null);
  const [clientParams, setClientParams] = useState<URLSearchParams | null>(null);
  const originalBodyBg = useRef<string | null>(null);
  const originalHtmlBg = useRef<string | null>(null);

  useEffect(() => {
    if (embedParams) return;
    if (typeof window === "undefined") return;
    const search = window.location.search || "";
    setParamString(search);
    setClientParams(new URLSearchParams(search));
  }, [embedParams]);

  const getParam = (key: string) => {
    if (embedParams && key in embedParams) {
      const value = embedParams[key];
      return value === undefined ? null : String(value);
    }
    return clientParams?.get(key) ?? null;
  };

  const location = getParam("location") || getParam("q") || "Toronto";
  const latParam = getParam("lat");
  const lonParam = getParam("lon");
  const unitsParam = (getParam("units") || "metric").toLowerCase() === "imperial" ? "imperial" : "metric";
  const modeParam = (getParam("mode") || "minimal").toLowerCase();
  const showDetails = modeParam === "detail" ? true : parseBooleanParam(getParam("details"), modeParam !== "minimal");

  const themeParam = (getParam("theme") || "mint").toLowerCase();
  const preset = THEME_PRESETS[themeParam] ?? THEME_PRESETS.mint;
  const bgParam = parseColorParam(getParam("bg")) ?? parseColorParam(getParam("background")) ?? preset.bg;
  const textParam = parseColorParam(getParam("text")) ?? preset.text;
  const accentParam = parseColorParam(getParam("accent")) ?? preset.accent;
  const alignParam = (getParam("align") || "center").toLowerCase();
  const matchPageBg = parseBooleanParam(getParam("pagebg"), false);

  const [data, setData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: string; lon: string } | null>(null);

  useEffect(() => {
    if (latParam && lonParam) return; // user provided coords
    if (!window?.navigator?.geolocation) return;
    window.navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude.toString(), lon: pos.coords.longitude.toString() });
      },
      () => {
        // ignore errors, fall back to city
      },
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 5_000 }
    );
  }, [latParam, lonParam]);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set("units", unitsParam);
    if (latParam && lonParam) {
      params.set("lat", latParam);
      params.set("lon", lonParam);
    } else if (coords) {
      params.set("lat", coords.lat);
      params.set("lon", coords.lon);
    } else if (location) {
      params.set("q", location);
    }
    return params.toString();
  }, [latParam, lonParam, coords, location, unitsParam]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    if (!apiKey) {
      setError("Missing NEXT_PUBLIC_OPENWEATHER_API_KEY");
      setLoading(false);
      return;
    }

    const url = new URL("https://api.openweathermap.org/data/2.5/weather");
    const params = new URLSearchParams(query);
    params.set("appid", apiKey);
    url.search = params.toString();

    fetch(url.toString())
      .then(async (res) => {
        const json = (await res.json()) as OpenWeatherApiResponse;
        if (!res.ok) {
          const message = json?.message || "Failed to load weather";
          throw new Error(message);
        }
        setData({
          name: json?.name,
          country: json?.sys?.country,
          temp: json?.main?.temp,
          feels_like: json?.main?.feels_like,
          humidity: json?.main?.humidity,
          wind_speed: json?.wind?.speed,
          clouds: json?.clouds?.all,
          description: json?.weather?.[0]?.description,
          icon: json?.weather?.[0]?.icon,
          units: unitsParam,
        });
      })
      .catch((err) => setError(err.message || "Failed to load weather"))
      .finally(() => setLoading(false));
  }, [query, unitsParam]);

  const themeBg = bgParam ?? "#f1f5f4";
  const themeText = textParam ?? "#0f172a";
  const themeAccent = accentParam ?? "#10b981";

  // Ensure we only render after we have read client-side params to avoid stale static defaults on Vercel.
  const paramsReady = Boolean(embedParams) || clientParams !== null || paramString !== null;

  useEffect(() => {
    if (!paramsReady) return;

    if (matchPageBg) {
      if (originalBodyBg.current === null) originalBodyBg.current = document.body.style.backgroundColor;
      if (originalHtmlBg.current === null) originalHtmlBg.current = document.documentElement.style.backgroundColor;
      document.body.style.backgroundColor = themeBg;
      document.documentElement.style.backgroundColor = themeBg;
      return () => {
        if (originalBodyBg.current !== null) document.body.style.backgroundColor = originalBodyBg.current;
        if (originalHtmlBg.current !== null) document.documentElement.style.backgroundColor = originalHtmlBg.current;
      };
    }

    // If not matching page bg, restore any prior changes.
    if (originalBodyBg.current !== null) document.body.style.backgroundColor = originalBodyBg.current;
    if (originalHtmlBg.current !== null) document.documentElement.style.backgroundColor = originalHtmlBg.current;
  }, [paramsReady, matchPageBg, themeBg]);

  const alignItems = alignParam === "left" ? "flex-start" : alignParam === "right" ? "flex-end" : "center";
  const textAlign = alignParam === "left" ? "left" : alignParam === "right" ? "right" : "center";

  const displayLocation = latParam && lonParam
    ? `${latParam}, ${lonParam}`
    : coords
      ? `${coords.lat}, ${coords.lon}`
      : location;

  const placeLabel = data?.name
    ? `${data.name}${data.country ? `, ${data.country}` : ""}`
    : displayLocation;


  // Animation: fade/slide-in for weather card content
  const [showContent, setShowContent] = useState(false);
  useEffect(() => {
    setShowContent(true);
  }, []);

  if (!paramsReady) return null;

  return (
    <WidgetContainer
      theme="light"
      className="bg-transparent"
      contentClassName="w-full"
      heightClassName="min-h-[200px]"
    >
      <div
        className="flex w-full flex-col gap-4 p-6"
        style={{
          backgroundColor: themeBg,
          color: themeText,
          borderColor: themeAccent,
          alignItems,
          textAlign,
          opacity: showContent ? 1 : 0,
          transform: showContent ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.7s cubic-bezier(.4,0,.2,1), transform 0.7s cubic-bezier(.4,0,.2,1)',
        }}
      >
        {modeParam === "minimal" ? (
          <div className="flex w-full items-center justify-evenly gap-6 md:gap-10">
            <div className="flex text-lg font-semibold" style={{ color: themeAccent }}>
              {placeLabel}
            </div>
            <div className="flex items-center justify-center">
              {(() => {
                const Icon = pickIcon(data?.icon);
                return <Icon size={56} strokeWidth={2.1} color={themeAccent} />;
              })()}
            </div>
            <div className="flex flex-col items-end items-center">
              <div className="text-4xl font-semibold" style={{ color: themeAccent }}>
                {loading ? "--" : formatTemp(data?.temp, unitsParam)}
              </div>
              <div className="text-base capitalize" style={{ color: themeAccent }}>
                {loading ? "Loading..." : error ? error : data?.description || ""}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex w-full flex-wrap items-center justify-between gap-4" style={{ alignItems }}>
              <div className="text-base font-medium" style={{ color: themeAccent }}>
                {placeLabel}
              </div>
              <div className="text-3xl" style={{ color: themeAccent }}>
                {(() => {
                  const Icon = pickIcon(data?.icon);
                  return <Icon size={48} strokeWidth={2.2} />;
                })()}
              </div>
              <div className="text-4xl font-semibold" style={{ color: themeAccent }}>
                {loading ? "--" : formatTemp(data?.temp, unitsParam)}
              </div>
            </div>
            <div className="flex w-full flex-wrap items-center justify-between gap-2 text-sm" style={{ color: themeText }}>
              <div className="capitalize">{loading ? "Loading..." : error ? error : data?.description || ""}</div>
              <div>
                {loading ? "" : data?.name}
                {data?.country ? `, ${data.country}` : ""}
              </div>
            </div>
            {showDetails && (
              <div className="grid w-full grid-cols-2 gap-3 text-sm" style={{ color: themeText }}>
                <div>Feels like: {loading ? "--" : formatTemp(data?.feels_like, unitsParam)}</div>
                <div>Humidity: {loading ? "--" : `${data?.humidity ?? "--"}%`}</div>
                <div>Wind: {loading ? "--" : `${data?.wind_speed ?? "--"}${unitsParam === "imperial" ? " mph" : " m/s"}`}</div>
                <div>Clouds: {loading ? "--" : `${data?.clouds ?? "--"}%`}</div>
              </div>
            )}
          </>
        )}
      </div>
    </WidgetContainer>
  );
}

export default WeatherWidget;
