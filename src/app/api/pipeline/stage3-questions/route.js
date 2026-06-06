import { NextResponse } from "next/server";
import { generateMockStage3Questions } from "@/lib/podcast/mockData";
import { callGemini, GEMINI_MODELS } from "@/lib/podcast/gemini";
import { callClaude } from "@/lib/podcast/claude";
import { resolveAnthropicKey, resolveGeminiKey, modeLabel } from "@/lib/podcast/key-resolver";

// ── Doctor Farmer Pipeline Stage 3 — Question Discovery ──────────────────────
const SYSTEM = `You are Stage 3 — Question Discovery — of the Doctor Farmer MagicScript Podcast Pipeline.

Your job: gather 25 questions across 4 categories. This happens BEFORE research. No filtering here. Filtering happens in Stage 5 after research.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DOCTOR FARMER CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Creator: Dr. Prabhakar Raj — medical doctor, lifestyle reversal specialist, MHS founder (15,000+ students)
Audience: 45+ Type 2 diabetics, South Indian families, PCOD patients, medication-dependent patients
Cultural context: Karthigai, Ramadan, Ekadasi, rice-based diet, filter coffee, late dinners

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6 QUESTION SOURCES — use all 6, show source
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Source 1 — Google Trends: rising queries
Source 2 — Ubersuggest / Answer the Public: question clusters
Source 3 — VidIQ / YouTube Comments: real unanswered questions from competitor video comments — goldmines
Source 4 — Quora: most upvoted questions + questions with no good answers
Source 5 — Instagram Competitor Reels: comment sections — unmet demand
Source 6 — Team-fed via Stage Chat: Dr. Prabhakar / R&D — always priority

Show which source each audience question came from. If a source returns 0 results — state that. Never silently skip a source.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUESTION CATEGORIES — 25 total
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CATEGORY 1 — FOUNDATION (5) [DEFAULT — always generate first]
Assume ZERO prior knowledge. Never wait for user request.
F1: What is [topic] in simple words?
F2: Cultural bridge — "Isn't [topic] something we already do in our culture? How is this different?" [TAG: Opening/Cultural bridge]
F3: Body mechanism — "What actually happens inside the body when [topic occurs]?"
F4: Why now — "Why are people suddenly saying [topic] can help [condition]?"
F5: Core distinction — "Is [topic] about X or Y?" (most common confusion)

CATEGORY 2 — AUDIENCE-DISCOVERED (12)
From all 6 sources. Must be keyword-anchored, phrased as audience actually asks — verbatim.
Must include: 1 medication-safety question · 1 long-term picture question · 1 Karthigai/Ramadan/Navratri/Ekadasi question (MANDATORY).

CATEGORY 3 — MYTH-BUSTING (5) [DESIGNED]
Not from search — designed to bust dangerous beliefs.
Format: "[Specific wrong belief] — true or false?"
Must include 1 medication myth ("I can stop tablets if I do X").

CATEGORY 4 — TEAM-FED (3 slots reserved)
Reserved for Dr. Prabhakar or R&D. If no team questions: fill with backup audience questions (placeholder: true).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OVERLAP DETECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Flag overlaps between audience and myth questions that cover the same ground. Never drop either. Stage 5 decides.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HARD RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Foundation questions DEFAULT — always 5, never wait for user
2. South Indian cultural question is mandatory
3. Show source for every audience question
4. Use all 6 sources — state 0 results if none found
5. No filtering at this stage
6. Flag overlaps — never drop either
7. Apply Stage 2 carry-forward signals
8. Medication safety question is mandatory
9. Team-fed questions have priority always
10. Every episode assumes zero prior knowledge

Output valid JSON only. No markdown. No code fences.`;

