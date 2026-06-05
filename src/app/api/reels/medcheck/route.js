import { NextResponse } from "next/server";
import { generateMockMedCheck } from "@/lib/reels/mockScripts";
import { buildMedCheckPrompt, SYSTEM_PROMPT } from "@/lib/reels/prompts";
import { reelsLlmCall } from "@/lib/reels/llm";
import { getEvidenceReport, extractMedicalQuery } from "@/lib/pubmed";

export async function POST(req) {
  let topic, contentType, keyword;
  try {
    const body = await req.json();
    topic       = body.topic;
    contentType = body.contentType;
    keyword     = body.keyword ?? null;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!topic?.trim()) {
    return NextResponse.json({ error: "topic is required" }, { status: 400 });
  }

  const pubmedQuery = extractMedicalQuery(topic.trim(), keyword);
  let pubmedEvidence = null;
  try {
    pubmedEvidence = await getEvidenceReport(pubmedQuery, { maxResults: 10, minYear: 2015 });
    console.log(`[medcheck] PubMed query: "${pubmedQuery}" → score=${pubmedEvidence?.evidence?.score}, count=${pubmedEvidence?.evidence?.totalCount}`);
  } catch (pubmedErr) {
    console.warn("[reels/medcheck] PubMed fetch failed (non-fatal):", pubmedErr.message);
  }

  try {
    // ── Step 2: LLM safety analysis with real evidence grounding ─────────────
    const prompt = buildMedCheckPrompt(topic.trim(), contentType || "education", pubmedEvidence);
    const { parsed, source, fallback_from, fallback_reason } = await reelsLlmCall(req, {
      system:      SYSTEM_PROMPT,
      user:        prompt,
      temperature: 0.2,   // factual / evidence work
      maxTokens:   1200,
      isJson:      true,
    });

    // ── Step 3: Merge — real PubMed data always wins over LLM hallucinations ─
    const base = parsed ?? generateMockMedCheck(topic);

    // Override with real PubMed data when available
    if (pubmedEvidence) {
      // Real evidence score overrides LLM estimate
      base.evidence_score = pubmedEvidence.evidence.score;
      base.evidence_label = pubmedEvidence.evidence.label;
      base.evidence_level = pubmedEvidence.evidence.level;
      base.article_count  = pubmedEvidence.evidence.totalCount;

      // Real citations override hallucinated PMIDs
      if (pubmedEvidence.topArticles?.length) {
        base.pubmed_references = pubmedEvidence.topArticles.map((a) =>
          `${a.title} (${a.year ?? "n/a"}) — ${a.journal}${a.pmid ? ` — PMID: ${a.pmid}` : ""}`
        );
        base.pubmed_articles = pubmedEvidence.topArticles; // full objects for UI
      }

      // Derive safety_status from real score if LLM didn't return one
      if (!parsed?.safety_status) {
        base.safety_status =
          pubmedEvidence.evidence.score >= 70 ? "safe" :
          pubmedEvidence.evidence.score >= 40 ? "caution" : "blocked";
      }
    }

    return NextResponse.json({
      ...base,
      mode: parsed ? source : "demo",
      pubmed_source: "PubMed / NCBI E-utilities",
      pubmed_query:  pubmedQuery,   // cleaned query used for PubMed search
      ...(fallback_from ? { fallback_from, fallback_reason } : {}),
    });

  } catch (err) {
    console.error("[reels/medcheck]", err.message);
    // Graceful fallback — still return real PubMed data if we have it
    const mockBase = generateMockMedCheck(topic ?? "topic");
    if (pubmedEvidence) {
      mockBase.evidence_score = pubmedEvidence.evidence.score;
      mockBase.evidence_label = pubmedEvidence.evidence.label;
      mockBase.article_count  = pubmedEvidence.evidence.totalCount;
      if (pubmedEvidence.topArticles?.length) {
        mockBase.pubmed_references = pubmedEvidence.topArticles.map((a) =>
          `${a.title} (${a.year ?? "n/a"}) — ${a.journal}${a.pmid ? ` — PMID: ${a.pmid}` : ""}`
        );
        mockBase.pubmed_articles = pubmedEvidence.topArticles;
      }
    }
    return NextResponse.json({ ...mockBase, mode: "demo", error: err.message });
  }
}
