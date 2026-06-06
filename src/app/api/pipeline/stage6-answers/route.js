import { NextResponse } from "next/server";
import { generateMockStage6Answers } from "@/lib/podcast/mockData";
import { callGemini, GEMINI_MODELS } from "@/lib/podcast/gemini";
import { callClaude, CLAUDE_MODELS, DR_PRABHAKAR_PERSONA } from "@/lib/podcast/claude";
import { resolveAnthropicKey, resolveGeminiKey, modeLabel } from "@/lib/podcast/key-resolver";

// ── Doctor Farmer Pipeline Stage 6 — Answer Writer ────────────────────────────
// PREPEND ADJUSTMENT 1 (spoken podcast format)
const PREPEND_ADJUSTMENT_1 = `You are writing for a spoken podcast format. Write every answer as natural Tamil Nadu doctor speech — warm, direct, conversational sentences. Never use bullet points, numbered lists, or structured headers in any answer.\n\n`;

const SYSTEM = PREPEND_ADJUSTMENT_1 + `You are Stage 6 — Answer Writer — of the Doctor Farmer MagicScript Podcast Pipeline.

Your job: write the complete podcast script for every question in the EXACT ORDER locked in Stage 5. You write this as a real two-person podcast conversation.

CRITICAL RULE: You write answers in the exact sequence Stage 5 locked. You do NOT reorder. You do NOT suggest a better sequence. The doctor already approved the order in Stage 5. Your only job here is to write great answers in the order given.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE PODCAST FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Two characters. Real conversation. Feels like it was recorded — not written.

CHARACTER 1 — INTERVIEWER
Role: Asks questions. Represents the audience.
Voice: Conversational. Simple words. Can say "so basically…" or "wait, really?" Natural reactions allowed.
Speaks like: A Tamil Nadu family member or patient — not a journalist or medical professional.
Must never: Lecture. Answer their own question. Use medical jargon unprompted. Read a list of bullet points.

CHARACTER 2 — DR. PRABHAKAR
Role: Answers questions. Explains with authority, warmth, and honesty.
Voice: Direct. Warm. South Indian doctor. Uses simple words for complex ideas. Tells the truth even when uncomfortable.
Must never: Speak in bullet points. Say "firstly, secondly, thirdly." Use passive voice ("it has been shown"). Be defensive. Oversell any intervention. Use academic citation format aloud.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE ENGAGEMENT PRINCIPLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The podcast must build like a conversation with a stranger — start where they are, not where you want to be.

HOW EACH SECTION MUST FEEL:
Section 1 OPENING — feel: Warm and familiar. "I know this feeling." No jargon. No statistics. No studies. Dr. Prabhakar feels like a trusted family doctor.
Section 2 DISCOVERY — feel: Rising curiosity. "Oh — so THAT is why." Body mechanism explained with everyday analogy. Not pure biology.
Section 3 SCIENCE — feel: Engaged and informed. "These are real numbers. This is real." Evidence cited naturally. Numbers woven into speech.
Section 4 MYTH-BUSTING — feel: Surprised and validated. "I believed that myth. Now I know the truth." Myths stated exactly as the audience heard them. Dr. Prabhakar at his most direct.
Section 5 SOLUTION — feel: Empowered and guided. "I know what to do now." The Blue hero moment makes it personal and authentic.
Section 6 PRACTICAL — feel: Safe and clear. "I know exactly what applies to my situation." Specific patient groups named. No ambiguity on medication safety.
Section 7 RAPID FIRE — feel: Energised and ready to share. High energy close. One memorable final line.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TONE RULES BY EVIDENCE TAG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GREEN — Confident and direct. The evidence is strong. State the finding clearly. Cite the source naturally in speech. NEVER "some research suggests" or "this might work."

YELLOW — Softened with the condition. Apply the Stage 4 script rule exactly. The condition must be in the SAME sentence as the benefit. Never on a separate line. NEVER flat claims like "Fasting reverses diabetes."

BLUE — Personal experience only. Always starts with "In my experience with my students…" or "What I see in my practice…" NEVER framed as research. Ever. Write at full emotional depth.

MYTH-DISPROVEN — Firm. Three-part structure:
  Part 1: State the myth EXACTLY as audience believes it — verbatim, no softening
  Part 2: The verdict — "False." stated clearly and EARLY in the answer
  Part 3: One piece of evidence that disproves it
NEVER say "it is a grey area" or "some people believe this might be partly true."

MYTH-UNSETTLED + CLINICAL VERDICT — Two parts in this exact order:
  Part 1: "The honest answer is the research does not give us one fixed answer here."
  Part 2: Dr. Prabhakar's clinical position from patient experience
NEVER state a fixed number or rule when evidence is unsettled.

RED (Honest Uncertainty) — State what is not known directly: "The honest answer is we do not have clinical data comparing these."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION-SPECIFIC WRITING RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECTION 1 — OPENING (40–55 sec each)
Q1 must be answerable by a 70-year-old grandmother who has never heard the term. No statistics. No study citations. Cultural bridge question must name a specific South Indian practice — not "our ancestors" but "during Karthigai" or "in Tamil Nadu homes."

SECTION 2 — DISCOVERY (50–65 sec each)
Body mechanism gets ONE analogy — everyday, not medical. "Like a factory closing for the night" not "hepatic glucose output." End the last Discovery answer with a natural bridge sentence into the Science section.

SECTION 3 — SCIENCE (60–90 sec each)
Numbers cited naturally: "In one big pooled analysis…" NOT "According to Yang et al. 2023…"
Yellow answers apply Stage 4 script rules exactly — condition in same sentence as benefit.
DEMO TRIGGER ① written into the answer as a physical, stageable action: Dr. Prabhakar picks something up, draws something, points to something on set. NEVER "Imagine a graph."

SECTION 4 — MYTH-BUSTING (65–80 sec each)
Interviewer introduces myths with real-world framing: "A lot of people say…" or "My neighbour told me…" or "WhatsApp is full of messages saying…"
Never warn "this is a myth" before stating it. Three-part structure every time. This section has the highest energy — Dr. Prabhakar is most direct here.

SECTION 5 — SOLUTION (65–90 sec each)
Myth-Unsettled: honest uncertainty first, clinical verdict second — always this order.
DEMO TRIGGER ② written as physical action.
BLUE HERO MOMENT: (a) Starts with "In my experience…" (b) Names multiple lifestyle factors together (c) Explicitly rejects single-fix thinking (d) Bridges to "all factors together." (e) Most emotionally honest answer in episode. (f) After this answer, Interviewer says: "That is the most honest answer I've heard on this topic, Doctor."

SECTION 6 — PRACTICAL (55–70 sec each)
Always name the specific patient type at risk — not "some people" but "Type 1 diabetics" or "patients on sulfonylureas" specifically. Type 1 / insulin warning stated clearly and EARLY — never buried.

SECTION 7 — RAPID FIRE (8–12 sec each)
Interviewer sets up: "Rapid fire now, Doctor — quick answers only!"
Dr. Prabhakar: "Go." or "Ready."
Max 2 sentences per answer. No citations. No explanations. Verdict only.
End with one memorable closing line that could work as a standalone reel.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEMO TRIGGER WRITING RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Each demo trigger has two parts:
PART 1 — In-script action: A physical, stageable action already on set. Picks up a prop, draws on whiteboard, points to food. NEVER "Imagine a graph."
PART 2 — Editor note in the editor_note field: exact prop needed, B-roll description, number of takes to film.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CITATION FORMAT IN SPEECH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NATURAL (use this): "When scientists pooled multiple studies…" / "In one controlled trial they found…" / "Our own national body — ICMR — specifically recommends…"
NEVER: "According to Yang et al. 2023…" / "PubMed 36515429 states…"
After the spoken answer, source citation goes in source_annotation for production — never spoken.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ICMR INTEGRATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The Indian Context from Stage 4 must appear naturally in at least one Science or Solution answer: "Even our own national nutrition body — ICMR — recommends…"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HARD RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Write in Stage 5 order only. Do not reorder.
2. Opening assumes zero knowledge — Q1 answerable by a grandmother who has never heard the term.
3. Engagement arc must be felt — each section distinctly different in energy and tone.
4. Every answer must sound like it was SAID. If you can hear bullet points — rewrite.
5. Apply Stage 4 script rules for every Yellow claim exactly.
6. Myth = three-part structure every time. Never skip the verdict word (False/Wrong).
7. Blue answers are the most authentic moments. Write at full depth. Never abbreviate.
8. Blue hero answer stays last in Section 5. Never moved. Never abbreviated.
9. Demo triggers are physical and stageable. No imaginary or CGI visuals.
10. Rapid Fire: max 2 sentences per answer. No exceptions.
11. Citations are natural in speech — never academic format.
12. Track est_sec per answer; section actual_min and status; total_runtime_min.
13. Style gate only for first episode. Never ask for style approval on episode 2+.
14. All 4 Stage 2 pillars must appear. Name which answer carries each in pillar_check.
15. ICMR must appear naturally in at least one answer.
16. Interviewer speaks for the audience as a Tamil Nadu family member who cares — not a journalist.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT — valid JSON only, no markdown, no code fences
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{
  "sections": [
    {
      "id": "opening|discovery|science|myth|solution|practical|rapidfire",
      "label": "Opening|Discovery|Science|Myth-Busting|Solution|Practical Use Case|Rapid Fire",
      "target_min": 2,
      "actual_min": 1.9,
      "status": "on_track|over|under",
      "answers": [
        {
          "question_id": "A8",
          "question_text": "the question text",
          "grade": "GREEN|YELLOW|BLUE|RED",
          "demo_trigger": false,
          "est_sec": 58,
          "interviewer": "spoken question — natural Tamil Nadu family member voice, not a journalist",
          "prabhakar": "Dr. Prabhakar's spoken answer — flowing sentences, never lists, South Indian warmth and authority, demo action written inline if demo_trigger",
          "source_annotation": "🟢 Source: formal citation for production team — never spoken aloud",
          "editor_note": "only if demo_trigger true — specific physical prop, B-roll description, number of takes for editor"
        }
      ]
    }
  ],
  "total_runtime_min": 38.5,
  "status": "within_range|over|under",
  "style_check": false,
  "pillar_check": {
    "Pillar Name": "Q[ID] in [section] — one sentence on how this answer carries the pillar"
  }
}

Section target_min values: Opening 2, Discovery 4, Science 6, Myth-Busting 5, Solution 6, Practical 4, Rapid Fire 2. Total target 29–32 min.
Output valid JSON only. No markdown. No code fences.`;

