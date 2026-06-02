import { NextResponse } from "next/server";
import { generateMockStage1Topics } from "@/lib/podcast/mockData";
import { callGemini, GEMINI_MODELS } from "@/lib/podcast/gemini";
import { callClaude } from "@/lib/podcast/claude";
import { resolveAnthropicKey, modeLabel } from "@/lib/podcast/key-resolver";

// ── Doctor Farmer Pipeline Stage 1 — Topic Discovery Engine ──────────────────
const SYSTEM = `You are Stage 1 — Topic Discovery — of the Doctor Farmer MagicScript Podcast Pipeline.

Your job: take a keyword and produce 5 ranked, scored candidate topics for the user to choose from.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DOCTOR FARMER CONTEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Creator: Dr. Prabhakar Raj — medical doctor, lifestyle reversal specialist, MHS founder (15,000+ students)
Platform: Instagram Reels + Podcast
Audience: 45+ Type 2 diabetics, families, South Indian households, PCOD/thyroid patients, people on medication
Core message: Food is medicine. Lifestyle reversal without drugs.
Funnel: Every topic leads to MHS webinar or consultation
Cultural: Idli, rice, biryani, filter coffee, Karthigai, Ramadan, Navratri, Ekadasi

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — KEYWORD ANCHORING (runs before scoring)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Every topic must pass one anchor type:
ANCHOR A: keyword in title directly
ANCHOR B: direct sub-topic — connection stated in description explicitly
ANCHOR C: South Indian cultural intersection — practice named explicitly

HARD REJECTION: Topics not passing A, B, or C are rejected before scoring. No exceptions.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — CONTENT CATEGORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MYTH / PROBLEM / FAQ / CONTRARIAN / CLINICAL DEEP DIVE
Aim for variety across the 5 topics.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3 — SCORING FORMULA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Raw = (Demand×0.35) + (SocialDemand×0.40) + (CompetitionGap×0.20) + (DFFit×0.20)
Max raw = 115. Final = round((Raw / 115) × 100)

DEMAND (35%): Search volume + trend direction. Rising trend = 80-100. Flat = 60-79. Falling = 20-49.
SOCIAL DEMAND (40%) — HIGHEST WEIGHT: Instagram save/share/comment potential. Score 80-100 when people will save before acting, forward to family WhatsApp, comment with unanswered questions, or topic connects to religious fasting.
COMPETITION GAP (20%): 85-100 = no credentialed Indian doctor covered this. Generic influencers do NOT close the gap.
DF FIT (20%): 90-100 = diabetic audience + MHS funnel + doctor authority + South Indian cultural specificity.

VERDICTS: 70-100 = APPROVED · 50-69 = REFRAME · 0-49 = REJECTED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4 — BIGGEST WEAKNESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Always name the specific criterion that most limits the topic. Never write a vague weakness.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 5 — REFRAME (always, even if approved)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Always provide a reframed version. Must: (1) contain keyword or derivative, (2) have scroll-stop hook in title, (3) speak to a specific person, (4) connect to blood sugar/reversal/MHS, (5) be re-scored separately, (6) score at least 5 points higher.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 6 — VERIFY LINKS (all 6 sources)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Provide exact search queries for: Ubersuggest, Answer the Public, Google Trends, SEO Trending, VidIQ/YouTube, Quora.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HARD RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Keyword anchoring before scoring — always
2. Social Demand 40% always outweighs Demand 35%
3. Competition Gap is standalone — not inside DF Fit
4. Always reframe even approved topics
5. Weakness names a specific criterion
6. Weights are 35/40/20/20 — never change them
7. Reel opening line is Tamil Nadu specific
8. Religious fasting always relevant when keyword touches fasting
9. Reframe must score 5+ points higher
10. All 6 verify sources shown every time
11. VARIETY MANDATE: every call must produce FRESH angles. Vary the 5 categories
    (mix Myth, Problem, FAQ, Contrarian, Clinical Deep Dive). Vary the cultural
    anchors (rotate among Karthigai, Ramadan, Ekadasi, Navratri, harvest, family
    gatherings). Vary the demographic (newly diagnosed, post-menopause, working
    parents, post-partum, elderly, students). If the user passes an exclusion
    list, do NOT repeat those titles — find genuinely different angles.

Output valid JSON only. No markdown. No code fences.`;

// Known cultural fasting / festival anchors so we can detect and rotate them.
const CULTURAL_ANCHORS = [
  "Ekadasi", "Karthigai", "Ramadan", "Ramzan", "Navratri", "Pongal",
  "Onam", "Diwali", "Sankashti", "Pradosh", "Krishna Janmashtami",
  "Aadi", "Aavani", "Purattasi", "Margazhi", "Thai", "Maasi",
  "Vinayagar Chaturthi", "Shivaratri", "Janmashtami", "Vrat", "Upavas",
];

