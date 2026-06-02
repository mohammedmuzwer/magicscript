import { NextResponse } from "next/server";
import { generateMockStage5Arc } from "@/lib/podcast/mockData";
import { callGemini, GEMINI_MODELS } from "@/lib/podcast/gemini";
import { callClaude } from "@/lib/podcast/claude";
import { resolveAnthropicKey, modeLabel } from "@/lib/podcast/key-resolver";

// ── Doctor Farmer Pipeline Stage 5 — Question Lock & Sequencing ──────────────
const SYSTEM = `You are Stage 5 — Question Lock & Sequencing — of the Doctor Farmer MagicScript Pipeline.

Three parts: A = Red decisions · B = Sequencing · C = Doctor reorder invitation

You do NOT write answers. You do NOT research. The order locked here is the EXACT ORDER Stage 6 writes answers. No reordering in Stage 6.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DOCTOR FARMER CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Creator: Dr. Prabhakar Raj — medical doctor, lifestyle reversal specialist, MHS founder
Every episode must bridge to lifestyle reversal and the MHS program
Audience: 45+ Type 2 diabetics and South Indian families managing diabetes
Truth First — no claim enters a script without evidence or explicit disclosure

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART A — RED CLAIM DECISIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Always recommend before asking. Never ask "what do you want?" without a recommendation.

OPTION 1: CONVERT_TO_MYTH_DISPROVEN — When Myth Ledger already disproves it.
OPTION 2: CONVERT_TO_MYTH_UNSETTLED_CLINICAL — When Dr. Prabhakar has a clinical position.
OPTION 3: CONVERT_TO_MYTH_UNSETTLED — When no consensus but question is high value.
OPTION 4: DROP — When no evidence + no clinical verdict + low Tamil Nadu social demand.
OPTION 5: FLAG_FOR_MYTH_CONVERSION — When high South Indian social demand even without evidence. Filter coffee + fasting = Tamil Nadu WhatsApp trigger = flag not drop.

BASE YOUR DECISION ON:
- Social demand: if the RED claim has very high Tamil Nadu demand, CONVERT or FLAG preserves credibility better than DROP
- DROP only when the question cannot be meaningfully addressed even with honest uncertainty

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART B — 7-SECTION SEQUENCING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE GOLDEN RULE: Start where the audience is, not where you want to be. Build like a warm conversation with a stranger.

ENGAGEMENT ARC:
0-9 min: Warm. Familiar. "I know this feeling."
10-18 min: Curious. "I didn't know that."
18-32 min: Engaged. "That explains everything."
32-40 min: Practical. "I can do this."
40-45 min: Energised. "I'm sharing this."

SECTION 1 — OPENING [fixed] ~4 min
Foundation F1, F2, F3. Zero jargon. Zero stats. Q1 must be answerable by anyone who has never heard the term. Cultural bridge always in Opening.

SECTION 2 — DISCOVERY [fixed] ~5 min
Foundation F4, F5 + 1 Green (most surprising). Body mechanism with one everyday analogy.

SECTION 3 — SCIENCE [flexible] ~7 min
Green + Yellow claims. One finding per answer. Yellow applies Stage 4 script rules exactly. DEMO TRIGGER 1 placed at most visual claim.

SECTION 4 — MYTH-BUSTING [flexible] ~7 min
All myth questions. State myth first verbatim. Interviewer uses "WhatsApp says..." framing.

SECTION 5 — SOLUTION [flexible] ~7 min
Myth-Unsettled + Clinical Verdict + Blue claim. Blue claim ALWAYS last in Section 5 — hero moment. DEMO TRIGGER 2 placed in this section.

SECTION 6 — PRACTICAL [flexible] ~6 min
Medication safety. Type 1 warning. Age-specific. Safety stated clearly and early — never buried.

SECTION 7 — RAPID FIRE [fixed] ~3 min
Max 2 sentences per answer. Verdict only. End with one memorable closing line.

DEMO TRIGGER RULES: Exactly 2 per episode. Demo 1: Section 3 (Science) · Demo 2: Section 5 (Solution)
BLUE CLAIM PLACEMENT: MUST go in Section 5 last. Never Science. Never Discovery.
OVERLAP RESOLUTION: For each flagged overlap: merge, keep both, or drop one.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART C — DOCTOR PRIORITY REORDERING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
After showing the full arc, always invite reorder in reorder_invitation field:
"You can reorder questions within sections or move a question to a different section. Tell me: 'Move Q[X] to Section [Y]' or 'Swap Q[X] and Q[Y]'"

NON-NEGOTIABLE RULES:
Q1 must always be the most basic question — no technical question can open the episode.
Rapid Fire questions stay in Rapid Fire. Blue hero stays last in Section 5 always.
Myth questions stay in Myth-Busting section.
FREE REORDER ZONES: Sections 3, 4, 5 (except Blue hero), 6

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HARD RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Q1 = most basic question always
2. Engagement arc is non-negotiable
3. Recommend before asking on Red claims
4. South Indian high-demand = myth conversion, not drop
5. Blue hero always Section 5 last
6. Part A before Part B — wait for confirmation
7. Part C reorder always offered
8. Locked order = Stage 6 write order — Stage 6 will NOT reorder
9. Demo triggers = exactly 2
10. Overlap = myth version wins
11. Section merge needs user approval
12. Last question gate reminder mandatory

OUTPUT FORMAT — valid JSON only, no markdown, no code fences:
{
  "red_decisions": [
    {
      "claim_id": "c-A5",
      "question_id": "A5",
      "question_text": "the question text",
      "claim": "the RED claim that could not be sourced",
      "decision": "CONVERT_TO_MYTH_DISPROVEN|CONVERT_TO_MYTH_UNSETTLED_CLINICAL|CONVERT_TO_MYTH_UNSETTLED|DROP|FLAG_FOR_MYTH_CONVERSION",
      "rationale": "1–2 sentences explaining the decision",
      "social_demand_tn": "High|Low",
      "replacement_question": "only if decision changes question text"
    }
  ],
  "arc": [
    {
      "section": "opening|discovery|science|myth|solution|practical|rapidfire",
      "section_label": "Opening|Discovery|Science|Myth-Busting|Solution|Practical Use Case|Rapid Fire",
      "fixed": true,
      "target_min": 4,
      "questions": [
        {
          "id": "A8",
          "text": "the question text",
          "grade": "GREEN",
          "note": "brief placement rationale — why this question is in this section"
        }
      ],
      "demo_trigger": false,
      "demo_note": "only if demo_trigger is true — specific prop or comparison Dr. Prabhakar could perform"
    }
  ],
  "overlap_resolutions": [
    {
      "overlap_description": "which questions overlap and how",
      "resolution": "what was decided and why",
      "kept_in_arc": "which IDs were kept and where"
    }
  ],
  "reorder_invitation": "You can reorder questions within sections or move a question to a different section. Tell me: 'Move Q[X] to Section [Y]' or 'Swap Q[X] and Q[Y]'. NON-NEGOTIABLE: Q1 stays Q1. Blue hero stays last in Section 5. Myth questions stay in Myth-Busting. Rapid Fire stays in Rapid Fire.",
  "total_questions": 0,
  "arc_summary": "2 sentences: RED decision(s) made, BLUE claim placement, demo trigger placement, total questions locked"
}`;

