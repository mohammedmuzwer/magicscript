/**
 * POST /api/pubmed
 *
 * Unified PubMed gateway — used by Studio, Reels, YouTube, Podcast.
 * Keeps the NCBI_API_KEY server-side (never exposed to the browser).
 *
 * Request body:
 *   { type: "evidence" | "search" | "density", query: string, options?: {} }
 *
 * Responses:
 *   evidence → { query, evidence: { score, level, label }, topArticles, searchedAt }
 *   search   → { articles, totalCount }
 *   density  → { score: 0-100 }
 */

import { NextResponse } from "next/server";
import {
  getEvidenceReport,
  searchPubMed,
  getResearchDensityScore,
} from "@/lib/pubmed";

export async function POST(request) {
  try {
    const body = await request.json();
    const { type = "evidence", query, options = {} } = body;

    if (!query?.trim()) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    switch (type) {

      // ── Full evidence report (Med Quick-Check, Studio claim verify) ──────
      case "evidence": {
        const report = await getEvidenceReport(query.trim(), options);
        return NextResponse.json(report);
      }

      // ── Raw article search (show citations panel) ────────────────────────
      case "search": {
        const result = await searchPubMed(query.trim(), options);
        return NextResponse.json(result);
      }

      // ── Research density score for Reel topic validation ─────────────────
      case "density": {
        const score = await getResearchDensityScore(query.trim());
        return NextResponse.json({ score, query });
      }

      default:
        return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
    }

  } catch (err) {
    console.error("[/api/pubmed]", err.message);
    return NextResponse.json(
      { error: "PubMed request failed", detail: err.message },
      { status: 500 }
    );
  }
}
