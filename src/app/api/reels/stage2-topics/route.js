import { NextResponse } from "next/server";
import { generateMockStage2Topics } from "@/lib/reels/mockStage2Topics";
import { reelsLlmCall } from "@/lib/reels/llm";

// ── Doctor Farmer Validation Engine v2 — 5-Category, 4-Criterion System ──────
const SYSTEM = `You are the Doctor Farmer Content Validation Engine — a topic scoring and generation system built specifically for Dr. Prabhakar Raj (Doctor Farmer), a medical doctor, lifestyle reversal specialist, and founder of My Health School (MHS) with 15,000+ students across India, primarily Tamil Nadu.

DOCTOR FARMER CONTEXT:
- Platform: Instagram Reels (primary) + Podcast
- Core audience: Diabetics, pre-diabetics, PCOD/thyroid patients, Indian families aged 35–60, South Indian food culture
- Core message: Food is medicine. Lifestyle reversal without lifelong drugs.
- Funnel goal: Every topic must lead toward MHS webinar or consultation
- Authority: Clinical credibility + Tamil Nadu patient community — no generic fitness creator can replicate this
- Cultural context: Idli, rice, biryani, filter coffee, late dinners, Karthigai, Ramadan, Navratri, Ekadasi, festival eating, family food pressure

KEYWORD ANCHORING — MOST IMPORTANT RULE:
Every topic MUST satisfy at least one anchor:
- ANCHOR A (Direct): The keyword appears in the topic title
- ANCHOR B (Derivative): The topic is a direct sub-topic or consequence of the keyword, connection stated in description
- ANCHOR C (Cultural): The keyword intersects with a South Indian cultural practice, connection made explicit

HARD REJECTION: Topics that fail all three anchors are REJECTED before scoring.

5 CATEGORIES (25 topics total):

CATEGORY 1 — MYTH (5 topics: 3 false_myth + 2 true_myth)
False Myth: debunks dangerous misconceptions about the keyword
True Myth: validates overlooked truths patients suspect but cannot confirm

CATEGORY 2 — PROBLEM (5 topics)
Problem + Solution format. Reveals a hidden danger or silent issue, AND hints at the fix.
Topic description MUST mention both the problem AND what the viewer can do about it (the solution angle).
Structure: Hook → Hidden Problem → Why Ignored → The Fix

CATEGORY 3 — FAQ (5 topics)
Answers the exact questions patients type into Google / WhatsApp, with doctor authority

CATEGORY 4 — CONTRARIAN (5 topics)
Challenges mainstream advice; creates debate, comments, and shares

CATEGORY 5 — CLINICAL (5 topics)
Uses Doctor Farmer's unique clinical authority — patient data, Indian research, Tamil Nadu specificity

SCORING FORMULA — 4 CRITERIA:
1. demand (35%): search volume + Google Trends + Answer the Public question density
2. social (40%, HIGHEST): Instagram save/share/comment/scroll-stop potential
3. competition_gap (20%): open space for Doctor Farmer's doctor-authority angle specifically
4. fit (20%): audience match (diabetics/PCOD/35–60) + MHS funnel path + South Indian cultural specificity

FORMULA: score = Math.round(((demand*0.35 + social*0.40 + competition_gap*0.20 + fit*0.20) / 115) * 100)
VERDICTS: 70–100 = APPROVED | 50–69 = REFRAME REQUIRED | 0–49 = REJECTED

HARD RULES:
- Social Demand (40%) always outweighs Demand (35%)
- Competition Gap is ALWAYS a separate scored field
- Religious fasting topics (Karthigai/Ramadan/Ekadasi/Navratri) must appear when relevant
- Every score must be mathematically correct per the formula`;

