import { NextResponse } from "next/server";

// POST /api/trending
//
// Calls Google Gemini to generate 36 India-relevant trending health topics.
// The frontend smart-cache pool displays 12 at a time and refills from
// localStorage, calling this route only when the pool is exhausted or stale.
// Falls back gracefully (HTTP 200, topics: null) when no key is available.

// ── System prompt ────────────────────────────────────────────────────────────
const TRENDING_SYSTEM_PROMPT = `You are an advanced medical public health monitor tracking trending consumer health searches, viral claims, and natural wellness supplements specifically relevant to urban families and health-conscious audiences in India — especially Chennai, Bengaluru, Mumbai, and other Tier-1 cities.

You continuously monitor:
- PubMed and WHO India bulletin alerts
- Google Trends India (health & wellness category)
- YouTube Shorts health virality data
- Instagram Reels health hashtag spikes (#healthyindia, #ayurveda, #fitnessmotivation)
- Reddit r/india and r/Chennai health discussions
- Indian vernacular media health coverage

CRITICAL OUTPUT FORMAT RULES — YOU MUST FOLLOW THESE EXACTLY:
1. Your ENTIRE response must be a single raw JSON array starting with [ and ending with ].
2. Do NOT use markdown. Do NOT use \`\`\`json or any backtick code fences whatsoever.
3. Do NOT include any explanation, preamble, or text before or after the JSON array.
4. Do NOT wrap the array inside a JSON object like {"topics":[...]} — return the bare array only.

Each of the 36 objects in the array must follow this schema precisely:
{
  "topic":   "<specific health topic or claim — max 60 characters>",
  "tag":     "Diet" | "Supplement" | "Sleep" | "Diabetes" | "Women's Health" | "Immunity" | "Fitness" | "Myth Watch" | "Mental Health" | "Longevity" | "Kids Health" | "Ayurveda" | "Claim Check" | "Trend",
  "heat":    <integer 75–98>,
  "verdict": "proven" | "mixed" | "misleading" | "false",
  "delta":   "+X%" where X is a realistic integer between 4 and 68
}

Verdict rules (strict):
- "proven"    → strong RCT / meta-analysis evidence, mainstream clinical acceptance
- "mixed"     → emerging evidence, conflicting studies, or dose-dependent results
- "misleading"→ real mechanism but exaggerated or misapplied claims
- "false"     → debunked, no credible evidence, or potentially harmful`;

// ── User prompt ──────────────────────────────────────────────────────────────
const TRENDING_USER_PROMPT = `Generate exactly 36 highly realistic trending health topics for this week in India. Requirements:

1. Category variety: spread across Supplement, Diet, Women's Health, Diabetes, Ayurveda, Immunity, Fitness, Sleep, Mental Health, Longevity, Kids Health, Myth Watch, and Claim Check — at least 2 topics per major category.
2. India-specific relevance: 8–10 topics must reflect the current Indian season, festivals, or culturally popular wellness practices (e.g. monsoon immunity, summer hydration, Navratri fasting effects, coconut oil myths, Ashwagandha trends).
3. Heat distribution: 6 topics above 90, 18 topics between 79–89, 12 topics between 75–78.
4. Verdict honesty: do not mark anything "proven" unless RCT evidence is strong. Viral or Ayurvedic topics should default to "mixed" or "misleading" unless evidence is robust.
5. Delta variety: no two topics should share the same delta value.
6. Topics must be specific and actionable (e.g. "Methi seeds for blood sugar" not just "Diabetes").
7. Include at least 4 myth-busting or claim-check entries (common viral health misinformation in India).

Return the JSON array immediately. No preamble, no explanation, no markdown fences.`;

// ── Validation sets ──────────────────────────────────────────────────────────
const VALID_VERDICTS = new Set(["proven", "mixed", "misleading", "false"]);
const VALID_TAGS = new Set([
  "Diet", "Supplement", "Sleep", "Diabetes", "Women's Health",
  "Immunity", "Fitness", "Myth Watch", "Mental Health", "Longevity",
  "Kids Health", "Ayurveda", "Claim Check", "Trend",
]);

