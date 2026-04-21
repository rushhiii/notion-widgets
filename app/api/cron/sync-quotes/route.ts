import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function authorizeRequest(request: NextRequest): { ok: boolean; source: string } {
  if (process.env.NODE_ENV !== "production") {
    return { ok: true, source: "development" };
  }

  const userAgent = request.headers.get("user-agent") ?? "";
  const isVercelCron = userAgent.includes("vercel-cron/1.0");

  const cronSecret = process.env.CRON_SECRET;
  const bearerToken = getBearerToken(request.headers.get("authorization"));
  const querySecret = request.nextUrl.searchParams.get("secret");
  const hasValidSecret = Boolean(cronSecret) && (bearerToken === cronSecret || querySecret === cronSecret);

  if (hasValidSecret) {
    return { ok: true, source: isVercelCron ? "vercel-cron" : "manual-secret" };
  }

  // Backward-compatible fallback for setups that have not added CRON_SECRET yet.
  if (!cronSecret && isVercelCron) {
    return { ok: true, source: "vercel-cron-user-agent" };
  }

  return { ok: false, source: "unauthorized" };
}

async function triggerQuotesSync(request: NextRequest) {
  const auth = authorizeRequest(request);
  if (!auth.ok) {
    console.warn("[cron/sync-quotes] Unauthorized request", {
      source: "unknown",
      userAgent: request.headers.get("user-agent") ?? "",
    });
    return new Response("Unauthorized", { status: 401 });
  }

  console.info("[cron/sync-quotes] Trigger accepted", {
    source: auth.source,
    timestamp: new Date().toISOString(),
  });

  const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!deployHookUrl) {
    console.error("[cron/sync-quotes] Missing VERCEL_DEPLOY_HOOK_URL");
    return new Response("Missing VERCEL_DEPLOY_HOOK_URL", { status: 500 });
  }

  const hookResponse = await fetch(deployHookUrl, { method: "POST" });
  if (!hookResponse.ok) {
    const details = await hookResponse.text().catch(() => "");
    return new Response(`Deploy hook failed (${hookResponse.status})${details ? `: ${details.slice(0, 200)}` : ""}`, {
      status: 502,
    });
  }

  console.info("[cron/sync-quotes] Deploy hook queued successfully", {
    source: auth.source,
    timestamp: new Date().toISOString(),
  });

  return Response.json({
    ok: true,
    triggeredBy: auth.source,
    message: "Deploy queued. Quotes will sync during the next production build.",
  });
}

export async function GET(request: NextRequest) {
  return triggerQuotesSync(request);
}

export async function POST(request: NextRequest) {
  return triggerQuotesSync(request);
}
