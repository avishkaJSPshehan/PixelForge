import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side proxy: fetches the target URL and returns its HTML.
 * This bypasses browser CORS restrictions since the request is made from the server.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing "url" query parameter.' }, { status: 400 });
  }

  // Basic URL validation
  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid URL.' }, { status: 400 });
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return NextResponse.json({ error: 'Only http and https URLs are supported.' }, { status: 400 });
  }

  try {
    const response = await fetch(parsed.toString(), {
      headers: {
        // Mimic a real browser to avoid bot blocks on many sites
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      // Follow redirects automatically (Node fetch does this by default)
      redirect: 'follow',
      // 15-second timeout via AbortSignal
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `The target page returned HTTP ${response.status}.` },
        { status: 502 }
      );
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      return NextResponse.json(
        { error: 'The URL does not point to an HTML page.' },
        { status: 422 }
      );
    }

    const html = await response.text();

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        // Allow the client to read this response
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    if (message.includes('TimeoutError') || message.includes('timed out')) {
      return NextResponse.json({ error: 'Request timed out (15 s). The site may be too slow.' }, { status: 504 });
    }
    return NextResponse.json({ error: `Failed to fetch the URL: ${message}` }, { status: 502 });
  }
}
