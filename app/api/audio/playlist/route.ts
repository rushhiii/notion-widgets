import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

type PlaylistTrack = {
  src: string;
  title?: string;
  artist?: string;
  cover?: string;
  category?: string;
  type?: string;
};

const PUBLIC_ALLOWED_TYPES_BY_CATEGORY: Record<string, string[]> = {
  eng: ["normal", "slowed"],
  hindi: ["normal", "slowed"],
  otherz: ["normal"],
  punjab: ["normal"],
  nightcore: ["normal"],
  "🎻": ["normal"],
  "🔱": ["normal", "modern"],
};

const CATEGORY_ALIASES: Record<string, string> = {
  punjabi: "punjab",
  others: "otherz",
  instrumental: "🎻",
  spritual: "🔱",
};

const TYPE_ALIASES: Record<string, string> = {
  speedup: "speed up",
  "sped up": "speed up",
  spedup: "speed up",
  "speed-up": "speed up",
  "speed_up": "speed up",
  morden: "modern",
};

function decodeMaybeUriComponent(value: string): string {
  try {
    return /%[0-9a-f]{2}/i.test(value) ? decodeURIComponent(value) : value;
  } catch {
    return value;
  }
}

function normalizeCategory(value: string | null | undefined): string {
  if (!value) return "";
  const token = decodeMaybeUriComponent(value).trim().toLowerCase().replace(/\s+/g, " ");
  if (!token) return "";
  return CATEGORY_ALIASES[token] ?? token;
}

function normalizeType(value: string | null | undefined): string {
  if (!value) return "";
  const token = decodeMaybeUriComponent(value)
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
  if (!token) return "";
  return TYPE_ALIASES[token] ?? token;
}

function canAccessTrackWithoutAdmin(category: string, type: string): boolean {
  if (!category) return false;
  const allowedTypes = PUBLIC_ALLOWED_TYPES_BY_CATEGORY[category] ?? [];
  if (!allowedTypes.length) return false;
  const normalizedType = type || "normal";
  return allowedTypes.includes(normalizedType);
}

function normalizeTrack(input: unknown): PlaylistTrack | null {
  if (!input || typeof input !== "object") return null;
  const row = input as Record<string, unknown>;
  const src = typeof row.src === "string" ? row.src.trim() : "";
  if (!src) return null;

  const title = typeof row.title === "string" && row.title.trim() ? row.title.trim() : undefined;
  const artist = typeof row.artist === "string" && row.artist.trim() ? row.artist.trim() : undefined;
  const cover = typeof row.cover === "string" && row.cover.trim() ? row.cover.trim() : undefined;
  const category = normalizeCategory(typeof row.category === "string" ? row.category : "") || undefined;
  const type = normalizeType(typeof row.type === "string" ? row.type : "") || undefined;

  return { src, title, artist, cover, category, type };
}

async function readPlaylistTracks(): Promise<PlaylistTrack[]> {
  const playlistPath = path.join(process.cwd(), "public/audio/playlist.json");
  const content = (await fs.readFile(playlistPath, "utf8")).replace(/^\uFEFF/, "");
  const payload = JSON.parse(content) as unknown;

  const rows = (Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && Array.isArray((payload as Record<string, unknown>).tracks)
      ? (payload as Record<string, unknown>).tracks
      : []) as unknown[];

  return rows.map(normalizeTrack).filter((track): track is PlaylistTrack => Boolean(track));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const requestedCategory = normalizeCategory(searchParams.get("category"));
  const requestedType = normalizeType(searchParams.get("type"));

  const suppliedAdminKey =
    (searchParams.get("admin-key") || searchParams.get("admin_key") || searchParams.get("adminkey") || "").trim();
  const configuredAdminKey =
    (
      process.env.AUDIO_PLAYER_ADMIN_KEY ||
      process.env.NEXT_PUBLIC_AUDIO_ADMIN_KEY ||
      process.env.ADMIN_KEY ||
      process.env.NEXT_PUBLIC_QUOTES_ADMIN_KEY ||
      ""
    ).trim();
  const hasAdminAccess = Boolean(configuredAdminKey) && suppliedAdminKey === configuredAdminKey;

  try {
    const tracks = await readPlaylistTracks();

    const visibleTracks = hasAdminAccess
      ? tracks
      : tracks.filter((track) => canAccessTrackWithoutAdmin(track.category ?? "", track.type ?? ""));

    const filteredTracks = visibleTracks.filter((track) => {
      if (requestedCategory && (track.category ?? "") !== requestedCategory) return false;
      if (requestedType && (track.type ?? "") !== requestedType) return false;
      return true;
    });

    return NextResponse.json(
      {
        tracks: filteredTracks,
        total: filteredTracks.length,
        access: hasAdminAccess ? "admin" : "public",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=120",
        },
      },
    );
  } catch (error) {
    console.error("Audio playlist route error:", error);
    return NextResponse.json({ error: "Failed to load internal playlist datasource" }, { status: 500 });
  }
}