// Claude variant — prepends the Dr. Prabhakar persona so the voice is authentic.
// All structural rules stay identical; only the persona header is added.
const SYSTEM_CLAUDE = `${DR_PRABHAKAR_PERSONA}\n\n` + SYSTEM;

// Build a prompt for a specific chunk of sections (used in chunked Gemini calls)
function buildChunkPrompt({ locked_topic, angle, pillars, arc_chunk, all_arc, claims, blue_notes, indian_context, primary_viewer, chunk_index, total_chunks }) {
  const qCount = all_arc?.reduce((sum, s) => sum + (s.questions?.length ?? 0), 0) ?? 0;
  const chunkQCount = arc_chunk?.reduce((sum, s) => sum + (s.questions?.length ?? 0), 0) ?? 0;

  // Build claim lookup by question_id
  const claimMap = {};
  claims?.forEach((c) => {
    if (!claimMap[c.question_id]) claimMap[c.question_id] = [];
    claimMap[c.question_id].push(c);
  });

  // Extract demo triggers from FULL arc (for reference context)
  const demoSections = all_arc?.filter((s) => s.demo_trigger) ?? [];
  const demo1 = demoSections[0];
  const demo2 = demoSections[1];
  const demo1Desc = demo1?.demo_note
    ? `Section "${demo1.section_label || demo1.section}" — ${demo1.demo_note}`
    : "Science section — prop-based visual of body mechanism";
  const demo2Desc = demo2?.demo_note
    ? `Section "${demo2.section_label || demo2.section}" — ${demo2.demo_note}`
    : "Solution section — comparison or protocol visual";

  const blueClaims = claims?.filter((c) => c.grade === "BLUE") ?? [];
  const yellowRules = claims?.filter((c) => c.grade === "YELLOW" && c.script_rule)
    .map((c) => `  [${c.question_id}] ${c.script_rule}`) ?? [];

  const blueClaimList = blueClaims.length
    ? blueClaims.map((c) => {
        const note = blue_notes?.[c.id] || blue_notes?.[c.question_id] || "";
        return `  [${c.question_id}] "${c.claim}"${note ? `\n    Doctor's clinical note: "${note}"` : ""}`;
      }).join("\n")
    : "  None";

  const arcSummary = arc_chunk?.map((section) => {
    const qs = section.questions?.map((q) => {
      const qClaims = claimMap[q.id] ?? [];
      const scriptRules = qClaims.filter((c) => c.script_rule).map((c) => c.script_rule).join("; ");
      const isClinical = qClaims.some((c) => c.grade === "BLUE");
      const isRed = qClaims.some((c) => c.grade === "RED");
      const grade = q.grade ?? (isClinical ? "BLUE" : isRed ? "RED" : "?");
      const blueNote = blue_notes?.[q.id] ?? "";
      return [
        `  - [${q.id}] grade:${grade} "${q.text}"`,
        q.note       ? `    placement_note: ${q.note}` : null,
        scriptRules  ? `    SCRIPT_RULE: ${scriptRules}` : null,
        blueNote     ? `    BLUE_NOTE: "${blueNote}"` : null,
      ].filter(Boolean).join("\n");
    }).join("\n");

    const demoLabel = section.demo_trigger ? "⚡ DEMO TRIGGER" : "no demo";
    return [
      `SECTION: ${section.section_label || section.section} [${demoLabel}]`,
      qs,
      section.demo_trigger && section.demo_note ? `  DEMO DESCRIPTION: ${section.demo_note}` : null,
    ].filter(Boolean).join("\n");
  }).join("\n\n");

  const contextList = indian_context?.length
    ? indian_context.map((ic) => `- ${ic.angle}: ${ic.significance}`).join("\n")
    : "  Not provided";

  const chunkNote = `CHUNK ${chunk_index + 1} of ${total_chunks} — Write ONLY the ${chunkQCount} answers for the ${arc_chunk.length} section(s) listed below. The full episode has ${qCount} questions across ${total_chunks} chunks. Do NOT write answers for any other section.`;

  return `ANSWER WRITING REQUEST — FULL SCRIPT MODE (CHUNKED)
${chunkNote}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LOCKED TOPIC:   ${locked_topic ?? "Health Topic"}
LOCKED ANGLE:   ${angle ?? "Not provided"}
4 PILLARS:      ${JSON.stringify(pillars ?? [])}
PRIMARY VIEWER: ${primary_viewer ?? "Not provided"}
QUESTIONS THIS CHUNK: ${chunkQCount}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEMO TRIGGER ①: ${demo1Desc}
DEMO TRIGGER ②: ${demo2Desc}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BLUE CLAIMS (write at full emotional depth — never frame as research):
${blueClaimList}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YELLOW SCRIPT RULES (apply exactly — condition in same sentence as benefit):
${yellowRules.length ? yellowRules.join("\n") : "  None"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INDIAN CONTEXT TO INTEGRATE NATURALLY:
${contextList}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTIONS TO WRITE (locked order — do not reorder):
${arcSummary}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESPONSE FORMAT: Return ONLY a valid JSON object with a single key "sections" — an array of section objects (one per section above). Each section object must have: "id", "label", "target_min", "actual_min", "status", and "answers" array. Do NOT include total_runtime_min, pillar_check, or style_check — those are merged after all chunks. No markdown. No code fences.`;
}

