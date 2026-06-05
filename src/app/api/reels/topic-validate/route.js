import { NextResponse } from "next/server";
import { generateMockValidation } from "@/lib/reels/mockValidation";
import { reelsLlmCall } from "@/lib/reels/llm";

// ── Doctor Farmer Validation Engine v2 — Single-Topic Deep Report ────────────
const SYSTEM = `You are the Doctor Farmer Content Validation Engine for Dr. Prabhakar Raj — a medical doctor, lifestyle reversal specialist, and founder of My Health School (MHS), Tamil Nadu.

Your ONLY job: produce a full validation report for ONE topic with Biggest Weakness, Reframe (with delta), Verify, and Opening Line.

DOCTOR FARMER CONTEXT:
- Platform: Instagram Reels | Core audience: Diabetics, pre-diabetics, PCOD/thyroid, Indian families 35–60
- Core message: Food is medicine. Lifestyle reversal without lifelong drugs.
- Funnel: Every reel leads toward MHS webinar or consultation
- Authority: Clinical credibility + Tamil Nadu patient community + lived reversal stories

4 CRITERIA (same weights apply):
1. demand (35%): search volume + Google Trends + Answer the Public
2. social (40%, HIGHEST): Instagram save/share/comment/scroll-stop potential
3. competition_gap (20%): open doctor-authority space not owned by credentialed Indian creators
4. fit (20%): audience match (diabetics/PCOD/35–60) + MHS funnel + South Indian cultural specificity

FORMULA: score = Math.round(((demand*0.35 + social*0.40 + competition_gap*0.20 + fit*0.20) / 115) * 100)

REFRAME RULES — ALL MUST BE SATISFIED:
1. Must contain the original keyword or its direct derivative
2. Must have a scroll-stop hook built into the title itself
3. Must use Doctor Farmer's specific authority — something only a doctor with a patient community can say
4. Must speak to a specific person (diabetic, Tamil mother, sugar patient) not a generic audience
5. Must connect to: blood sugar, lifestyle reversal, food as medicine, South Indian habits, MHS, or patient safety
6. Must be re-scored — reframe score MUST be at least 5 points higher than original
7. If reframe score is less than 5 points higher, rewrite until it scores at least +5

REFRAME TITLE PATTERNS THAT WORK BEST:
→ "I've seen [N] diabetic patients try [keyword]. Here's what the research actually shows — and the [N] types who should never do it."
→ "[keyword] — what I tell my Tamil Nadu patients every single day"
→ "Stop [keyword]ing the wrong way — the mistake [N]% of South Indian diabetics make"
→ "The [keyword] truth your doctor probably skipped — [reason it was skipped]"

BIGGEST WEAKNESS FORMAT:
BIGGEST WEAKNESS: [Criterion name] — [1–2 sentences: what exactly is weak and why it matters for THIS specific topic]
The criterion named must be the actual lowest-scoring one.`;

function buildPrompt({ topic, tabId, demand, social, competition_gap, fit, score }) {
  const verdict =
    score >= 70 ? "APPROVED" :
    score >= 50 ? "REFRAME REQUIRED" : "REJECTED";

  return `TOPIC TO VALIDATE:
Title: ${topic}
Category: ${tabId}
Original scores: demand=${demand}, social=${social}, competition_gap=${competition_gap}, fit=${fit}
Original score: ${score} / 100 (${verdict})

Produce the full validation report as valid JSON (no markdown, no code fences):
{
  "biggest_weakness": "CriterionName — 1-2 sentences on exactly what is weak and why it limits this specific topic",
  "reframe": {
    "title": "reframed title — must be meaningfully different, scroll-stop hook in the title itself, Doctor Farmer authority embedded",
    "why_stronger": "one sentence — what specifically improved vs the original",
    "demand": 0,
    "social": 0,
    "competition_gap": 0,
    "fit": 0,
    "score": 0,
    "delta": 0
  },
  "verify": {
    "ubersuggest": "2–4 word search phrase a patient in India would type — e.g. 'diabetes fasting India' NOT 'diabetes does India'",
    "reddit_search": "2–4 word phrase that matches how patients title Reddit posts — e.g. 'intermittent fasting diabetes' NOT brand names or doctor names",
    "google_trends": "two specific terms to compare separated by ' vs ' — e.g. 'intermittent fasting vs keto for diabetes' — both must be real searchable phrases",
    "seo_angle": "a long-tail keyword gaining SEO traction in Indian health search in 2024 — e.g. 'diabetes diet plan South Indian' or 'blood sugar fasting protocol India'"
  },
  "opening_line": "First 3 seconds — exact sentence that stops the scroll. Must: be specific to Tamil Nadu / South India, create immediate relevance for a diabetic viewer, use Doctor Farmer's clinical voice, NOT start with 'Today I will talk about'. Can be Tanglish."
}

Rules:
- biggest_weakness must name the EXACT lowest-scoring criterion (demand / social / competition_gap / fit)
- reframe.score must be calculated correctly: Math.round(((d*0.35+s*0.40+cg*0.20+f*0.20)/115)*100)
- reframe.delta = reframe.score - ${score}  — this MUST be ≥ 5
- If delta < 5, rewrite the reframe title and increase the scores until delta ≥ 5
- opening_line must mention a specific Tamil Nadu food, condition, or situation — no generic global wellness
- All scores 0–100, all fields required, no null values`;
}

export async function POST(req) {
  let body = {};
  try {
    body = await req.json();
  } catch {}

  const {
    topic          = "health topic",
    tabId          = "education",
    demand         = 75,
    social         = 75,
    competition_gap= 75,
    fit            = 75,
    score          = 75,
  } = body;

  if (!topic?.trim()) {
    return NextResponse.json({ error: "topic is required" }, { status: 400 });
  }

  try {
    const promptText = buildPrompt({ topic, tabId, demand, social, competition_gap, fit, score });

    const { parsed, source, fallback_from, fallback_reason } = await reelsLlmCall(req, {
      system:      SYSTEM,
      user:        promptText,
      temperature: 0.65,
      maxTokens:   1500,
      isJson:      true,
    });

    if (parsed) {
      if (parsed.reframe && parsed.reframe.delta === undefined) {
        parsed.reframe.delta = (parsed.reframe.score ?? score) - score;
      }
      if (parsed.reframe) parsed.reframe._originalScore = score;
      return NextResponse.json({
        ...parsed,
        mode: source,
        ...(fallback_from ? { fallback_from, fallback_reason } : {}),
      });
    }
  } catch (e) {
    console.error("[topic-validate] error:", e.message);
  }

  // ── Fallback ──────────────────────────────────────────────────
  const mock = generateMockValidation(
    { title: topic, demand, social, competition_gap, fit, score },
    tabId
  );
  return NextResponse.json({ ...mock, mode: "demo" });
}
