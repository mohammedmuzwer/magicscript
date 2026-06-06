/**
 * Stage 4 — Structured Script Generation
 *
 * Generates evidence-backed 60-second reel scripts for all verified topics
 * in parallel. Returns structured JSON with section labels.
 *
 * Script structure:
 *   [HOOK — 0-3s]        → pattern interrupt or shocking fact
 *   [RETENTION — 3-15s]  → core science + strongest study reference
 *   [CREDIBILITY — 15-25s] → guideline/cultural tie-in + drug flag if needed
 *   [CTA — 25-30s]       → clear action + WhatsApp forward trigger
 *
 * Quality gate: score < 70 triggers regeneration (same slot, up to 3 attempts).
 * Model fallback: Claude → Gemini → GPT-4o-mini.
 * Demo fallback: returns pre-structured scripts when no API key is present.
 */

import { NextResponse } from "next/server";
import { reelsLlmCall } from "@/lib/reels/llm";
import { generateMockScripts } from "@/lib/reels/mockScripts";

// ── Script quality self-scorer (rule-based) ───────────────────────────────
function scoreScriptQuality(parsed) {
  if (!parsed) return 0;
  let score = 0;

  // Hook quality (35%) — check for curiosity/urgency markers
  const hook = (parsed.hook || "").toLowerCase();
  if (hook.length > 30) score += 20;
  if (/\?|!|study|research|proof|actually|truth/.test(hook)) score += 15;

  // Retention flow (25%) — check for data point
  const retention = (parsed.retention || "").toLowerCase();
  if (retention.length > 50) score += 15;
  if (/\d+%|\d+\s+studies?|research|evidence|trial/.test(retention)) score += 10;

  // Medical accuracy (25%) — check for grade-consistent language
  const credibility = (parsed.credibility || "").toLowerCase();
  if (credibility.length > 30) score += 15;
  if (/icmr|who|guideline|journal|study|clinical/.test(credibility)) score += 10;

  // CTA power (15%) — check for action + share trigger
  const cta = (parsed.cta || "").toLowerCase();
  if (/save|share|follow|whatsapp|send|forward/.test(cta)) score += 15;

  return Math.min(score, 100);
}

// ── Build script generation prompt ───────────────────────────────────────
function buildScriptPrompt(topic, tamilContext) {
  const grade        = topic.evidenceGrade ?? topic.grade ?? "B";
  const studyCount   = topic.studyCount   ?? topic.pubmed_study_count ?? "unknown";
  const whyNow       = topic.why_now      ?? "";
  const guideline    = topic.guidelineMatch?.title ?? "None";
  const drugFlagText = topic.drugFlags
    ? topic.drugFlags.map((f) => `${f.keywords.join("/")} + ${f.drugs.join("/")} → ${f.risk}`).join("; ")
    : "None";
  const tamilNote    = tamilContext
    ? `${tamilContext.festival || tamilContext.season}`
    : "General health context";

  const confidenceWord =
    grade === "A" ? "Studies prove" :
    grade === "B" ? "Research shows" :
    "Studies suggest";

  return `You are a Tamil Nadu health content creator's script writer for Dr. Prabhakar Raj (Doctor Farmer).

Write a 60-second reel script in English only. The creator will add Tamil localization separately.

TOPIC: ${topic.title}
CATEGORY: ${topic.tabId ?? topic._cat ?? "educational"}
EVIDENCE GRADE: ${grade} (${studyCount} PubMed studies)
WHY NOW: ${whyNow}
GUIDELINE MATCH: ${guideline}
DRUG FLAGS: ${drugFlagText}
TAMIL CONTEXT: ${tamilNote}
CONFIDENCE WORD: "${confidenceWord}" — use this based on evidence grade

SCRIPT STRUCTURE (strict — each section in exact format):

[HOOK — 0-3s]
One sentence. Pattern interrupt or shocking fact. Create immediate curiosity or fear/hope.
Grade A: state confidently. Grade B: moderate confidence. Grade C: hedge carefully.
Never include Grade D claims.

[RETENTION LOOP — 3-15s]
2-3 sentences. Core science explained simply. Reference the strongest study if Grade A or B.
Include a specific number or statistic from PubMed evidence where possible.
TEXT OVERLAY: (key number or stat for on-screen text — one short phrase)

[CREDIBILITY — 15-25s]
1-2 sentences. ICMR/WHO guideline mention if applicable.
Tamil cultural or seasonal connection if relevant.
If drug flag present: add a brief safety note for diabetic/PCOS audience.

[CTA — 25-30s]
One clear action. "Save this video" or "Share with someone who needs it."
WhatsApp forward trigger for Tamil audience.

WHATSAPP HOOK: (1 line only — a shareable summary for WhatsApp groups)

Return ONLY valid JSON (no markdown fences):
{
  "hook": "string",
  "retention": "string",
  "text_overlay": "string",
  "credibility": "string",
  "cta": "string",
  "full_script": "string (all sections joined with labels and newlines)",
  "evidence_badge": "string (e.g. Grade A · 23 studies)",
  "whatsapp_hook": "string"
}`;
}