function buildPrompt(keyword) {
  return `Generate exactly 25 Doctor Farmer validated topics for the keyword: "${keyword}"

5 categories — 5 topics each:
- myth: { false_myth: [3 topics], true_myth: [2 topics] }
- problem: [5 topics]
- faq: [5 topics]
- contrarian: [5 topics]
- clinical: [5 topics]

For every topic include:
- anchor_type: "A" | "B" | "C" (keyword anchoring rule)
- anchor_note: one sentence showing how the topic connects to the keyword
- title: see TITLE FORMAT RULES below
- description: 2 sentences — what the content covers and why it scores well for Doctor Farmer
- demand: 0–100
- social: 0–100
- competition_gap: 0–100
- fit: 0–100
- score: Math.round(((demand*0.35 + social*0.40 + competition_gap*0.20 + fit*0.20) / 115) * 100)

TITLE FORMAT RULES — CRITICAL:
⚠️ NEVER start any title with "Will". Titles starting with "Will" are REJECTED.
Write titles as bold declarative statements, shocking revelations, or specific how/why/should questions.

myth (false_myth): Provocative false-claim debunker.
  Format: "[Widespread belief about ${keyword}] — Here's what science actually says"
  OR: "Why your doctor's advice about ${keyword} might be making things worse"
  Examples: "Eating rice once a day won't spike your insulin — the real culprit is this" | "Avoiding ${keyword} completely is the worst thing a diabetic can do"

myth (true_myth): Overlooked-truth validator.
  Format: "The ${keyword} truth patients know but doctors don't confirm"
  OR: "Science finally proves what South Indian grandmothers always said about ${keyword}"
  Examples: "Morning ${keyword} before breakfast is actually better for insulin" | "Traditional ${keyword} preparation actually lowers glycemic response"

problem: Hidden danger + implied solution.
  Format: "The silent ${keyword} problem destroying your [health outcome] — and how to fix it"
  OR: "Why your ${keyword} levels aren't improving despite doing everything right"
  The description MUST include what the viewer can do about it (the solution hint).
  Examples: "The hidden ${keyword} pattern causing midnight sugar spikes in diabetics — and the 2-minute fix" | "Your ${keyword} is silently raising your cortisol — here's the reversal protocol"

faq: Direct answer question (use How/Why/Should/What/Can/Is — NOT "Will").
  Format: "Why is my ${keyword} not working even with medication?"
  OR: "Should diabetics really avoid ${keyword} completely?"
  Examples: "How much ${keyword} is safe for a Type 2 diabetic?" | "Is ${keyword} after 6pm different from morning ${keyword}?"

contrarian: Bold counter-mainstream statement.
  Format: "Stop blaming ${keyword} — the real diabetes trigger nobody talks about"
  OR: "Everything you were told about ${keyword} is backwards"
  Examples: "Avoiding ${keyword} is making your insulin resistance worse, not better" | "Your dietitian's ${keyword} advice is based on 1970s research"

clinical: Specific clinical finding or data.
  Format: "New ICMR data changes everything about ${keyword} and blood sugar reversal"
  OR: "What 500 South Indian patients taught us about ${keyword} and diabetes"
  Examples: "Tamil Nadu patient study: ${keyword} reverses pre-diabetes markers in 90 days" | "AIIMS data shows ${keyword} protocol outperforms standard diabetic diet"

Scoring guides:
- demand: rising 12+ months = 80–100 | flat high volume = 60–79 | falling/niche = 0–59
- social: myth-busters/problem-reveals = 88–96 | FAQ + religious fasting intersection = 90–98 | general tips = 30–50
- competition_gap: generic creators only, doctor-authority gap open = 70–90 | almost no doctors = 90–100 | other doctors active = 20–50
- fit: diabetic/PCOD + MHS funnel + South Indian food = 90–100 | partial match = 50–69

Religious fasting rule: include at least 1 topic connecting to Karthigai/Ramadan/Ekadasi/Navratri for fasting-related keywords.

Return ONLY valid JSON — no markdown, no code fences:
{
  "myth": {
    "false_myth": [{"anchor_type":"A","anchor_note":"...","title":"...","description":"...","demand":0,"social":0,"competition_gap":0,"fit":0,"score":0}],
    "true_myth": [...]
  },
  "problem":    [{"anchor_type":"A","anchor_note":"...","title":"...","description":"...","demand":0,"social":0,"competition_gap":0,"fit":0,"score":0}],
  "faq":        [...],
  "contrarian": [...],
  "clinical":   [...]
}

Scores must be mathematically correct. false_myth must have exactly 3 items. true_myth must have exactly 2 items. All other arrays must have exactly 5 items.`;
}

function sliceToCategory(full, category) {
  if (!category) return full;
  if (category === "myth") return { myth: full.myth };
  return { [category]: full[category] };
}

export async function POST(req) {
  let keyword  = "health";
  let category = null;

  try {
    const body = await req.json();
    keyword  = body.keyword  || "health";
    category = body.category || null;

    const { parsed, source, fallback_from, fallback_reason } = await reelsLlmCall(req, {
      system:      SYSTEM,
      user:        buildPrompt(keyword),
      temperature: 0.7,
      maxTokens:   4096,
      isJson:      true,
    });

    if (parsed) {
      return NextResponse.json({
        topics: parsed,
        mode:   source,
        ...(fallback_from ? { fallback_from, fallback_reason } : {}),
      });
    }
  } catch (e) {
    console.error("[stage2-topics] error:", e.message);
  }

  await new Promise((r) => setTimeout(r, 800));
  return NextResponse.json({ topics: generateMockStage2Topics(keyword), mode: "demo" });
}
