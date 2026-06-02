import { NextResponse } from "next/server";
import { MOCK_STAGE10_TANGLISH } from "@/lib/podcast/mockData";
import { callGemini, GEMINI_MODELS } from "@/lib/podcast/gemini";

// ── Doctor Farmer Pipeline Stage 10 — Translation / Localisation ──────────────
// Uses Gemini exclusively — the full Stage 8 script + Stage 9 reels is a
// massive payload that requires the 65K output token window.
// Claude's 8K limit would truncate mid-JSON on any full-length episode.

export const maxDuration = 300;

const SYSTEM = `You are Dr. Prabhakar's expert bilingual script supervisor. Your job is to translate the provided English podcast script and reels sheet into 'Tanglish' (Tamil mixed with English) exactly as an educated South Indian doctor speaks naturally.

CRITICAL TRANSLATION RULES:
1. Medical / technical terms (e.g., 'insulin resistance', 'HbA1c', 'metabolism', 'cortisol', 'fasting', 'glycemic index') MUST stay in English.
2. Production cues like [DEMO], [B-ROLL], [CTA], [PROP], [RAPID FIRE], [GRAPHIC], [SIGNATURE SEGMENT] MUST stay in English — the editing team reads them.
3. Keep the emotional, warm, story-based tone of Dr. Prabhakar. He speaks like an educated Tamil Nadu doctor talking to a patient family — not a translator writing subtitles.
4. Output the Tanglish in English/Latin script ONLY (e.g., 'Idhu romba simple. Intermittent fasting ngardhu neenga enna saapidreenga nu illa — Saapidra neraththa pathi dhan') — NOT Tamil Unicode script.
5. The INTERVIEWER lines should also be translated to Tanglish to match the conversational register.
6. grade, citation, and type fields must be copied exactly from the input — do not translate or modify them.
7. runSheet segments and props must be translated to Tanglish — they will be read by Tamil-speaking production assistants.
8. Reel hooks must be punchy Tanglish that stops the scroll — not literal translations.
9. Never translate proper nouns (MHS, Dr. Prabhakar, ICMR, PubMed).
10. Never add explanations or footnotes — output JSON only.

TANGLISH REGISTER GUIDE:
  Warm openers   : "Parunga…", "Theriyuma?", "Solren…", "Unmai sollanam…"
  Transitions    : "Adhukku apditha?", "Idhu mattum dhaan...", "Innum oru vishayam"
  Emphasis       : "Idhu romba important", "Doctor-a solren nu kelu", "Scientific ah proven"
  Clinical creds : Keep "research shows", "studies found", "ICMR says" in English
  Emotional beat : "Ungal paati sonna maadiri", "Namba oor doctor ellam", "Patient-a paakumbodhu"

OUTPUT FORMAT — valid JSON only, no markdown, no code fences:
{
  "tanglish_script": {
    "totalRuntime": "<same as input>",
    "runSheet": {
      "segments": ["<Tanglish segment names>"],
      "props":    ["<Tanglish prop descriptions>"],
      "totalRuntime": "<same>"
    },
    "scriptBlocks": [
      {
        "id":       "<same as input>",
        "type":     "<same as input>",
        "left":     "INTERVIEWER: <Tanglish line>\\n\\nDR. PRABHAKAR: <Tanglish line>",
        "right":    "<production cues unchanged — English only>",
        "grade":    "<same as input>",
        "citation": "<same as input>"
      }
    ]
  },
  "tanglish_reels": [
    {
      "id":            "<same as input>",
      "title":         "<Tanglish reel title>",
      "category":      "<same as input>",
      "hook":          "<Tanglish hook — punchy, scroll-stopping>",
      "script":        "<Tanglish reel script>",
      "editing_idea":  "<same as input — English for editor>",
      "virality_score":"<same as input>",
      "grade":         "<same as input>"
    }
  ],
  "translation_notes": {
    "total_blocks_translated": 0,
    "total_reels_translated":  0,
    "english_terms_preserved": ["list of key medical terms kept in English"],
    "tone_summary": "1 sentence describing the overall register achieved"
  }
}`;

