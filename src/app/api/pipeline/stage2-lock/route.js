import { NextResponse } from "next/server";
import { generateMockStage2Lock } from "@/lib/podcast/mockData";
import { callGemini, GEMINI_MODELS } from "@/lib/podcast/gemini";
import { callClaude } from "@/lib/podcast/claude";
import { resolveAnthropicKey, modeLabel } from "@/lib/podcast/key-resolver";

// ── Doctor Farmer Pipeline Stage 2 — Topic Lock Engine ───────────────────────
const SYSTEM = `You are Stage 2 — Topic Lock — of the Doctor Farmer MagicScript Podcast Pipeline.

Your job: lock one topic and define the angle. You do NOT research. You do NOT write content. You ONLY lock the topic and define the angle. Stage 2 is a 60-second review — not a form.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DOCTOR FARMER CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Creator: Dr. Prabhakar Raj — medical doctor, lifestyle reversal specialist, MHS founder (15,000+ students)
Platform: Podcast + Instagram Reels
Voice: Honest, warm, doctor-authority, myth-busting — Truth First always
Audience: 45+ Type 2 diabetics, South Indian families, PCOD/thyroid patients, people on medication
Funnel: Every episode bridges to lifestyle reversal and the MHS program

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 1 — CONFIRM LOCKED TOPIC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Use exactly the version the user approved. Never silently change the title.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 2 — BUILD THE ANGLE (4 components)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The angle = HOW the topic is handled, not WHAT.

FRAME (1 sentence): "A [descriptor] that [does]"
By category:
MYTH: "A doctor-led myth correction that separates [dangerous belief] from [clinical evidence]"
PROBLEM: "A patient-safety-first warning that reveals [hidden consequence] most miss"
FAQ: "A direct clinical answer to the question every [specific type] is asking"
CONTRARIAN: "A data-backed challenge to [mainstream advice]"
CLINICAL: "An evidence-first breakdown of what Indian research actually shows"

PROMISE (2 sentences):
Sentence 1: What they will KNOW after watching
Sentence 2: What generic sources never explain

DOCTOR FARMER AUTHORITY (1 sentence):
"Doctor Farmer brings [specific thing] that [generic creators] cannot access or claim."
Must be concrete — not just "he is a doctor."

SAFETY FLAG (1 sentence):
If risk: "Safety boundary: [who] must not [X] because [consequence]."
If no risk: "Safety flag: None."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 3 — GENERATE 4 PILLARS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Each pillar: 2-word Title Case name + commits (1 sentence) + stage3_impact + stage4_impact + stage6_impact + stage8_impact

PILLAR ARCHETYPES BY CATEGORY:
MYTH: Truth First · Myth Named · [South Indian Anchored / Authority Specific / Safety Critical] · Reversal Bridge
PROBLEM: Problem Revealed · Patient Evidence · Warning Specific · Action Clear
FAQ: Question Honoured · India Specific · Nuance Protected · Next Step Clear
CONTRARIAN: Claim Upfront · Evidence Grounded · Mainstream Fair · Action Bridge
CLINICAL DEEP DIVE: Evidence Exact · India Lens · Honest Uncertainty · Patient Practical

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SILENT TASKS (run internally — NOT shown to user, but included in JSON output)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AUDIENCE PORTRAITS: primary (specific person, age, situation, fear, what they tried that did not work) · secondary (related person, different entry point) · forward_sharer (who shares it and why)
CARRY-FORWARD SIGNALS for stages 3-9 (see schema in JSON output).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HARD RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Never change title without user instruction
2. Angle = HOW not WHAT
3. Pillars use category-specific archetypes
4. Audience portraits + carry-forward included in JSON but NOT shown to user in UI
5. Safety Flag must be specific, not vague
6. Stage 2 never approves itself
7. If Stage 1 weakness was Competition Gap or DF Fit, the angle must address that weakness

Output valid JSON only. No markdown. No code fences.`;