// ── Assemble full_script from structured fields ───────────────────────────
function assembleFullScript(parsed, topic) {
  const grade      = topic.evidenceGrade ?? topic.grade ?? "B";
  const studyCount = topic.studyCount ?? "?";
  return [
    `[HOOK — 0-3s]`,
    parsed.hook || "",
    `TEXT OVERLAY: "${parsed.text_overlay || ""}"`,
    ``,
    `[RETENTION LOOP — 3-15s]`,
    parsed.retention || "",
    ``,
    `[CREDIBILITY — 15-25s]`,
    parsed.credibility || "",
    ``,
    `[CTA — 25-30s]`,
    parsed.cta || "",
    ``,
    `📊 Evidence: Grade ${grade} · ${studyCount} PubMed studies`,
    parsed.whatsapp_hook ? `📱 WhatsApp: ${parsed.whatsapp_hook}` : "",
  ].join("\n").trim();
}

// ── Generate one script (with quality gate + regeneration) ────────────────
async function generateScript(topic, tamilContext, req) {
  const prompt    = buildScriptPrompt(topic, tamilContext);
  const maxAttempts = 3;
  const modelKeys   = ["claude", "gemini", "gpt"];
  let bestResult    = null;
  let bestScore     = 0;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const result = await reelsLlmCall(req, {
        system:      `You are a Tamil Nadu health reel script writer for Doctor Farmer (Dr. Prabhakar Raj). You write evidence-graded scripts in English using the exact JSON format specified. Always follow grade-consistent confidence language.`,
        user:        prompt,
        temperature: 0.8,
        maxTokens:   1000,
        isJson:      true,
      });

      const parsed      = result?.parsed;
      const qualScore   = scoreScriptQuality(parsed);
      const modelUsed   = result?.source ?? "unknown";

      if (parsed && qualScore > bestScore) {
        bestScore  = qualScore;
        bestResult = { parsed, qualScore, modelUsed };
      }

      if (qualScore >= 70) break; // quality gate passed — no need to retry

    } catch (e) {
      console.warn(`[stage4-scripts] attempt ${attempt + 1} failed:`, e.message);
    }
  }

  if (!bestResult) {
    // All attempts failed — return structured mock script
    const mock   = generateMockScripts(topic.title || "health topic", "education-drop", null);
    const mockTx = mock.education || "";
    return {
      topic,
      scripts: {
        education: mockTx,
        cinematic: mockTx,
        rebel:     mockTx,
      },
      structured: null,
      qualityScore: 0,
      modelUsed: "demo",
      error: true,
    };
  }

  const { parsed, qualScore, modelUsed } = bestResult;
  const fullScript = assembleFullScript(parsed, topic);

  return {
    topic,
    scripts: {
      education: fullScript,
      cinematic: fullScript,
      rebel:     fullScript,
    },
    structured: parsed,
    qualityScore: qualScore,
    modelUsed,
    evidenceBadge: parsed.evidence_badge ?? `Grade ${topic.evidenceGrade ?? "B"} · ${topic.studyCount ?? "?"} studies`,
    whatsappHook: parsed.whatsapp_hook ?? "",
    guidelineMatch: topic.guidelineMatch ?? null,
    drugFlags: topic.drugFlags ?? null,
  };
}

