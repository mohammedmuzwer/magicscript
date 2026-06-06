import { NextResponse } from "next/server";
import { MOCK_STAGE9_REELS } from "@/lib/podcast/mockData";
import { callGemini, GEMINI_MODELS } from "@/lib/podcast/gemini";
import { callClaude } from "@/lib/podcast/claude";
import { resolveAnthropicKey, resolveGeminiKey, modeLabel } from "@/lib/podcast/key-resolver";

// ── Doctor Farmer Pipeline Stage 9 — Recommended Reels Sheet ─────────────────

const SYSTEM = `You are Stage 9 — Reels Sheet Producer — of the Doctor Farmer MagicScript Podcast Pipeline.

Your job: identify 8-12 high-virality reel opportunities from the production script. Each reel must be a genuine moment from the script — no invented dialogue. The script is the bible. Copy exact lines for the reel script field.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DOCTOR FARMER CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Creator: Dr. Prabhakar Raj — medical doctor, lifestyle reversal specialist, MHS founder
Audience: 45+ Tamil Nadu diabetics and South Indian families managing diabetes
Platforms: Instagram Reels, YouTube Shorts, Facebook Video

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REEL SELECTION CRITERIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Prioritise moments with:
1. A strong myth-buster hook ("Your doctor was wrong about X")
2. A surprising scientific finding with a number or comparison
3. A demo moment (physical prop — high visual value)
4. Dr. Prabhakar's most emotionally direct statements (BLUE grade answers)
5. A short Rapid Fire answer that works standalone

AVOID: Long scientific explanations. YELLOW answers unless paired with a clear condition. Any claim that sounds definitive when the evidence is unsettled.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REEL CATEGORIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Use one of these categories per reel:
- "Myth-Buster (Disproven)" — strong myth, clear verdict
- "Myth-Buster (Unsettled)" — honest uncertainty, Dr. Prabhakar's clinical view
- "Science" — a specific finding with numbers
- "Demo" — the physical prop/demonstration moment
- "Practical" — actionable patient advice
- "Superfood" — the superfood segment
- "Problem-Solution" — pain point followed by the answer

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EDITING IDEAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
For each reel: describe ONE specific editing technique. Be concrete — not "fast cuts" but "Open on Dr. Prabhakar mid-sentence at 'False.' — no intro card, hook in 1 second."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SOURCE BLOCKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Every reel must have a source block in the sources array. Use the citation from the original script block. NO fake links. Only the guideline name, author and year, or "Dr. Prabhakar's clinical experience" for BLUE answers.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Each reel gets one CTA. Rotate between:
- "Watch the full episode — link in bio"
- "Download the free [lead magnet title] — link in bio"
- "Save this and share with someone managing diabetes"
- "Follow for weekly episodes from Dr. Prabhakar"

OUTPUT FORMAT — valid JSON only, no markdown, no code fences:
{
  "reels": [
    {
      "id": "r1",
      "title": "Hook-first reel title — what the viewer will see as the caption (under 10 words)",
      "script": "The exact spoken line(s) from the script that form this reel (copied verbatim)",
      "category": "one of the 7 categories above",
      "cta": "specific CTA line",
      "editingIdeas": "one concrete editing technique description",
      "grade": "GREEN|YELLOW|BLUE|RED",
      "sources": ["citation 1", "citation 2"]
    }
  ]
}`;

function buildPrompt({ locked_topic, script_blocks, lead_magnet_title }) {
  // Summarise script blocks for reel extraction (keep prompt focused)
  const blockSummaries = script_blocks?.slice(0, 40).map((b, i) =>
    `[Block ${i + 1} | type:${b.type} | grade:${b.grade ?? "null"}]\n` +
    `SCRIPT: ${(b.left ?? "").slice(0, 600)}` +
    (b.citation ? `\nSOURCE: ${b.citation}` : "")
  ).join("\n\n---\n\n");

  return `REELS SHEET REQUEST:
Topic: ${locked_topic ?? "Health Topic"}
Lead Magnet: ${lead_magnet_title ?? "Free guide — link in bio"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRODUCTION SCRIPT BLOCKS (Stage 8 output — extract reels from these)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${blockSummaries || "No script blocks provided — generate based on topic."}

Identify 8-12 reel opportunities. Prioritise myth-busters, demos, and emotionally direct moments.
Return ONLY valid JSON with key "reels". No markdown. No code fences.`;
}

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}

  const {
    locked_topic      = "Health Topic",
    script_blocks     = [],
    lead_magnet_title = null,
  } = body;

  const geminiKey    = resolveGeminiKey(req);
  const anthropicKey = resolveAnthropicKey(req);

  try {
    // ── Demo mode ─────────────────────────────────────────────────
    if (!geminiKey && !anthropicKey) {
      await new Promise((r) => setTimeout(r, 1800));
      return NextResponse.json({ reels: MOCK_STAGE9_REELS, mode: "demo" });
    }

    const promptText = buildPrompt({ locked_topic, script_blocks, lead_magnet_title });
    const preferred  = req.headers.get("x-preferred-model") ?? "claude";

    if (preferred === "claude" && anthropicKey) {
      const parsed = await callClaude(anthropicKey, SYSTEM, promptText, true, 8192);
      return NextResponse.json({ reels: parsed.reels ?? [], mode: modeLabel(req) });
    }
    if (geminiKey) {
      const parsed = await callGemini(geminiKey, GEMINI_MODELS.flash, SYSTEM, promptText, 0.7, 16384, 1024);
      return NextResponse.json({ reels: parsed.reels ?? [], mode: "gemini" });
    }
    if (anthropicKey) {
      const parsed = await callClaude(anthropicKey, SYSTEM, promptText, true, 8192);
      return NextResponse.json({ reels: parsed.reels ?? [], mode: modeLabel(req) });
    }


  } catch (e) {
    console.error("[stage9-reels] error:", e.message);
    if (geminiKey || anthropicKey) {
      return NextResponse.json({ error: e.message, mode: "error" }, { status: 500 });
    }
  }

  // ── Fallback demo ─────────────────────────────────────────────
  return NextResponse.json({ reels: MOCK_STAGE9_REELS, mode: "demo" });
}
