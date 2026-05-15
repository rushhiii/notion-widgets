import { NextResponse } from "next/server";

function readUint32BigEndian(bytes: Uint8Array, offset: number): number {
  return (
    ((bytes[offset] ?? 0) << 24) |
    ((bytes[offset + 1] ?? 0) << 16) |
    ((bytes[offset + 2] ?? 0) << 8) |
    (bytes[offset + 3] ?? 0)
  ) >>> 0;
}

function readSyncSafeInt(bytes: Uint8Array, offset: number): number {
  return (
    ((bytes[offset] ?? 0) << 21) |
    ((bytes[offset + 1] ?? 0) << 14) |
    ((bytes[offset + 2] ?? 0) << 7) |
    (bytes[offset + 3] ?? 0)
  ) >>> 0;
}

function readAscii(bytes: Uint8Array, start: number, end: number): string {
  return Array.from(bytes.slice(start, end), (byte) => String.fromCharCode(byte)).join("");
}

function findTerminator(bytes: Uint8Array, start: number, encoding: number): number {
  if (encoding === 1 || encoding === 2) {
    for (let index = start; index + 1 < bytes.length; index += 1) {
      if (bytes[index] === 0 && bytes[index + 1] === 0) return index;
    }
    return bytes.length;
  }

  for (let index = start; index < bytes.length; index += 1) {
    if (bytes[index] === 0) return index;
  }
  return bytes.length;
}

function pictureToArtwork(data: Uint8Array, mime: string): { mime: string; bytes: Uint8Array } | null {
  if (!data.length) return null;
  return { mime, bytes: data };
}

function extractArtworkFromMp3(buffer: ArrayBuffer): { mime: string; bytes: Uint8Array } | null {
  const bytes = new Uint8Array(buffer);

  if (bytes.length < 10 || readAscii(bytes, 0, 3) !== "ID3") {
    return null;
  }

  const majorVersion = bytes[3] ?? 0;
  const flags = bytes[5] ?? 0;
  const tagSize = readSyncSafeInt(bytes, 6);
  const tagEnd = Math.min(bytes.length, 10 + tagSize);

  let offset = 10;
  while (offset + 10 <= tagEnd) {
    const frameId = readAscii(bytes, offset, offset + 4);
    const frameSize = majorVersion >= 4 ? readSyncSafeInt(bytes, offset + 4) : readUint32BigEndian(bytes, offset + 4);

    if (!frameId.trim() || frameSize <= 0) {
      break;
    }

    const frameStart = offset + 10;
    const frameEnd = frameStart + frameSize;
    if (frameEnd > bytes.length) {
      break;
    }

    if (frameId === "APIC") {
      const encoding = bytes[frameStart] ?? 0;
      let position = frameStart + 1;

      const mimeEnd = findTerminator(bytes, position, 0);
      const mime = readAscii(bytes, position, mimeEnd) || "image/jpeg";
      position = mimeEnd + 1;

      position += 1;

      const descriptionEnd = findTerminator(bytes, position, encoding);
      position = encoding === 1 || encoding === 2 ? descriptionEnd + 2 : descriptionEnd + 1;

      const picture = bytes.slice(position, frameEnd);
      return pictureToArtwork(picture, mime);
    }

    if (frameId === "PIC" && majorVersion === 2) {
      const mime = readAscii(bytes, frameStart + 1, frameStart + 4) || "image/jpeg";
      const picture = bytes.slice(frameStart + 5, frameEnd);
      return pictureToArtwork(picture, mime);
    }

    offset = frameEnd;
  }

  if ((flags & 0x80) !== 0) {
    return null;
  }

  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const audioUrl = searchParams.get("url");

  if (!audioUrl) {
    return NextResponse.json({ error: "Missing audio URL parameter" }, { status: 400 });
  }

  try {
    const decodedUrl = decodeURIComponent(audioUrl);
    const urlObj = new URL(decodedUrl);

    if (!["https:", "http:"].includes(urlObj.protocol)) {
      return NextResponse.json({ error: "Invalid URL protocol" }, { status: 400 });
    }

    const response = await fetch(decodedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      return NextResponse.json({ cover: null, error: `Failed to fetch audio: ${response.statusText}` }, { status: response.status });
    }

    const buffer = await response.arrayBuffer();
    const artwork = extractArtworkFromMp3(buffer);
    if (!artwork) {
      return NextResponse.json({ cover: null, error: "No embedded artwork found" }, { status: 404 });
    }

    return new NextResponse(Buffer.from(artwork.bytes), {
      status: 200,
      headers: {
        "Content-Type": artwork.mime,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Audio artwork error:", error);
    return NextResponse.json({ cover: null, error: "Failed to extract artwork" }, { status: 500 });
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