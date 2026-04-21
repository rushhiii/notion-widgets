const DEFAULT_SITE_URL = "https://notion-widgets.vercel.app";

function normalizeSiteUrl(rawUrl: string): string {
  const withProtocol = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
  const url = new URL(withProtocol);

  url.pathname = "/";
  url.search = "";
  url.hash = "";

  return url.toString().replace(/\/$/, "");
}

export function getSiteUrl(): string {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    DEFAULT_SITE_URL;

  try {
    return normalizeSiteUrl(configuredUrl);
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const PUBLIC_SITE_ROUTES = [
  "/",
  "/clock",
  "/timer",
  "/stopwatch",
  "/quotes",
  "/dday",
  "/weather",
  "/progress",
  "/music-player",
] as const;