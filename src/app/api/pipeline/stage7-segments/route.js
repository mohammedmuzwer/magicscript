export const maxDuration = 60;

import { NextResponse } from "next/server";
import { MOCK_STAGE7_SEGMENTS } from "@/lib/podcast/mockData";
import { callGemini, GEMINI_MODELS } from "@/lib/podcast/gemini";
import { callClaude } from "@/lib/podcast/claude";
import { resolveAnthropicKey, resolveGeminiKey, modeLabel } from "@/lib/podcast/key-resolver";

// ── Doctor Farmer Pipeline Stage 7 — Segments & Engagement ───────────────────

const SYSTEM = `You are Stage 7 — Segments & Engagement Designer — of the Doctor Farmer MagicScript Podcast Pipeline.

Your job: turn the approved Q&A script into a fully designed show. You add structure, entertainment, demonstrations, a Superfood segment, lead magnet, and CTA injection points.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DOCTOR FARMER CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Creator: Dr. Prabhakar Raj — medical doctor, lifestyle reversal specialist, MHS founder
Audience: 45+ Type 2 diabetics and South Indian families managing diabetes
Show personality: Warm Tamil Nadu doctor on camera. Direct. Evidence-based. Never sensational.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEGMENT MAP RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Build the segment map based on the approved arc sections. Add signature segments:
- Opening Hook (fixed, 2–3 min)
- Content sections from Stage 6 arc (flexible, variable duration)
- "Superfood of the Day" signature segment (4 min) — placed after Myth-Busting
- Rapid Fire close (signature, 2–3 min)
Each segment must have an id, label, duration string, and type: "fixed" | "flexible" | "signature"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEMONSTRATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The Stage 6 script already has 2 demo triggers. Describe what physical prop or on-set demonstration Dr. Prabhakar performs for each. Be specific — name the exact prop and what he does with it.
- type: "table-prop" (physical objects on table) or "animation" (B-roll or whiteboard)
- prop: what the production team needs to prepare

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUPERFOOD OF THE DAY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Choose ONE Indian superfood specifically beneficial for Type 2 diabetes management that is INDEPENDENT of the main topic.
Do NOT choose the same food as the main topic.
Requirements:
- Must be a real Indian food with strong scientific backing
- Provide 2-3 fact-checked claims (grade: GREEN = strong RCT evidence, YELLOW = promising but conditional)
- Include a real citation for each claim (journal/guideline name and year, no fake PMIDs)
- State clearly who should take it and who should avoid it

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CTA INJECTION POINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2 CTA points maximum:
- cta1: after the Discovery section — promote the lead magnet (free PDF)
- cta2: after the Solution section — soft mention of MHS program enrolment
Use warm, non-pushy language. Dr. Prabhakar's voice. Never salesy.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LEAD MAGNET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Create a free PDF guide title that:
- Directly relates to the episode topic
- Solves one specific problem the audience has
- Is short (5-8 words) and benefit-driven
Provide 2 alternatives as well.

OUTPUT FORMAT — valid JSON only, no markdown, no code fences:
{
  "segmentMap": [
    { "id": "string", "label": "string", "duration": "string", "type": "fixed|flexible|signature" }
  ],
  "demonstrations": [
    {
      "id": "string",
      "section": "string",
      "type": "table-prop|animation",
      "description": "what Dr. Prabhakar does on camera — specific actions",
      "prop": "exact props the production team needs to prepare"
    }
  ],
  "superfood": {
    "name": "common name (scientific name)",
    "claims": [
      { "claim": "specific measurable claim", "grade": "GREEN|YELLOW", "source": "source name", "citation": "Author Year or Guideline name" }
    ],
    "whoShouldTake": "specific patient groups who benefit",
    "whoShouldAvoid": "specific contraindications"
  },
  "ctaPoints": [
    { "position": "after-discovery|after-solution|after-myth", "type": "lead-magnet|program", "text": "Dr. Prabhakar's exact spoken CTA words — warm, conversational" }
  ],
  "leadMagnet": {
    "chosen": "PDF title — 1-line description of what's inside",
    "alternatives": ["alternative 1 title — description", "alternative 2 title — description"]
  }
}`;

