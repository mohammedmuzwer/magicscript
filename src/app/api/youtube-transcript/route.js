import { NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

// GET /api/youtube-transcript?id=<videoId>
//
// Fetches the captions for a YouTube video. Tries English first (which uses
// YouTube's own translated track when the source language isn't English); if
// that fails, falls back to the default track in whatever language is available.
//
// Returns:
//   { transcript, segments, durationSec, durationLabel, languageCode, translated }
//   or { error } with 4xx/5xx status.
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const videoId = (searchParams.get("id") || "").trim();

  if (!videoId) {
    return NextResponse.json({ error: "Missing ?id=<videoId>" }, { status: 400 });
  }

  const attempts = [
    { lang: "en", translated: true },
    { lang: undefined, translated: false },
  ];

  let segments = null;
  let usedLang = null;
  let wasTranslated = false;
  let lastErr = null;

  for (const a of attempts) {
    try {
      segments = await YoutubeTranscript.fetchTranscript(videoId, a.lang ? { lang: a.lang } : undefined);
      if (segments && segments.length) {
        usedLang = a.lang || "auto";
        wasTranslated = a.translated;
        break;
      }
    } catch (e) {
      lastErr = e;
    }
  }

  if (!segments || !segments.length) {
    const msg = lastErr?.message || "No captions available for this video.";
    return NextResponse.json({ error: msg }, { status: 404 });
  }

  const decoded = segments.map((s) => ({
    text: decodeEntities(s.text || ""),
    offset: typeof s.offset === "number" ? s.offset : 0,
    duration: typeof s.duration === "number" ? s.duration : 0,
  }));

  const last = decoded[decoded.length - 1];
  const durationMs = (last.offset || 0) + (last.duration || 0);
  const durationSec = Math.round(durationMs / 1000);

  const transcript = decoded
    .map((s) => s.text)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return NextResponse.json({
    transcript,
    segments: decoded,
    durationSec,
    durationLabel: formatDuration(durationSec),
    wordCount: transcript.split(/\s+/).filter(Boolean).length,
    languageCode: usedLang,
    translated: wasTranslated,
  });
}

function formatDuration(totalSec) {
  if (!Number.isFinite(totalSec) || totalSec <= 0) return "0:00";
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function decodeEntities(s) {
  return s
    .replace(/&amp;#39;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;quot;/g, '"')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}
