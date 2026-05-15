import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const playlistUrl = searchParams.get("url");

  if (!playlistUrl) {
    return NextResponse.json({ error: "Missing playlist URL parameter" }, { status: 400 });
  }

  try {
    const decodedUrl = decodeURIComponent(playlistUrl);
    const urlObj = new URL(decodedUrl);

    if (!["https:", "http:"].includes(urlObj.protocol)) {
      return NextResponse.json({ error: "Invalid URL protocol" }, { status: 400 });
    }

    const response = await fetch(decodedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch playlist: ${response.statusText}` }, { status: response.status });
    }

    const payload = await response.json();

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    console.error("Playlist proxy error:", error);
    return NextResponse.json({ error: "Failed to proxy playlist" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}