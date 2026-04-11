export const runtime = "nodejs";

export async function GET(request: Request) {
  const userAgent = request.headers.get("user-agent") ?? "";
  const isVercelCron = userAgent.includes("vercel-cron/1.0");

  if (process.env.NODE_ENV === "production" && !isVercelCron) {
    return new Response("Unauthorized", { status: 401 });
  }

  const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!deployHookUrl) {
    return new Response("Missing VERCEL_DEPLOY_HOOK_URL", { status: 500 });
  }

  const hookResponse = await fetch(deployHookUrl, { method: "POST" });
  if (!hookResponse.ok) {
    return new Response("Deploy hook failed", { status: 502 });
  }

  return Response.json({ ok: true });
}
