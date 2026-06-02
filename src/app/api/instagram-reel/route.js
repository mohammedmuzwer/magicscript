import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * GET /api/instagram-reel?url=<instagram-url>
 *
 * Attempts to fetch Instagram Reel metadata via oEmbed.
 * Instagram's public oEmbed endpoints have restricted access — this will
 * work for some public posts and gracefully return nulls when it can't.
 *
 * Note: Full transcript/caption extraction from Instagram is not available
 * via any public API. The Studio shows a manual-paste textarea instead.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  // Normalise URL — strip tracking params so oEmbed has the cleanest possible input
  let cleanUrl = url;
  try {
    const u = new URL(url);
    // Keep only origin + pathname (strip utm_source, igsh, etc.)
    cleanUrl = `${u.origin}${u.pathname.replace(/\/$/, "")}`;
  } catch {
    // use raw url if parsing fails
  }

  // ── Attempt 1: Instagram's internal oEmbed (works for some public posts) ──
  // This endpoint doesn't require a token but is undocumented / may change.
  const oembedEndpoints = [
    `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(cleanUrl)}&omitscript=true`,
    `https://api.instagram.com/oembed/?url=${encodeURIComponent(cleanUrl)}&omitscript=true`,
  ];

  for (const endpoint of oembedEndpoints) {
    try {
      const res = await fetch(endpoint, {
        headers: {
          "User-Agent":
            "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(5000),
        next: { revalidate: 300 }, // cache 5 min
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({
          platform:  "instagram",
          title:     data.title       || null,
          author:    data.author_name || null,
          thumbnail: data.thumbnail_url || null,
          ok:        true,
        });
      }
    } catch {
      // try next endpoint
    }
  }

  // ── Graceful fallback — metadata unavailable but response is still valid ──
  // The UI will show the manual-caption textarea regardless; nulls just mean
  // the title/author chips stay empty.
  return NextResponse.json({
    platform:  "instagram",
    title:     null,
    author:    null,
    thumbnail: null,
    ok:        false,
  });
}
