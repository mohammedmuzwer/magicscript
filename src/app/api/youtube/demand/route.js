/**
 * POST /api/youtube/demand
 *
 * Level 1 demand signal endpoint — YouTube search + statistics.
 * Used by Stage 2 topic pipeline to score real-world demand before generation.
 *
 * Request body (single keyword):
 *   { "keyword": "diabetes fasting" }
 *
 * Request body (batch — up to 10):
 *   { "keywords": ["diabetes fasting", "weight loss India", ...] }
 *
 * Both accept an optional "options" object:
 *   { "options": { "maxResults": 5, "regionCode": "IN" } }
 *
 * Response (single):   YouTubeDemandReport object
 * Response (batch):    Record<keyword, YouTubeDemandReport>
 */

import { NextResponse } from "next/server";
import { getYouTubeDemandReport, getYouTubeDemandBatch } from "@/lib/youtube";

export async function POST(req) {
  // ── Guard: key must be configured ─────────────────────────────────────────
  if (!process.env.YOUTUBE_API_KEY) {
    return NextResponse.json(
      { error: "YOUTUBE_API_KEY is not configured in .env.local" },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { keyword, keywords, options = {} } = body;

  // ── Batch mode ─────────────────────────────────────────────────────────────
  if (Array.isArray(keywords) && keywords.length) {
    try {
      const report = await getYouTubeDemandBatch(keywords, options);
      return NextResponse.json(report);
    } catch (err) {
      const status = err.message?.toLowerCase().includes("quota") ? 429 : 500;
      return NextResponse.json({ error: err.message }, { status });
    }
  }

  // ── Single keyword mode ────────────────────────────────────────────────────
  if (!keyword?.trim()) {
    return NextResponse.json({ error: "keyword (string) or keywords (array) is required" }, { status: 400 });
  }

  try {
    const report = await getYouTubeDemandReport(keyword.trim(), options);
    return NextResponse.json(report);
  } catch (err) {
    const status =
      err.message?.includes("quota")     ? 429 :
      err.message?.includes("rate limit") ? 429 :
      err.message?.includes("invalid")    ? 403 : 500;

    console.error("[youtube/demand]", err.message);
    return NextResponse.json({ error: err.message }, { status });
  }
}

// ── GET — quick health check / quota estimator ────────────────────────────────
export async function GET() {
  const hasKey = !!process.env.YOUTUBE_API_KEY;
  return NextResponse.json({
    status:   hasKey ? "ready" : "missing_key",
    message:  hasKey ? "YouTube API configured ✅" : "Set YOUTUBE_API_KEY in .env.local",
    quota: {
      dailyLimit:          10000,
      unitsPerReport:      101,
      maxReportsPerDay:    99,
      note: "search=100 units + videos.list=1 unit per keyword",
    },
  });
}
