import { type NextRequest, NextResponse } from 'next/server';

/**
 * Audio proxy endpoint that streams remote audio with CORS headers
 * Usage: /api/audio?url=<encoded-url>
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const audioUrl = searchParams.get('url');

  if (!audioUrl) {
    return NextResponse.json({ error: 'Missing audio URL parameter' }, { status: 400 });
  }

  try {
    const decodedUrl = decodeURIComponent(audioUrl);
    
    // Validate URL protocol
    const urlObj = new URL(decodedUrl);
    if (!['https:', 'http:'].includes(urlObj.protocol)) {
      return NextResponse.json({ error: 'Invalid URL protocol' }, { status: 400 });
    }

   const response = await fetch(decodedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'audio/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Range': 'bytes=0-',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      console.error('Audio fetch failed:', { url: decodedUrl, status: response.status, statusText: response.statusText });
      return NextResponse.json(
        { error: `Failed to fetch audio: ${response.statusText}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || 'audio/mpeg';

   // Buffer the entire audio file
   const buffer = await response.arrayBuffer();

   const headers: Record<string, string> = {
      'Content-Type': contentType,
     'Content-Length': buffer.byteLength.toString(),
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Range',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=86400'
    };


   // Return the buffered audio
   return new NextResponse(buffer, {
     status: 200,
      headers
    });
  } catch (error) {
    console.error('Audio proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy audio' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
