import { NextResponse } from "next/server";
import { MOCK_STAGE8_SCRIPT } from "@/lib/podcast/mockData";
import { callGemini, GEMINI_MODELS } from "@/lib/podcast/gemini";
import { callClaude, DR_PRABHAKAR_PERSONA } from "@/lib/podcast/claude";
import { resolveAnthropicKey, resolveGeminiKey, modeLabel } from "@/lib/podcast/key-resolver";

// ── Doctor Farmer Pipeline Stage 8 — Script Assembly ─────────────────────────

const SYSTEM = `You are Stage 8 — Script Assembly — of the Doctor Farmer MagicScript Podcast Pipeline.

Your job: stitch every approved piece into one complete, shootable two-column production script. You create NOTHING new. You arrange approved material (Stage 6 Q&A script + Stage 7 show design) into final production format.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TWO-COLUMN FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LEFT column ("left"): Spoken dialogue only.
- Format: INTERVIEWER: [text]\n\nDR. PRABHAKAR: [text]
- Copied exactly from Stage 6. Do not paraphrase. Do not summarise.
- For signature segments (superfood, rapid fire): write brief hosting script.

RIGHT column ("right"): Production cues only.
- Use square-bracket cue tags: [DEMO] [B-ROLL] [PROP] [CTA] [SIGNATURE SEGMENT] [GRAPHIC]
- One cue per line. Director can read at a glance.
- For [DEMO] blocks: name the exact prop needed.
- For [B-ROLL]: describe the exact shot.
- Keep cues concise (1 sentence each).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BLOCK STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Create one scriptBlock per Q&A answer. Plus additional blocks for:
- Cold open (type: "opening") — use the first Opening question as the hook
- Each CTA injection point (type: "cta")
- Superfood segment (type: "signature") — 4-min hosted segment, Dr. Prabhakar presents the superfood
- Re-hook beat after minute 15 (type: "rehook") — 1 bridging sentence before Science/Myth sections
- Close/outro (type: "close") — thank and tease next episode

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ORDERING RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Order: Cold Open → Opening Q&As → Discovery Q&As → CTA-1 → Science Q&As (with Demo 1) → Myth Q&As → Re-hook beat → Superfood Segment → CTA-2 → Solution Q&As (with Demo 2) → Practical Q&As → Rapid Fire Q&As → Close

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RUN SHEET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generate a one-page run sheet with:
- segments: ordered list of segment names with estimated duration
- props: complete list of every physical item needed on set
- totalRuntime: total episode duration including transitions (~7 min extra)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HARD RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Never invent new dialogue. Left column = Stage 6 text only.
2. Every demo trigger from Stage 6 must have a [DEMO] cue in the right column.
3. Every CTA from Stage 7 must have a [CTA] cue block.
4. Rapid Fire: each answer is its own block with a [RAPID FIRE] tag.
5. grade field: carry the evidence grade (GREEN/YELLOW/BLUE/RED) from Stage 6. null for non-Q&A blocks.
6. citation field: carry the source_annotation from Stage 6. null if not applicable.

OUTPUT FORMAT — valid JSON only, no markdown, no code fences:
{
  "totalRuntime": "XX min",
  "runSheet": {
    "segments": ["Opening Hook (X min)", "Discovery (X min)", "..."],
    "props": ["specific prop 1", "specific prop 2"],
    "totalRuntime": "~XX min total with transitions"
  },
  "scriptBlocks": [
    {
      "id": "sb1",
      "type": "opening|discovery|science|myth|solution|practical|rapidfire|cta|signature|rehook|close",
      "left": "INTERVIEWER: [text]\\n\\nDR. PRABHAKAR: [text]",
      "right": "[CUE TAG]: description\\n[ANOTHER CUE]: description",
      "grade": "GREEN|YELLOW|BLUE|RED|null",
      "citation": "source string or null"
    }
  ]
}`;

// Claude variant — persona prepended for authentic dialogue formatting.
const SYSTEM_CLAUDE = `${DR_PRABHAKAR_PERSONA}\n\n` + SYSTEM;