function extractAnchorMentions(titles) {
  const counts = {};
  for (const t of titles) {
    if (!t) continue;
    const lower = t.toLowerCase();
    for (const a of CULTURAL_ANCHORS) {
      if (lower.includes(a.toLowerCase())) {
        counts[a] = (counts[a] ?? 0) + 1;
      }
    }
  }
  return counts;
}

function buildPrompt(keyword, mode, excludeTitles = [], varietySeed = "") {
  // ── Variety block — forces a fresh angle on every run ─────────────────────
  // 1. We pass a unique nonce per request so the model can never lazily cache a
  //    previous response across calls with identical input.
  // 2. We list every title we've already produced for this keyword so the model
  //    explicitly avoids them.
  // 3. We detect WHICH cultural anchors have already been used and tell the
  //    model to rotate to fresh ones — this is the cure for "Ekadasi every time"
  //    where titles differ but the concept repeats.
  const anchorCounts = extractAnchorMentions(excludeTitles);
  const overusedAnchors = Object.entries(anchorCounts)
    .filter(([, n]) => n >= 1)
    .map(([a]) => a);

  const unusedAnchors = CULTURAL_ANCHORS.filter((a) => !anchorCounts[a]);

  const excludeBlock = excludeTitles.length
    ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AVOID — ALREADY-PRODUCED TITLES FOR THIS KEYWORD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The following titles have already been generated for this exact keyword
(either saved into the user's vault or shipped as podcasts). Do NOT repeat
them. Find different angles, different demographics, different cultural
hooks, different myths to bust, different complications to address.

${excludeTitles.slice(0, 60).map((t, i) => `${i + 1}. ${t}`).join("\n")}

Pick 5 NEW angles that do not overlap with the above titles.`
    : "";

  const anchorRotationBlock = overusedAnchors.length
    ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CULTURAL ANCHOR ROTATION — CRITICAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The following cultural anchors have ALREADY been used in previous batches
for this keyword (do NOT use them again — same title or different title, the
underlying concept repeats and bores the user):

${overusedAnchors.map((a) => `  ✘ ${a}`).join("\n")}

For this batch's mandatory Anchor C cultural topic, PICK A DIFFERENT ONE from:
${unusedAnchors.slice(0, 12).map((a) => `  ✔ ${a}`).join("\n")}

OR, if all relevant cultural anchors are exhausted, SKIP the mandatory Anchor C
this round and produce 5 topics anchored only via A (direct keyword) and B
(direct sub-topic). Anchor diversity matters more than the cultural quota.`
    : "";

  return `STAGE 1 REQUEST:
Input mode: ${mode === "link" ? "Reference Link" : "Keyword"}
Input: ${keyword}
Variety seed (for fresh angles, do not echo): ${varietySeed}
${excludeBlock}
${anchorRotationBlock}

Generate 5 ranked, scored candidate topics as valid JSON (no markdown, no code fences):

{
  "keyword": "${keyword}",
  "mode": "${mode}",
  "topics": [
    {
      "id": 1,
      "title": "full topic title",
      "category": "Myth|Problem|FAQ|Contrarian|Clinical Deep Dive",
      "anchor": { "type": "A|B|C", "note": "one line: connection to keyword" },
      "description": "2 sentences: what it covers + why it scores well for DF",
      "demand": 0,
      "social": 0,
      "competition_gap": 0,
      "df_fit": 0,
      "score": 0,
      "verdict": "APPROVED|REFRAME|REJECTED",
      "biggest_weakness": {
        "criterion": "Demand|Social Demand|Competition Gap|DF Fit",
        "explanation": "1-2 sentences — specific not vague"
      },
      "reframe": {
        "title": "stronger version of the title",
        "why_stronger": "one sentence",
        "demand": 0,
        "social": 0,
        "competition_gap": 0,
        "df_fit": 0,
        "score": 0,
        "delta": 0
      },
      "verify": {
        "ubersuggest": "exact keyword phrase",
        "answer_the_public": "exact query",
        "google_trends": "exact comparison terms",
        "seo_trending": "related keyword gaining traction",
        "vidiq": "exact YouTube search query",
        "quora": "exact question to search"
      },
      "opening_line": "first 3 seconds — Tamil Nadu specific, diabetic audience"
    }
  ],
  "summary": {
    "top_pick": "title of highest scoring topic",
    "best_reach": "title of most likely viral topic",
    "best_save": "title of most likely saved/shared topic",
    "best_funnel": "title most likely to drive MHS consultation"
  }
}

Keyword: "${keyword}"
All 5 topics must be anchored to this keyword. If a cultural rotation block is present above, OBEY it strictly — do not default to Ekadasi just because it's familiar. Otherwise include at least 1 Anchor C cultural topic, picking from a rotating set (Karthigai, Ramadan, Navratri, Pongal, Onam, Diwali, Ekadasi, Sankashti, Shivaratri, Margazhi, etc.) — vary the choice across batches. Sort topics by final score descending.

RESPONSE FORMAT: Return ONLY a valid JSON object with keys: "topics" (array of 5) and "summary". No markdown. No explanation. No text before or after the JSON.`;
}

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}

  const {
    keyword       = "health",
    mode          = "keyword",
    excludeTitles = [],   // titles to AVOID — passed by client from history + vault
  } = body;

  const geminiKey    = req.headers.get("x-client-gemini-key");
  const anthropicKey = resolveAnthropicKey(req);   // honours "claude-internal"

  // Unique per-request variety seed so the model never deterministically
  // repeats the same 5 topics for the same keyword across calls.
  const varietySeed = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  try {
    // ── Demo mode ─────────────────────────────────────────────────
    if (!geminiKey && !anthropicKey) {
      await new Promise((r) => setTimeout(r, 1800));
      const topics = generateMockStage1Topics(keyword);
      return NextResponse.json({
        keyword,
        mode,
        topics,
        summary: {
          top_pick:    topics[0]?.title ?? "",
          best_reach:  topics.find((t) => t.category === "Contrarian")?.title ?? topics[1]?.title ?? "",
          best_save:   topics.find((t) => ["Myth", "FAQ"].includes(t.category))?.title ?? topics[2]?.title ?? "",
          best_funnel: topics.find((t) => t.df_fit >= 90)?.title ?? topics[0]?.title ?? "",
        },
        mode: "demo",
      });
    }

    const promptText = buildPrompt(keyword, mode, excludeTitles, varietySeed);
    const preferred  = req.headers.get("x-preferred-model") ?? "gemini";

    // Stage 1 is creative discovery, not factual recall — bump temperature so
    // repeated calls with the same keyword produce GENUINELY different angles.
    // Combined with the variety seed + exclusion list, this kills determinism.
    const STAGE1_TEMP = 0.95;

    // Helper — detects Gemini overload / rate-limit errors so we can auto-fallback.
    const isGeminiOverload = (err) => {
      const m = (err?.message || "").toLowerCase();
      return (
        m.includes("high demand") ||
        m.includes("overloaded")   ||
        m.includes("503")          ||
        m.includes("429")          ||
        m.includes("rate limit")   ||
        m.includes("quota")        ||
        m.includes("unavailable")
      );
    };

    if (preferred === "claude") {
      if (anthropicKey) {
        const parsed = await callClaude(anthropicKey, SYSTEM, promptText, true, 8192);
        return NextResponse.json({ ...parsed, keyword, mode: modeLabel(req) });
      }
      if (geminiKey) {
        const parsed = await callGemini(geminiKey, GEMINI_MODELS.pro, SYSTEM, promptText, STAGE1_TEMP, 8192);
        return NextResponse.json({ ...parsed, mode: "gemini" });
      }
    } else {
      if (geminiKey) {
        try {
          const parsed = await callGemini(geminiKey, GEMINI_MODELS.pro, SYSTEM, promptText, STAGE1_TEMP, 8192);
          return NextResponse.json({ ...parsed, mode: "gemini" });
        } catch (gErr) {
          // ── AUTO-FALLBACK ──────────────────────────────────────────────────
          // If Gemini is overloaded AND the user has an Anthropic key available,
          // silently retry with Claude so the workflow never gets stuck on a
          // Google-side outage. The UI badge will show "Claude (Gemini fallback)".
          if (isGeminiOverload(gErr) && anthropicKey) {
            console.warn("[stage1] Gemini overloaded — auto-falling back to Claude:", gErr.message);
            const parsed = await callClaude(anthropicKey, SYSTEM, promptText, true, 8192);
            return NextResponse.json({
              ...parsed,
              keyword,
              mode: modeLabel(req),
              fallback_from: "gemini-overloaded",
              fallback_reason: gErr.message,
            });
          }
          throw gErr;  // no fallback possible — surface the error
        }
      }
      if (anthropicKey) {
        const parsed = await callClaude(anthropicKey, SYSTEM, promptText, true, 8192);
        return NextResponse.json({ ...parsed, keyword, mode: modeLabel(req) });
      }
    }
  } catch (e) {
    console.error("[stage1-discover] error:", e.message);
    if (geminiKey || anthropicKey) {
      return NextResponse.json({ error: e.message, mode: "error" }, { status: 500 });
    }
  }

  // ── Fallback (true demo — no keys provided) ───────────────────
  const topics = generateMockStage1Topics(keyword);
  return NextResponse.json({ keyword, mode, topics, mode: "demo" });
}