function buildPrompt({ locked_topic, category, frame, pillars, signals }) {
  const pillarNames = pillars?.map((p, i) => `P${i + 1}: ${p.name} — ${p.commits}`).join("\n") ?? "";
  const cf = signals?.stage3 ?? {};
  return `QUESTION DISCOVERY REQUEST:
Locked topic: ${locked_topic}
Category: ${category}
Locked angle: ${frame}
Pillars:
${pillarNames}

Carry-forward signals from Stage 2:
Prioritise: ${JSON.stringify(cf.prioritise ?? [])}
Avoid: ${cf.avoid ?? "Not specified"}
Cultural angle: ${cf.cultural_angle ?? "Include at least 1 South Indian religious fasting question"}

Generate 25 questions as valid JSON (no markdown, no code fences):

{
  "locked_topic": "${locked_topic}",
  "all_questions": [],
  "foundation": [
    { "id": "F1", "text": "question text", "section_tag": "Opening", "type": "foundation" },
    { "id": "F2", "text": "...", "section_tag": "Opening", "type": "foundation" },
    { "id": "F3", "text": "...", "section_tag": "Discovery", "type": "foundation" },
    { "id": "F4", "text": "...", "section_tag": "Discovery", "type": "foundation" },
    { "id": "F5", "text": "...", "section_tag": "Discovery", "type": "foundation" }
  ],
  "audience": [
    { "id": "A1", "text": "question verbatim as audience asks", "section_tag": "Science|Solution|Practical|Rapid Fire", "source": "Google Trends|Ubersuggest|Answer the Public|YouTube Comments|Quora|Instagram Comments", "type": "audience" }
  ],
  "myth": [
    { "id": "M1", "text": "[specific myth] — true or false?", "section_tag": "Myth-Busting", "type": "myth" },
    { "id": "M2", "text": "...", "section_tag": "Myth-Busting", "type": "myth" },
    { "id": "M3", "text": "...", "section_tag": "Myth-Busting", "type": "myth" },
    { "id": "M4", "text": "[medication myth] — true or false?", "section_tag": "Myth-Busting", "type": "myth" },
    { "id": "M5", "text": "...", "section_tag": "Myth-Busting", "type": "myth" }
  ],
  "team": [
    { "id": "T1", "text": "", "section_tag": "Rapid Fire", "source": "team", "type": "team", "placeholder": true },
    { "id": "T2", "text": "", "section_tag": "Rapid Fire", "source": "team", "type": "team", "placeholder": true },
    { "id": "T3", "text": "", "section_tag": "Rapid Fire", "source": "team", "type": "team", "placeholder": true }
  ],
  "overlaps": ["describe any overlapping questions here, or empty array if none"]
}

IMPORTANT: Populate all_questions as the flat array of all 25 questions (foundation + audience + myth + team combined).
Topic: "${locked_topic}". MANDATORY: Include 1 Karthigai/Ramadan/Ekadasi question in audience list. Include 1 medication-safety question. Include 1 medication myth in myth list.

RESPONSE FORMAT: Return ONLY a valid JSON object with keys: "foundation" (array), "audience" (array), "myth" (array), "team" (array), "all_questions" (flat array of all), "overlaps" (array). No markdown. No explanation. No text before or after the JSON.`;
}

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}

  const {
    locked_topic = "Health Topic",
    category     = "Myth",
    frame        = "",
    pillars      = [],
    signals      = {},
  } = body;

  const geminiKey    = resolveGeminiKey(req);
  const anthropicKey = resolveAnthropicKey(req);

  try {
    // ── Demo mode ─────────────────────────────────────────────────
    if (!geminiKey && !anthropicKey) {
      await new Promise((r) => setTimeout(r, 1500));
      const questions = generateMockStage3Questions({ title: locked_topic, category });
      return NextResponse.json({ ...questions, locked_topic, mode: "demo" });
    }

    const promptText = buildPrompt({ locked_topic, category, frame, pillars, signals });
    const preferred  = req.headers.get("x-preferred-model") ?? "gemini";

    async function callGeminiPath() {
      const parsed = await callGemini(geminiKey, GEMINI_MODELS.flash, SYSTEM, promptText, 0.6, 8192);
      if (!parsed.all_questions?.length) {
        parsed.all_questions = [
          ...(parsed.foundation ?? []),
          ...(parsed.audience   ?? []),
          ...(parsed.myth       ?? []),
          ...(parsed.team       ?? []),
        ];
      }
      return NextResponse.json({ ...parsed, mode: "gemini" });
    }

    async function callAnthropicPath() {
      const parsed = await callClaude(anthropicKey, SYSTEM, promptText, true, 8192);
      if (!parsed.all_questions?.length) {
        parsed.all_questions = [
          ...(parsed.foundation ?? []),
          ...(parsed.audience   ?? []),
          ...(parsed.myth       ?? []),
          ...(parsed.team       ?? []),
        ];
      }
      return NextResponse.json({ ...parsed, mode: modeLabel(req) });
    }

    if (preferred === "claude") {
      if (anthropicKey) return await callAnthropicPath();
      if (geminiKey)    return await callGeminiPath();
    } else {
      if (geminiKey)    return await callGeminiPath();
      if (anthropicKey) return await callAnthropicPath();
    }
  } catch (e) {
    console.error("[stage3-questions] error:", e.message);
    if (geminiKey || anthropicKey) {
      return NextResponse.json({ error: e.message, mode: "error" }, { status: 500 });
    }
  }

  // ── Fallback (true demo — no keys) ────────────────────────────
  const questions = generateMockStage3Questions({ title: locked_topic, category });
  return NextResponse.json({ ...questions, locked_topic, mode: "demo" });
}