// ── Demo mock structured scripts ──────────────────────────────────────────
function buildDemoScripts(topics) {
  return topics.map((topic, i) => {
    const grade = ["A", "B", "A", "B", "A"][i % 5];
    const count = 15 + i * 4;
    const hook = `${grade === "A" ? "Research proves" : "Studies show"}: Most ${(topic.title || "health topic").split(" ").slice(0, 3).join(" ").toLowerCase()} advice is based on Western data that doesn't apply to South Indian patients.`;
    const retention = `Tamil Nadu patients have a unique metabolic profile — rice-based diet, late dinners, and genetic insulin resistance mean standard protocols need adjustment. ${count} peer-reviewed studies confirm this difference.`;
    const overlay = `${count} Studies — Indian Patients`;
    const credibility = `${grade === "A" ? "ICMR Clinical Practice Guidelines (2023)" : "Published research in Diabetes Care"} backs this approach for South Indian populations. If you're on metformin, discuss timing adjustments with your doctor before changing habits.`;
    const cta = `Save this video before you forget it — and send it to one family member who needs to hear this today.`;
    const whatsappHook = `⚠️ Important health fact for South Indian diabetics — share with family`;
    const fullScript = [
      "[HOOK — 0-3s]",
      hook,
      `TEXT OVERLAY: "${overlay}"`,
      "",
      "[RETENTION LOOP — 3-15s]",
      retention,
      "",
      "[CREDIBILITY — 15-25s]",
      credibility,
      "",
      "[CTA — 25-30s]",
      cta,
      "",
      `📊 Evidence: Grade ${grade} · ${count} PubMed studies`,
      `📱 WhatsApp: ${whatsappHook}`,
    ].join("\n");

    return {
      topic,
      scripts: { education: fullScript, cinematic: fullScript, rebel: fullScript },
      structured: { hook, retention, text_overlay: overlay, credibility, cta, full_script: fullScript, evidence_badge: `Grade ${grade} · ${count} studies`, whatsapp_hook: whatsappHook },
      qualityScore: 75 + (i % 3) * 5,
      modelUsed: "demo",
      evidenceBadge: `Grade ${grade} · ${count} studies`,
      whatsappHook,
      guidelineMatch: i === 0 ? { badge: "ICMR Guideline", org: "ICMR" } : null,
      drugFlags: null,
    };
  });
}

// ── POST handler ──────────────────────────────────────────────────────────
export async function POST(req) {
  let verifiedTopics, batchSize, tamilContext;

  try {
    const body       = await req.json();
    verifiedTopics   = Array.isArray(body.verifiedTopics) ? body.verifiedTopics : [];
    batchSize        = body.batchSize ?? verifiedTopics.length;
    tamilContext     = body.tamilContext ?? null;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!verifiedTopics.length) {
    return NextResponse.json({ error: "No topics provided" }, { status: 400 });
  }

  const topics = verifiedTopics.slice(0, batchSize);

  // ── Demo mode — no API keys ────────────────────────────────────────────
  const hasKey = req.headers.get("x-client-anthropic-key") ||
                 process.env.ANTHROPIC_API_KEY              ||
                 req.headers.get("x-client-gemini-key")    ||
                 process.env.GOOGLE_AI_KEY                  ||
                 req.headers.get("x-client-openai-key");
  if (!hasKey) {
    await new Promise((r) => setTimeout(r, 600));
    const scripts = buildDemoScripts(topics);
    return NextResponse.json({
      scripts,
      totalCost:  topics.length * 8,
      summary: {
        avgQualityScore: 80,
        regenerations:   0,
        modelUsed:       ["demo"],
      },
      mode: "demo",
    });
  }

  // ── Live mode — generate all in parallel ──────────────────────────────
  try {
    console.log(`[stage4-scripts] Generating ${topics.length} scripts in parallel`);
    const results = await Promise.all(
      topics.map((t) => generateScript(t, tamilContext, req))
    );

    const avgQuality    = Math.round(results.reduce((s, r) => s + (r.qualityScore ?? 0), 0) / results.length);
    const modelsUsed    = [...new Set(results.map((r) => r.modelUsed).filter(Boolean))];
    const regenerations = results.filter((r) => r.qualityScore < 70).length;

    console.log(`[stage4-scripts] Done — avgQuality:${avgQuality} models:${modelsUsed.join(",")}`);

    return NextResponse.json({
      scripts:    results,
      totalCost:  topics.length * 8,
      summary: {
        avgQualityScore: avgQuality,
        regenerations,
        modelUsed: modelsUsed,
      },
      mode: "live",
    });

  } catch (err) {
    console.error("[stage4-scripts] Fatal error:", err.message);
    const fallbackScripts = buildDemoScripts(topics);
    return NextResponse.json({
      scripts:   fallbackScripts,
      totalCost: topics.length * 8,
      summary:   { avgQualityScore: 75, regenerations: 0, modelUsed: ["fallback"] },
      mode:      "fallback",
      error:     err.message,
    });
  }
}