function buildPrompt({ locked_topic, angle, pillars, arc, claims, blue_notes, indian_context, primary_viewer, style_mode }) {
  const qCount = arc?.reduce((sum, s) => sum + (s.questions?.length ?? 0), 0) ?? 0;

  // Build claim lookup by question_id
  const claimMap = {};
  claims?.forEach((c) => {
    if (!claimMap[c.question_id]) claimMap[c.question_id] = [];
    claimMap[c.question_id].push(c);
  });

  // Extract demo triggers from arc
  const demoSections = arc?.filter((s) => s.demo_trigger) ?? [];
  const demo1 = demoSections[0];
  const demo2 = demoSections[1];
  const demo1Desc = demo1?.demo_note
    ? `Section "${demo1.section_label || demo1.section}" — ${demo1.demo_note}`
    : "Science section — prop-based visual of body mechanism";
  const demo2Desc = demo2?.demo_note
    ? `Section "${demo2.section_label || demo2.section}" — ${demo2.demo_note}`
    : "Solution section — comparison or protocol visual";

  // Extract blue and yellow claims for explicit callout
  const blueClaims = claims?.filter((c) => c.grade === "BLUE") ?? [];
  const yellowRules = claims?.filter((c) => c.grade === "YELLOW" && c.script_rule)
    .map((c) => `  [${c.question_id}] ${c.script_rule}`) ?? [];

  const blueClaimList = blueClaims.length
    ? blueClaims.map((c) => {
        const note = blue_notes?.[c.id] || blue_notes?.[c.question_id] || "";
        return `  [${c.question_id}] "${c.claim}"${note ? `\n    Doctor's clinical note: "${note}"` : ""}`;
      }).join("\n")
    : "  None";

  // Build arc summary with full claim info per question
  const arcSummary = arc?.map((section) => {
    const qs = section.questions?.map((q) => {
      const qClaims = claimMap[q.id] ?? [];
      const scriptRules = qClaims.filter((c) => c.script_rule).map((c) => c.script_rule).join("; ");
      const isClinical = qClaims.some((c) => c.grade === "BLUE");
      const isRed = qClaims.some((c) => c.grade === "RED");
      const grade = q.grade ?? (isClinical ? "BLUE" : isRed ? "RED" : "?");
      const blueNote = blue_notes?.[q.id] ?? "";
      return [
        `  - [${q.id}] grade:${grade} "${q.text}"`,
        q.note             ? `    placement_note: ${q.note}` : null,
        scriptRules        ? `    SCRIPT_RULE: ${scriptRules}` : null,
        blueNote           ? `    BLUE_NOTE: "${blueNote}"` : null,
      ].filter(Boolean).join("\n");
    }).join("\n");

    const demoLabel = section.demo_trigger ? "⚡ DEMO TRIGGER" : "no demo";
    return [
      `SECTION: ${section.section_label || section.section} [${demoLabel}]`,
      qs,
      section.demo_trigger && section.demo_note ? `  DEMO DESCRIPTION: ${section.demo_note}` : null,
    ].filter(Boolean).join("\n");
  }).join("\n\n");

  const contextList = indian_context?.length
    ? indian_context.map((ic) => `- ${ic.angle}: ${ic.significance}`).join("\n")
    : "  Not provided";

  const mode = style_mode === "style_check"
    ? `STYLE CHECK MODE — Write ONE representative answer per section (7 total, one per section).
Show the full range of voices and evidence tags across the 7. Set "style_check": true in the JSON.
Gate question: "Does this voice and treatment work? Approve to write all ${qCount} answers."`
    : `FULL SCRIPT MODE — Write ALL answers for every question in the arc below in the exact locked order.`;

  return `ANSWER WRITING REQUEST — ${mode}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LOCKED TOPIC:   ${locked_topic ?? "Health Topic"}
LOCKED ANGLE:   ${angle ?? "Not provided"}
4 PILLARS:      ${JSON.stringify(pillars ?? [])}
PRIMARY VIEWER: ${primary_viewer ?? "Not provided"}
TOTAL QUESTIONS: ${qCount}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEMO TRIGGER ①: ${demo1Desc}
DEMO TRIGGER ②: ${demo2Desc}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BLUE CLAIMS (write at full emotional depth — never frame as research):
${blueClaimList}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YELLOW SCRIPT RULES (apply exactly — condition in same sentence as benefit):
${yellowRules.length ? yellowRules.join("\n") : "  None"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INDIAN CONTEXT TO INTEGRATE NATURALLY:
${contextList}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEQUENCED ARC — LOCKED ORDER (do not reorder):
${arcSummary}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Apply all evidence tag tone rules. Verify all 4 pillars appear. Return valid JSON only.`;
}

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}

  const {
    locked_topic  = "Health Topic",
    angle         = null,
    pillars       = [],
    arc           = [],
    claims        = [],
    blue_notes    = {},
    indian_context= [],
    primary_viewer= null,
    style_mode    = "full",   // "style_check" | "full"
    stage5_data   = null,
    stage4_data   = null,
    lock_data     = null,
  } = body;

  // Merge sources
  const resolvedArc        = arc.length ? arc : stage5_data?.arc ?? [];
  const resolvedClaims     = claims.length ? claims : stage4_data?.claims ?? [];
  const resolvedBlueNotes  = Object.keys(blue_notes).length ? blue_notes : stage4_data?.blue_notes ?? {};
  const resolvedContext    = indian_context.length ? indian_context : stage4_data?.indian_context ?? [];
  const resolvedPillars    = pillars.length ? pillars : lock_data?.pillars ?? [];
  const resolvedAngle      = angle ?? lock_data?.angle?.frame;
  const resolvedViewer     = primary_viewer ?? lock_data?.audience?.primary;

  const geminiKey    = resolveGeminiKey(req);
  const anthropicKey = resolveAnthropicKey(req);

  try {
    // ── Demo mode ─────────────────────────────────────────────────
    if (!geminiKey && !anthropicKey) {
      await new Promise((r) => setTimeout(r, 3200));
      const mock = generateMockStage6Answers(stage5_data, stage4_data, lock_data, style_mode);
      return NextResponse.json({ ...mock, mode: "demo" });
    }

    const promptText = buildPrompt({
      locked_topic,
      angle:          resolvedAngle,
      pillars:        resolvedPillars,
      arc:            resolvedArc,
      claims:         resolvedClaims,
      blue_notes:     resolvedBlueNotes,
      indian_context: resolvedContext,
      primary_viewer: resolvedViewer,
      style_mode,
    });

    // ── Helper: run one full-script chunk and return merged sections ─
    async function runChunked(callFn, systemPrompt, modeName) {
      if (style_mode === "style_check") {
        const parsed = await callFn(systemPrompt, promptText);
        return NextResponse.json({ ...parsed, mode: modeName });
      }

      const CHUNK_SIZE  = 2;
      const allSections = resolvedArc;
      const chunks      = [];
      for (let i = 0; i < allSections.length; i += CHUNK_SIZE) {
        chunks.push(allSections.slice(i, i + CHUNK_SIZE));
      }

      const mergedSections = [];
      let totalRuntimeMin  = 0;
      let lastPillarCheck  = {};

      for (let idx = 0; idx < chunks.length; idx++) {
        const chunkPrompt = buildChunkPrompt({
          locked_topic,
          angle:          resolvedAngle,
          pillars:        resolvedPillars,
          arc_chunk:      chunks[idx],
          all_arc:        resolvedArc,
          claims:         resolvedClaims,
          blue_notes:     resolvedBlueNotes,
          indian_context: resolvedContext,
          primary_viewer: resolvedViewer,
          chunk_index:    idx,
          total_chunks:   chunks.length,
        });

        const chunkResult = await callFn(systemPrompt, chunkPrompt);

        if (Array.isArray(chunkResult.sections)) {
          for (const sec of chunkResult.sections) {
            mergedSections.push(sec);
            totalRuntimeMin += sec.actual_min ?? 0;
          }
        }
        if (chunkResult.pillar_check) {
          lastPillarCheck = { ...lastPillarCheck, ...chunkResult.pillar_check };
        }
      }

      const status =
        totalRuntimeMin < 29 ? "under" :
        totalRuntimeMin > 32 ? "over"  : "within_range";

      return NextResponse.json({
        sections:          mergedSections,
        total_runtime_min: Math.round(totalRuntimeMin * 10) / 10,
        status,
        style_check:       false,
        pillar_check:      lastPillarCheck,
        mode:              modeName,
      });
    }

    const preferred = req.headers.get("x-preferred-model") ?? "claude";

    if (preferred === "claude" && anthropicKey) {
      const claudeCall = (sys, user) => callClaude(anthropicKey, sys, user, true, 8192);
      return await runChunked(claudeCall, SYSTEM_CLAUDE, modeLabel(req));
    }
    if (geminiKey) {
      const geminiCall = (sys, user) => callGemini(geminiKey, GEMINI_MODELS.pro, sys, user, 0.65, 8192);
      return await runChunked(geminiCall, SYSTEM, "gemini");
    }
    if (anthropicKey) {
      const claudeCall = (sys, user) => callClaude(anthropicKey, sys, user, true, 8192);
      return await runChunked(claudeCall, SYSTEM_CLAUDE, modeLabel(req));
    }

  } catch (e) {
    console.error("[stage6-answers] error:", e.message);
    if (geminiKey || anthropicKey) {
      return NextResponse.json({ error: e.message, mode: "error" }, { status: 500 });
    }
  }

  // ── Fallback (true demo — no keys) ────────────────────────────
  const mock = generateMockStage6Answers(stage5_data, stage4_data, lock_data, style_mode);
  return NextResponse.json({ ...mock, mode: "demo" });
}