function buildPrompt({ locked_topic, stage8_data, stage9_data }) {
  const scriptBlocks = stage8_data?.scriptBlocks ?? [];
  const runSheet     = stage8_data?.runSheet ?? {};
  const reels        = Array.isArray(stage9_data) ? stage9_data : (stage9_data?.reels ?? []);

  return `TRANSLATION REQUEST — Tanglish Localisation
Topic: ${locked_topic ?? "Health Topic"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STAGE 8 — PRODUCTION SCRIPT (${scriptBlocks.length} blocks)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Runtime: ${stage8_data?.totalRuntime ?? "~40 min"}

Run Sheet Segments:
${runSheet.segments?.map((s) => `- ${s}`).join("\n") ?? "Not provided"}

Props:
${runSheet.props?.map((p) => `- ${p}`).join("\n") ?? "Not provided"}

Script Blocks:
${scriptBlocks.map((b) => `--- [${b.id} | ${b.type} | grade:${b.grade ?? "null"}]
LEFT: ${b.left ?? ""}
RIGHT: ${b.right ?? ""}
---`).join("\n\n")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STAGE 9 — REELS SHEET (${reels.length} reels)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${reels.map((r) => `--- [${r.id} | ${r.category} | virality:${r.virality_score ?? "?"}]
TITLE: ${r.title ?? ""}
HOOK: ${r.hook ?? ""}
SCRIPT: ${r.script ?? ""}
EDITING: ${r.editing_idea ?? ""}
---`).join("\n\n")}

Translate ALL of the above to Tanglish following the system rules.
Return ONLY a valid JSON object. No markdown. No explanations.`;
}

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}

  const {
    locked_topic = "Health Topic",
    stage8_data  = null,
    stage9_data  = null,
  } = body;

  const geminiKey = req.headers.get("x-client-gemini-key");

  try {
    // ── Demo mode ──────────────────────────────────────────────────────────
    if (!geminiKey) {
      await new Promise((r) => setTimeout(r, 2800));
      // Build a richer demo response from MOCK_STAGE10
      return NextResponse.json({
        tanglish_script: {
          totalRuntime: stage8_data?.totalRuntime ?? "~40 min",
          runSheet: {
            segments: ["Opening Hook (2 min) — Thuvangattu Parunga", "Discovery (5 min) — Pudhusa Theriyum", "Science + Demo (8 min) — Research Enna Sollutha", "Myth-Busting (7 min) — Poi Kadhaigal", "Solution (4 min) — Neenga Enna Pannanum", "Superfood Segment (4 min) — Namma Ooru Superfood", "Practical Use (3 min) — Enakku Apply Aaguma", "Rapid Fire (2 min) — Vela Vela Kelu", "Close (1 min) — Paarthukkalam"],
            props: ["Ghee container — Ghee dabba", "Sugar measurement kit — Sugar measurement set", "Food plate with portions — Sappad plate"],
            totalRuntime: "~47 min including transitions",
          },
          scriptBlocks: stage8_data?.scriptBlocks?.slice(0, 5).map((b, i) => ({
            ...b,
            left: `INTERVIEWER: ${MOCK_STAGE10_TANGLISH.sampleBlock.tanglish.split(".")[0]}?\n\nDR. PRABHAKAR: ${MOCK_STAGE10_TANGLISH.sampleBlock.tanglish}`,
          })) ?? [],
        },
        tanglish_reels: (Array.isArray(stage9_data) ? stage9_data : (stage9_data?.reels ?? [])).slice(0, 3).map((r) => ({
          ...r,
          hook:   "Ungal paati sonna vishayam — doctors confirm pannanga! Theriyuma?",
          script: MOCK_STAGE10_TANGLISH.sampleBlock.tanglish,
        })),
        translation_notes: {
          total_blocks_translated: stage8_data?.scriptBlocks?.length ?? 0,
          total_reels_translated:  Array.isArray(stage9_data) ? stage9_data.length : (stage9_data?.reels?.length ?? 0),
          english_terms_preserved: ["insulin resistance", "HbA1c", "metabolism", "fasting", "glycemic index", "cortisol", "ICMR", "MHS"],
          tone_summary: "Warm, conversational Tamil Nadu doctor register achieved — technical terms preserved in English, emotional beats in Tanglish.",
        },
        mode: "demo",
      });
    }

    // ── Live Gemini call ───────────────────────────────────────────────────
    // Stage 10 always uses Gemini — 65K output window is required for full scripts
    const promptText = buildPrompt({ locked_topic, stage8_data, stage9_data });
    const parsed = await callGemini(
      geminiKey,
      GEMINI_MODELS.flash,
      SYSTEM,
      promptText,
      0.4,   // temperature — translation needs low variance
      65000, // output tokens — must be large for full episode
      1024,  // thinking budget
    );
    return NextResponse.json({ ...parsed, mode: "gemini" });

  } catch (e) {
    console.error("[stage10-translation] error:", e.message);
    if (geminiKey) {
      return NextResponse.json({ error: e.message, mode: "error" }, { status: 500 });
    }
  }

  // ── Fallback demo ──────────────────────────────────────────────────────
  return NextResponse.json({ ...MOCK_STAGE10_TANGLISH, mode: "demo" });
}
