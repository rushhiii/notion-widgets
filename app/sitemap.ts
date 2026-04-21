import type { MetadataRoute } from "next";
import { getSiteUrl, PUBLIC_SITE_ROUTES } from "@/lib/site";

const ROUTE_PRIORITY: Record<string, number> = {
  "/": 1,
  "/quotes": 0.9,
  "/clock": 0.8,
  "/timer": 0.8,
  "/stopwatch": 0.8,
  "/weather": 0.8,
  "/progress": 0.8,
  "/dday": 0.8,
  "/music-player": 0.8,
};

const ROUTE_FREQUENCY: Record<string, MetadataRoute.Sitemap[number]["changeFrequency"]> = {
  "/": "weekly",
  "/quotes": "daily",
  "/clock": "weekly",
  "/timer": "weekly",
  "/stopwatch": "weekly",
  "/weather": "daily",
  "/progress": "weekly",
  "/dday": "weekly",
  "/music-player": "weekly",
};

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();

  return PUBLIC_SITE_ROUTES.map((route) => {
    const url = route === "/" ? siteUrl : `${siteUrl}${route}`;

    return {
      url,
      lastModified,
      changeFrequency: ROUTE_FREQUENCY[route] ?? "weekly",
      priority: ROUTE_PRIORITY[route] ?? 0.7,
    };
  });
}