function buildPrompt({ locked_topic, category, stage3_data, stage4_data, signals }) {
  const allQ = stage3_data?.all_questions ?? [];
  const qList = allQ
    .map((q) => `- [${q.id}] type:${q.type} section_tag:${q.section_tag} "${q.text}"`)
    .join("\n");

  const redClaims  = stage4_data?.claims?.filter((c) => c.grade === "RED")  ?? [];
  const blueClaims = stage4_data?.claims?.filter((c) => c.grade === "BLUE") ?? [];
  const overlaps   = stage3_data?.overlaps ?? [];

  const redList  = redClaims.map((c) =>
    `- [${c.id}] Q:${c.question_id} claim:"${c.claim}" social_demand:"${c.social_demand ?? "not noted"}"`
  ).join("\n");

  const blueList = blueClaims.map((c) =>
    `- [${c.id}] Q:${c.question_id} "${c.claim}"`
  ).join("\n");

  return `SEQUENCING REQUEST:
Topic: ${locked_topic ?? "Health Topic"}
Category: ${category ?? "Myth"}
Stage 5 signals from Stage 2 lock: ${signals ? JSON.stringify(signals) : "Not provided"}

ALL QUESTIONS TO SEQUENCE (${allQ.length} total):
${qList || "(No questions provided)"}

RED CLAIMS REQUIRING PART A DECISIONS (${redClaims.length}):
${redList || "None — no RED claims, skip Part A"}

BLUE CLAIMS TO PLACE IN SOLUTION SECTION (${blueClaims.length}):
${blueList || "None"}

OVERLAPS TO RESOLVE FROM STAGE 3 (${overlaps.length}):
${overlaps.map((o, i) => `${i + 1}. ${o}`).join("\n") || "None flagged"}

HARD RULES:
1. Every question from the question bank must appear in the arc — unless dropped in Part A or merged in overlap resolution.
2. All myth-type questions go in the Myth-Busting section.
3. BLUE claims must be in Solution section — never Science or Discovery.
4. Exactly 2 demo triggers — one in Science, one in Solution.
5. Foundation questions (type:foundation) may be distributed across sections based on their section_tag.
6. Team placeholder questions (type:team) go in Rapid Fire unless their section_tag says otherwise.
7. Overlap resolutions must account for all overlaps flagged above.
8. arc_summary must specifically name the RED decision(s) made, the BLUE claim placement, and demo triggers.

RESPONSE FORMAT: Return ONLY a valid JSON object with keys: "red_decisions" (array), "arc" (array of 7 sections), "overlap_resolutions" (array), "reorder_invitation" (string), "total_questions" (number), "arc_summary" (string). No markdown. No explanation. No text before or after the JSON.`;
}

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}

  const {
    locked_topic = "Health Topic",
    category     = "Myth",
    stage3_data  = null,
    stage4_data  = null,
    signals      = null,
  } = body;

  const geminiKey    = req.headers.get("x-client-gemini-key");
  const anthropicKey = resolveAnthropicKey(req);

  try {
    // ── Demo mode ─────────────────────────────────────────────────
    if (!geminiKey && !anthropicKey) {
      await new Promise((r) => setTimeout(r, 1800));
      const mock = generateMockStage5Arc(stage3_data, stage4_data);
      return NextResponse.json({ ...mock, mode: "demo" });
    }

    const promptText = buildPrompt({ locked_topic, category, stage3_data, stage4_data, signals });
    const preferred  = req.headers.get("x-preferred-model") ?? "gemini";

    async function callGeminiPath() {
      const parsed = await callGemini(geminiKey, GEMINI_MODELS.flash, SYSTEM, promptText, 0.5, 8192);
      return NextResponse.json({ ...parsed, mode: "gemini" });
    }

    async function callAnthropicPath() {
      const parsed = await callClaude(anthropicKey, SYSTEM, promptText, true, 8192);
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
    console.error("[stage5-sequencing] error:", e.message);
    if (geminiKey || anthropicKey) {
      return NextResponse.json({ error: e.message, mode: "error" }, { status: 500 });
    }
  }

  // ── Fallback (true demo — no keys) ────────────────────────────
  const mock = generateMockStage5Arc(stage3_data, stage4_data);
  return NextResponse.json({ ...mock, mode: "demo" });
}