function buildPrompt({ topic_title, category, stage1_score, biggest_weakness, reframe, version }) {
  return `TOPIC LOCK REQUEST:
Topic title: ${topic_title}
Category: ${category}
Stage 1 score: ${stage1_score} / 100
Stage 1 biggest weakness: ${biggest_weakness ?? "Not provided"}
Stage 1 reframe suggestion: ${reframe ?? "Not provided"}
Version to lock: ${version ?? "Original"}

Generate the complete Stage 2 Topic Lock document as valid JSON (no markdown, no code fences).

HARD RULES:
1. Never change the topic title. Use exactly: "${topic_title}"
2. angle.frame must be a commitment to HOW the topic is handled — not a summary of WHAT the topic is.
3. Every pillar must have specific stage3_impact, stage4_impact, stage6_impact, stage8_impact.
4. audience.primary must name a specific person with a specific age, situation, and pain.
5. If Stage 1 biggest weakness was Competition Gap or Doctor Farmer Fit, the angle must directly address it.

JSON SCHEMA:
{
  "locked_topic": "${topic_title}",
  "category": "${category}",
  "stage1_score": ${stage1_score},
  "version_locked": "${version ?? "Original"}",
  "angle": {
    "frame": "1 sentence commitment to the HOW",
    "promise": "2 sentences — what they know after watching; what generic sources never explain",
    "authority": "1 sentence — Doctor Farmer's specific credibility for this topic",
    "safety_flag": "1 sentence — specific risk OR: Safety flag: None — this topic carries no direct patient safety risk"
  },
  "pillars": [
    {
      "name": "Two Words",
      "commits": "1 sentence specific commitment for this topic",
      "stage3_impact": "1 sentence — how this pillar shapes question discovery",
      "stage4_impact": "1 sentence — how this pillar shapes research",
      "stage6_impact": "1 sentence — how this pillar shapes answer writing",
      "stage8_impact": "1 sentence — how this pillar shapes final script"
    },
    { "name": "Two Words", "commits": "...", "stage3_impact": "...", "stage4_impact": "...", "stage6_impact": "...", "stage8_impact": "..." },
    { "name": "Two Words", "commits": "...", "stage3_impact": "...", "stage4_impact": "...", "stage6_impact": "...", "stage8_impact": "..." },
    { "name": "Two Words", "commits": "...", "stage3_impact": "...", "stage4_impact": "...", "stage6_impact": "...", "stage8_impact": "..." }
  ],
  "audience": {
    "primary": "specific Tamil Nadu person — age, situation, specific fear, what they tried that did not work",
    "secondary": "specific person with different entry point to the topic",
    "forward_sharer": "who they are, their relationship to a diabetic, why they share Doctor Farmer content"
  },
  "signals": {
    "stage3": {
      "prioritise": ["specific question type 1", "specific question type 2", "specific question type 3"],
      "avoid": "specific question type to exclude from discovery",
      "cultural_angle": "specific Tamil Nadu or South Indian question angle that must be included"
    },
    "stage4": {
      "evidence_type": "specific study type or data format this topic needs most",
      "indian_sources": "specific ICMR / NIN / Indian research angle relevant to this topic",
      "blue_experience": "specific clinical observation from Dr. Prabhakar's Tamil Nadu patient community to seek",
      "red_flag": "specific overclaimed or overhyped claim about this topic that Stage 4 must scrutinise"
    },
    "stage5": {
      "sequencing_logic": "how questions should be ordered for this specific angle",
      "myth_question_to_protect": "which question is most critical for this topic and must not be dropped"
    },
    "stage6": {
      "tone_constraint": "specific tone requirement for this angle",
      "structure_constraint": "specific answer structure requirement for this angle"
    },
    "stage7": {
      "demonstration_idea": "one specific prop or animation idea Dr. Prabhakar could use for this topic",
      "cta_timing": "where in the episode a CTA fits naturally for this specific angle",
      "superfood_suggestion": "one South Indian superfood that connects naturally to this episode topic"
    },
    "stage8": {
      "cold_open": "what the first 15 seconds of the script must do for this angle",
      "closing": "what the script must close with — the last thing heard before the CTA",
      "pillar_check": "which segment of the script carries each of the 4 pillars"
    },
    "stage9": {
      "follow_up_topic": "the single best follow-up reel this episode creates demand for",
      "best_reel_moment": "the one segment most likely to become a standalone viral reel"
    }
  }
}

All strings must be specific to the topic "${topic_title}" — not generic Doctor Farmer boilerplate.
Pillar names must be exactly 2 words in Title Case.
Primary audience portrait must name a specific person with a specific situation.

RESPONSE FORMAT: Return ONLY a valid JSON object with keys: "locked_topic", "category", "stage1_score", "angle" (frame/promise/authority/safety_flag), "pillars" (array of 4), "audience" (primary/secondary/forward_sharer), "signals" (stage3–stage9). No markdown. No explanation. No text before or after the JSON.`;
}

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}

  const {
    topic_title      = "Health Topic",
    category         = "Myth",
    stage1_score     = 80,
    biggest_weakness = null,
    reframe          = null,
    version          = "Original",
    topic_data       = null,
  } = body;

  const geminiKey    = req.headers.get("x-client-gemini-key");
  const anthropicKey = resolveAnthropicKey(req);

  try {
    // ── Demo mode ─────────────────────────────────────────────────
    if (!geminiKey && !anthropicKey) {
      await new Promise((r) => setTimeout(r, 1200));
      const mock = generateMockStage2Lock(
        topic_data ?? { title: topic_title, score: stage1_score, reframe, weakness: biggest_weakness }
      );
      return NextResponse.json({ ...mock, mode: "demo" });
    }

    const promptText = buildPrompt({ topic_title, category, stage1_score, biggest_weakness, reframe, version });
    const preferred  = req.headers.get("x-preferred-model") ?? "gemini";

    if (preferred === "claude") {
      if (anthropicKey) {
        const parsed = await callClaude(anthropicKey, SYSTEM, promptText, true, 8192);
        return NextResponse.json({ ...parsed, mode: modeLabel(req) });
      }
      if (geminiKey) {
        const parsed = await callGemini(geminiKey, GEMINI_MODELS.flash, SYSTEM, promptText, 0.6, 8192);
        return NextResponse.json({ ...parsed, mode: "gemini" });
      }
    } else {
      if (geminiKey) {
        const parsed = await callGemini(geminiKey, GEMINI_MODELS.flash, SYSTEM, promptText, 0.6, 8192);
        return NextResponse.json({ ...parsed, mode: "gemini" });
      }
      if (anthropicKey) {
        const parsed = await callClaude(anthropicKey, SYSTEM, promptText, true, 8192);
        return NextResponse.json({ ...parsed, mode: modeLabel(req) });
      }
    }
  } catch (e) {
    console.error("[stage2-lock] error:", e.message);
    if (geminiKey || anthropicKey) {
      return NextResponse.json({ error: e.message, mode: "error" }, { status: 500 });
    }
  }

  // ── Fallback (true demo — no keys) ────────────────────────────
  const mock = generateMockStage2Lock(
    topic_data ?? { title: topic_title, score: stage1_score, reframe, weakness: biggest_weakness }
  );
  return NextResponse.json({ ...mock, mode: "demo" });
}
