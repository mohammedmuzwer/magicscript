import { NextResponse } from "next/server";
import { getResearch } from "@/lib/research-data";
import { generateContent } from "@/lib/generator";
import { buildGenerationPrompt, callLLM, callMedicalVerification, isLLMConfigured, resolveProvider } from "@/lib/ai";
import { getEvidenceReport, extractMedicalQuery } from "@/lib/pubmed";

// POST /api/generate
// Body: { topic, language, tone, platform, length, seed, enrichmentModule, sourceTranscript }
//
// Strategy:
// 1. Always run the local template generator first — gives a complete content
//    object with all formats (reel/youtube/podcast/webinar/stage/ted/carousel/etc.)
//    in the requested language. This is the structural baseline the UI relies on.
// 2. Stage 3 — Medical Verification: if a Google AI key is available (via header
//    x-client-google-key or GOOGLE_AI_KEY env var), run Evidence Retrieval,
//    Claim Validator, and Safety Guard agents through Gemini. The verified fields
//    (verdict, confidence, keyFinding, limitations, misinfoRisk, evidenceLevel) are
//    merged into the research object BEFORE content generation so the LLM prompt
//    and template both see live-verified data. Falls back to static research silently.
// 3. If a Claude or OpenAI key is configured, call the live model for content
//    generation — hooks, scripts, captions, CTAs. Fields the model omits fall
//    back to template values silently.
// 4. On any LLM error, return the template output untouched. The user is never
//    blocked by model unavailability.
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      topic = "",
      language = "en",
      tone = "educational",
      platform = "reels",
      length = "medium",
      seed = 1,
      enrichmentModule = null,
      sourceTranscript = null,
    } = body;

    if (!topic.trim()) {
      return NextResponse.json({ error: "A topic is required." }, { status: 400 });
    }

    // ── Read client-supplied keys forwarded from browser localStorage ────────
    // The Studio page reads V_KEY_CLAUDE / V_KEY_GPT / V_KEY_GOOGLE from
    // localStorage and sends them as x-client-*-key headers. These are used
    // only for the duration of this single request — never persisted server-side.
    const clientClaudeKey = req.headers.get("x-client-anthropic-key") || "";
    const clientOpenaiKey = req.headers.get("x-client-openai-key")    || "";
    const clientGoogleKey = req.headers.get("x-client-google-key")    || "";
    const keyOverrides    = { claude: clientClaudeKey, openai: clientOpenaiKey, google: clientGoogleKey };

    // ── PubMed Evidence + Stage 3 Medical Verification — run in parallel ────────
    // PubMed: always runs (no key needed beyond NCBI_API_KEY in env).
    // Gemini: runs only when a Google AI key is present.
    // Both results are merged into `research` before content generation.
    const research = getResearch(topic);
    let geminiVerifyError = null;

    const hasGoogleKey = Boolean(clientGoogleKey || process.env.GOOGLE_AI_KEY || process.env.GEMINI_API_KEY);

    // Clean the topic title into a proper medical search query
    const pubmedQuery = extractMedicalQuery(topic);

    const [pubmedResult] = await Promise.all([
      // PubMed evidence — always attempt (graceful fallback on error)
      getEvidenceReport(pubmedQuery, { maxResults: 10, minYear: 2015 }).catch((e) => {
        console.warn("[generate] PubMed fetch failed (non-fatal):", e.message);
        return null;
      }),

      // Gemini medical verification — only if key is present
      hasGoogleKey
        ? callMedicalVerification(topic, keyOverrides)
            .then((verification) => {
              if (verification) {
                if (verification.verdict)        research.verdict       = verification.verdict;
                if (verification.verdictWord)    research.verdictWord   = verification.verdictWord;
                if (typeof verification.confidence === "number") research.confidence = verification.confidence;
                if (verification.keyFinding)     research.keyFinding    = verification.keyFinding;
                if (verification.limitations?.length) research.limitations = verification.limitations;
                if (typeof verification.misinfoRisk === "number") research.misinfoRisk = verification.misinfoRisk;
                if (verification.evidenceLevel)  research.evidenceLevel = verification.evidenceLevel;
                if (verification.safetyFlags?.filter(Boolean).length)
                  research.safetyFlags = verification.safetyFlags.filter(Boolean);
                research.geminiVerified = true;
              }
            })
            .catch((e) => { geminiVerifyError = e?.message || String(e); })
        : Promise.resolve(),
    ]);

    // ── Merge real PubMed evidence into research object ───────────────────────
    if (pubmedResult) {
      research.pubmedEvidence     = pubmedResult.evidence;        // { score, level, label, articleCount, totalCount }
      research.pubmedTopArticles  = pubmedResult.topArticles;     // top 5 articles with pmid, title, year, journal, url
      research.pubmedTotalCount   = pubmedResult.evidence.totalCount;
      // If Gemini didn't set evidenceLevel, use PubMed's
      if (!research.evidenceLevel) research.evidenceLevel = pubmedResult.evidence.label;
    }

    // Step 1: full template baseline
    const baseContent = generateContent({
      topic, language, tone, platform, length, seed, research,
      enrichmentModule, sourceTranscript,
    });

    // Step 2: live LLM content rewrite (Claude / OpenAI / Gemini fallback)
    const hasLLM = isLLMConfigured || Boolean(clientClaudeKey || clientOpenaiKey || clientGoogleKey);
    let aiMode   = "demo";
    let aiError  = null;

    if (hasLLM) {
      try {
        const prompt = buildGenerationPrompt({
          topic, language, tone, platform, length, research, sourceTranscript, enrichmentModule,
        });
        const ai = await callLLM(prompt, keyOverrides);
        aiMode = resolveProvider(keyOverrides); // "anthropic" | "openai"

        // Merge AI rewrites over the template — only replace fields the model returned.
        if (Array.isArray(ai.hooks) && ai.hooks.length) baseContent.hooks = ai.hooks.slice(0, 3);
        if (ai.reelScript?.sections?.length)            baseContent.reelScript    = ai.reelScript;
        if (ai.podcastScript?.sections?.length)         baseContent.podcastScript = ai.podcastScript;
        if (typeof ai.caption === "string" && ai.caption.trim()) baseContent.caption = ai.caption;
        if (typeof ai.cta === "string" && ai.cta.trim())         baseContent.cta     = ai.cta;
      } catch (e) {
        aiError = e?.message || String(e);
      }
    }

    return NextResponse.json({
      ...baseContent,
      meta: {
        ...baseContent.meta,
        aiMode,
        aiError,
        geminiVerified:    research.geminiVerified    || false,
        geminiVerifyError: geminiVerifyError || null,
        // Real PubMed evidence metadata
        pubmedEvidence:    research.pubmedEvidence    || null,
        pubmedTopArticles: research.pubmedTopArticles || [],
        pubmedSource:      "PubMed / NCBI E-utilities",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Generation failed." }, { status: 500 });
  }
}