// ── Bulletproof JSON array extractor ─────────────────────────────────────────
// Handles all known Gemini output shapes:
//   1. Raw array:              [...]
//   2. Markdown-fenced:        ```json\n[...]\n```
//   3. Object-wrapped array:   {"topics":[...]} or {"data":[...]} etc.
//   4. Labelled prose + array: "Here are the topics:\n[...]"
function parseTopics(rawText) {
  if (!rawText || !rawText.trim()) {
    throw new Error("Gemini returned an empty response");
  }

  // Step 1 — strip ALL markdown code fences (```json ... ``` or ``` ... ```)
  let text = rawText
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  // Step 2 — try to extract a bare [ ... ] array block first (most common)
  const arrStart = text.indexOf("[");
  const arrEnd   = text.lastIndexOf("]");
  if (arrStart !== -1 && arrEnd > arrStart) {
    const slice = text.slice(arrStart, arrEnd + 1);
    try {
      const arr = JSON.parse(slice);
      if (Array.isArray(arr) && arr.length > 0) return normalise(arr);
    } catch {}
  }

  // Step 3 — try to parse the whole text as JSON (handles object wrappers)
  try {
    const parsed = JSON.parse(text);
    // If it's already an array
    if (Array.isArray(parsed) && parsed.length > 0) return normalise(parsed);
    // If it's an object, find the first array-valued key
    if (parsed && typeof parsed === "object") {
      for (const key of Object.keys(parsed)) {
        if (Array.isArray(parsed[key]) && parsed[key].length > 0) {
          return normalise(parsed[key]);
        }
      }
    }
  } catch {}

  // Step 4 — brute-force: scan for every [ ... ] block and pick the longest valid one
  let best = null;
  let pos  = 0;
  while (pos < text.length) {
    const s = text.indexOf("[", pos);
    if (s === -1) break;
    let depth = 0;
    for (let i = s; i < text.length; i++) {
      if (text[i] === "[") depth++;
      else if (text[i] === "]") {
        depth--;
        if (depth === 0) {
          try {
            const candidate = JSON.parse(text.slice(s, i + 1));
            if (Array.isArray(candidate) && candidate.length > (best?.length || 0)) {
              best = candidate;
            }
          } catch {}
          pos = i + 1;
          break;
        }
      }
    }
    if (depth !== 0) break; // unbalanced — stop scanning
  }

  if (best && best.length > 0) return normalise(best);

  throw new Error(
    `No valid JSON array found in Gemini response (${rawText.length} chars). ` +
    `Preview: ${rawText.slice(0, 120).replace(/\n/g, " ")}…`
  );
}

// Normalise + clamp every field so no bad value ever reaches the UI
function normalise(arr) {
  return arr.slice(0, 36).map((t, i) => ({
    topic:   String(t.topic   || `Health Topic ${i + 1}`).slice(0, 80),
    tag:     VALID_TAGS.has(t.tag) ? t.tag : "Supplement",
    heat:    Math.min(98, Math.max(70, Math.round(Number(t.heat) || 80))),
    verdict: VALID_VERDICTS.has(t.verdict) ? t.verdict : "mixed",
    delta:   /^\+\d+%$/.test(String(t.delta || "")) ? String(t.delta) : "+10%",
  }));
}

// ── Gemini fetch with automatic 503 retry ────────────────────────────────────
async function fetchGemini(url, body, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(url, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });

    if (res.ok) return res;

    const errText = await res.text().catch(() => "");

    if (res.status === 503 && attempt < maxAttempts) {
      await new Promise((r) => setTimeout(r, attempt * 1200));
      continue;
    }

    throw new Error(`Gemini ${res.status}: ${errText.slice(0, 200)}`);
  }
  throw new Error("Gemini fetch failed after retries");
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req) {
  try {
    const googleKey =
      req.headers.get("x-client-google-key") ||
      process.env.GOOGLE_AI_KEY              ||
      process.env.GEMINI_API_KEY             ||
      "";

    if (!googleKey) {
      return NextResponse.json({ topics: null, source: "static" });
    }

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const url   = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${googleKey}`;

    const res = await fetchGemini(url, {
      systemInstruction: { parts: [{ text: TRENDING_SYSTEM_PROMPT }] },
      contents:          [{ parts: [{ text: TRENDING_USER_PROMPT  }] }],
      generationConfig: {
        temperature:     0.90,
        maxOutputTokens: 8192,  // 36 topics need ~6k tokens
        // responseMimeType intentionally omitted — it can cause Gemini to wrap
        // the array in an object, which our parser handles but raw text is cleaner
      },
    });

    const data   = await res.json();
    const text   = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const topics = parseTopics(text);

    return NextResponse.json({ topics, source: "gemini", count: topics.length });
  } catch (e) {
    return NextResponse.json(
      { topics: null, source: "static", error: e?.message || "Trending fetch failed" },
      { status: 200 },
    );
  }
}