function buildPrompt({ locked_topic, angle, pillars, primary_viewer, stage6_sections, indian_context, total_runtime_min }) {
  // Summarise Stage 6 sections for context (section label + Q count + demo triggers)
  const arcSummary = stage6_sections?.map((sec) => {
    const demos = sec.answers?.filter((a) => a.demo_trigger) ?? [];
    const demoLine = demos.length
      ? ` | DEMO: ${demos.map((d) => d.editor_note || d.question_text).join("; ")}`
      : "";
    return `- ${sec.label} [${sec.actual_min ?? "?"}min, ${sec.answers?.length ?? 0}Q${demoLine}]`;
  }).join("\n") ?? "  Not provided";

  const contextList = indian_context?.length
    ? indian_context.map((ic) => `- ${ic.angle}: ${ic.significance}`).join("\n")
    : "  Not provided";

  const pillarList = pillars?.length ? pillars.join(", ") : "Not provided";

  return `SHOW DESIGN REQUEST:
Topic: ${locked_topic ?? "Health Topic"}
Angle: ${angle ?? "Not provided"}
4 Pillars: ${pillarList}
Primary viewer: ${primary_viewer ?? "45+ Tamil Nadu diabetic"}
Total script runtime: ${total_runtime_min ?? "~30"} min

APPROVED SCRIPT ARC (Stage 6 output):
${arcSummary}

INDIAN CONTEXT TO REFERENCE:
${contextList}

Design the segment map, demonstrations, superfood (independent of the main topic), CTAs, and lead magnet.
Return ONLY valid JSON. No markdown. No code fences.`;
}

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}

  const {
    locked_topic    = "Health Topic",
    angle           = null,
    pillars         = [],
    primary_viewer  = null,
    stage6_sections = [],
    indian_context  = [],
    total_runtime_min = 30,
  } = body;

  const geminiKey    = resolveGeminiKey(req);
  const anthropicKey = resolveAnthropicKey(req);

  try {
    // ── Demo mode ─────────────────────────────────────────────────
    if (!geminiKey && !anthropicKey) {
      await new Promise((r) => setTimeout(r, 2200));
      return NextResponse.json({ ...MOCK_STAGE7_SEGMENTS, mode: "demo" });
    }

    const promptText = buildPrompt({ locked_topic, angle, pillars, primary_viewer, stage6_sections, indian_context, total_runtime_min });
    const preferred  = req.headers.get("x-preferred-model") ?? "gemini";

    if (preferred === "claude") {
      if (anthropicKey) {
        const parsed = await callClaude(anthropicKey, SYSTEM, promptText, true, 4096);
        return NextResponse.json({ ...parsed, mode: modeLabel(req) });
      }
      if (geminiKey) {
        const parsed = await callGemini(geminiKey, GEMINI_MODELS.flash, SYSTEM, promptText, 0.7, 65000, 1024);
        return NextResponse.json({ ...parsed, mode: "gemini" });
      }
    } else {
      if (geminiKey) {
        const parsed = await callGemini(geminiKey, GEMINI_MODELS.flash, SYSTEM, promptText, 0.7, 65000, 1024);
        return NextResponse.json({ ...parsed, mode: "gemini" });
      }
      if (anthropicKey) {
        const parsed = await callClaude(anthropicKey, SYSTEM, promptText, true, 4096);
        return NextResponse.json({ ...parsed, mode: modeLabel(req) });
      }
    }
  } catch (e) {
    console.error("[stage7-segments] error:", e.message);
    if (geminiKey || anthropicKey) {
      return NextResponse.json({ error: e.message, mode: "error" }, { status: 500 });
    }
  }

  // ── Fallback demo ─────────────────────────────────────────────
  return NextResponse.json({ ...MOCK_STAGE7_SEGMENTS, mode: "demo" });
}