function buildPrompt({ locked_topic, stage6_sections, stage7_data }) {
  // Build the full Stage 6 dialogue as a structured list
  const dialogueBlocks = [];
  stage6_sections?.forEach((sec) => {
    sec.answers?.forEach((ans) => {
      dialogueBlocks.push(
        `[${sec.id?.toUpperCase()} | ${ans.question_id} | grade:${ans.grade}${ans.demo_trigger ? " | DEMO TRIGGER" : ""}]\n` +
        `INTERVIEWER: ${ans.interviewer}\n` +
        `DR. PRABHAKAR: ${ans.prabhakar}\n` +
        (ans.source_annotation ? `SOURCE: ${ans.source_annotation}\n` : "") +
        (ans.editor_note ? `EDITOR: ${ans.editor_note}\n` : "")
      );
    });
  });

  const dialogueText = dialogueBlocks.join("\n---\n");

  // Summarise Stage 7
  const segmentList = stage7_data?.segmentMap?.map((s) => `- ${s.label} (${s.duration})`).join("\n") ?? "Not provided";
  const demoList = stage7_data?.demonstrations?.map((d) =>
    `- ${d.section}: ${d.description} | PROP: ${d.prop}`
  ).join("\n") ?? "Not provided";
  const superfood = stage7_data?.superfood
    ? `${stage7_data.superfood.name} — ${stage7_data.superfood.claims?.[0]?.claim ?? ""}`
    : "Not provided";
  const ctaList = stage7_data?.ctaPoints?.map((c) =>
    `- After ${c.position}: "${c.text}"`
  ).join("\n") ?? "Not provided";
  const leadMagnet = stage7_data?.leadMagnet?.chosen ?? "Not provided";

  return `SCRIPT ASSEMBLY REQUEST:
Topic: ${locked_topic ?? "Health Topic"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STAGE 7 SHOW DESIGN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Segment Map:
${segmentList}

Demonstrations:
${demoList}

Superfood: ${superfood}
Lead Magnet: ${leadMagnet}

CTA Injection Points:
${ctaList}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STAGE 6 APPROVED Q&A DIALOGUE (copy exactly into left column)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${dialogueText || "No Stage 6 dialogue provided — use placeholder dialogue."}

Assemble into the full two-column production script. Return ONLY valid JSON. No markdown. No code fences.`;
}

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}

  const {
    locked_topic    = "Health Topic",
    stage6_sections = [],
    stage7_data     = null,
  } = body;

  const geminiKey    = resolveGeminiKey(req);
  const anthropicKey = resolveAnthropicKey(req);

  try {
    // ── Demo mode ─────────────────────────────────────────────────
    if (!geminiKey && !anthropicKey) {
      await new Promise((r) => setTimeout(r, 2600));
      return NextResponse.json({ ...MOCK_STAGE8_SCRIPT, mode: "demo" });
    }

    const promptText = buildPrompt({ locked_topic, stage6_sections, stage7_data });
    const preferred  = req.headers.get("x-preferred-model") ?? "gemini";

    if (preferred === "claude") {
      if (anthropicKey) {
        const parsed = await callClaude(anthropicKey, SYSTEM_CLAUDE, promptText, true, 8192);
        return NextResponse.json({ ...parsed, mode: modeLabel(req) });
      }
      if (geminiKey) {
        const parsed = await callGemini(geminiKey, GEMINI_MODELS.flash, SYSTEM, promptText, 0.4, 65000, 1024);
        return NextResponse.json({ ...parsed, mode: "gemini" });
      }
    } else {
      if (geminiKey) {
        const parsed = await callGemini(geminiKey, GEMINI_MODELS.flash, SYSTEM, promptText, 0.4, 65000, 1024);
        return NextResponse.json({ ...parsed, mode: "gemini" });
      }
      if (anthropicKey) {
        const parsed = await callClaude(anthropicKey, SYSTEM_CLAUDE, promptText, true, 8192);
        return NextResponse.json({ ...parsed, mode: modeLabel(req) });
      }
    }

  } catch (e) {
    console.error("[stage8-assembly] error:", e.message);
    if (geminiKey || anthropicKey) {
      return NextResponse.json({ error: e.message, mode: "error" }, { status: 500 });
    }
  }

  // ── Fallback demo ─────────────────────────────────────────────
  return NextResponse.json({ ...MOCK_STAGE8_SCRIPT, mode: "demo" });
}
