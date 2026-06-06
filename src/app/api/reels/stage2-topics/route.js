import { NextResponse } from "next/server";
import { generateMockStage2Topics } from "@/lib/reels/mockStage2Topics";
import { reelsLlmCall } from "@/lib/reels/llm";

// Allow up to 60s on Pro / Hobby respects what it can
export const maxDuration = 60;
import { getEvidenceReport, extractMedicalQuery } from "@/lib/pubmed";
import { getYouTubeDemandReport } from "@/lib/youtube";
import { getRedditSocialSignals } from "@/lib/reddit-public";
import { getCurrentTamilContext } from "@/lib/tamilContext";

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

ABSOLUTE BANS — READ FIRST, THESE OVERRIDE EVERYTHING ELSE:
1. NEVER use these exact sentence structures in any title (any keyword, any category):
   - "...what happens to your body during Karthigai / Ekadasi / Navratri if you are diabetic?"
   - "...during Ramadan is harming more diabetics than it helps..."
   - "...is completely safe for diabetics — the blood sugar truth your doctor skipped"
   - "...one lifestyle shift outperforms 3 medications — my 600 patient reversals prove it"
   - "...the way your yoga instructor told you to fast is wrong..."
2. NEVER reference non-medical authorities: yoga instructor, gym trainer, fitness coach, wellness influencer, nutritionist (these have no PubMed backing)
3. Religious festivals (Karthigai, Ramadan, Ekadasi, Navratri, Diwali): MAXIMUM ONE reference across all 25 topics, AND ONLY when the keyword is specifically about fasting, eating, or diet. For keywords like Kids, Women Health, Gut Secrets, Sleep, Stress, Thyroid — ZERO festival references.
4. NEVER make patient-count claims ("my 600 patients", "1,000+ reversals") in titles — these have no peer-reviewed evidence.
5. Every title MUST map to a verifiable PubMed query — if no published research exists for the specific claim, do NOT generate that topic.

KEYWORD–AUDIENCE MATCHING — CRITICAL:
- If keyword is "Kids" or "Children": topics must be about PEDIATRIC health. Do NOT apply adult fasting/medication frameworks to children.
- If keyword is "Women Health": topics about female-specific conditions (PCOS, hormones, menopause, pregnancy). NOT generic diabetes adult content.
- If keyword is "Gut Secrets" or "Gut Health": topics about gut microbiome, digestion, intestinal health. NOT diabetes medication topics.
- If keyword is "Sleep" or "Stress": topics about sleep science or stress physiology. NOT about festival eating.
- Always adapt the content to what a REAL patient searching that keyword actually wants.

HARD RULES:
- Social Demand (40%) always outweighs Demand (35%)
- Competition Gap is ALWAYS a separate scored field
- Every score must be mathematically correct per the formula

TITLE DIVERSITY — HARD RULE:
- Never start two or more topics with the same word
- The keyword does NOT need to be the first word — put it in the MIDDLE or END of titles
- Use varied openers: "Why...", "How...", "The hidden...", "Stop...", "Most patients...", "3 foods...", "Your doctor's...", "New research:", "Inside the body:", "The real reason...", numbers, questions
- A mix of questions, statements, revelations, and commands is required across all 25 topics
- BANNED: Starting more than 1 topic per response with the same keyword word`;

// ── Level 1 — Gather all real-world demand signals in parallel ────────────────
// YouTube + Reddit + Google Trends run simultaneously.
// Total latency = slowest of the 3 (~3-5s), not their sum.
// Non-critical: if any signal fails, we proceed with nulls and LLM estimates.
async function runLevel1Signals(keyword) {
  console.log(`[stage2/L1] Gathering demand signals for: "${keyword}"`);

  // Google Trends scraper removed (fragile/unofficial) — YouTube signals cover demand.
  const [yt, reddit] = await Promise.allSettled([
    getYouTubeDemandReport(keyword, { maxResults: 5, regionCode: "IN" }),
    getRedditSocialSignals(keyword),
  ]);

  const youtube = yt.status      === "fulfilled" ? yt.value      : null;
  const redditD = reddit.status  === "fulfilled" ? reddit.value  : null;

  if (yt.reason)      console.warn("[stage2/L1] YouTube failed:", yt.reason?.message);
  if (reddit.reason)  console.warn("[stage2/L1] Reddit failed:", reddit.reason?.message);

  // ── Unified SOCIAL signal ───────────────────────────────────────────────────
  // Reddit public JSON is blocked (403) for server-side requests, so it almost
  // always returns 0. Prefer real Reddit data ONLY when it actually came back
  // with engagement (>0); otherwise fall back to YouTube engagement, which is a
  // real, working social-demand proxy (comment volume + like rate).
  const redditScore = redditD?.socialScore ?? 0;
  const ytSocial    = youtube?.socialScore ?? null;

  let socialSignalScore  = null;
  let socialSignalSource = null;
  if (redditScore > 0) {
    socialSignalScore  = redditScore;
    socialSignalSource = "reddit";
  } else if (ytSocial != null) {
    socialSignalScore  = ytSocial;
    socialSignalSource = "youtube";
  }

  // Aggregate into a single demand context object for the LLM prompt
  const demandContext = {
    youtube_demand_score:   youtube?.demandScore      ?? null,
    youtube_competition:    youtube?.competitionScore ?? null,
    youtube_gap:            youtube?.competitionGap   ?? null,
    youtube_total_views:    youtube?.totalViews       ?? null,
    youtube_total_comments: youtube?.totalComments    ?? null,
    youtube_engagement:     youtube?.engagementRate   ?? null,
    youtube_social_score:   youtube?.socialScore      ?? null,
    youtube_top_titles:     youtube?.topTitles        ?? [],
    reddit_social_score:    redditD?.socialScore      ?? null,
    reddit_total_comments:  redditD?.totalComments    ?? null,
    reddit_questions:       redditD?.patientQuestions ?? [],
    reddit_top_posts:       redditD?.topPostTitles    ?? [],
    reddit_blocked:         redditScore === 0,        // honest flag for the UI
    // Unified social signal the scorer + UI actually consume:
    social_signal_score:    socialSignalScore,
    social_signal_source:   socialSignalSource,       // "reddit" | "youtube" | null
  };

  console.log(`[stage2/L1] Done — YT demand:${demandContext.youtube_demand_score} YT social:${ytSocial} Reddit:${redditScore} → social signal:${socialSignalScore} (${socialSignalSource})`);
  return demandContext;
}

// ── Build Level 1 context block for LLM injection ────────────────────────────
function buildDemandContextBlock(ctx) {
  const lines = ["REAL-WORLD DEMAND SIGNALS (use these to inform your scoring, not guess):"];

  if (ctx.youtube_demand_score != null) {
    lines.push(`\nYOUTUBE SIGNALS (India):`);
    lines.push(`  • Demand Score: ${ctx.youtube_demand_score}/100 (${ctx.youtube_demand_score >= 70 ? "HIGH" : ctx.youtube_demand_score >= 40 ? "MODERATE" : "LOW"} demand)`);
    lines.push(`  • Competition: ${ctx.youtube_competition}/100 (gap for Doctor Farmer: ${ctx.youtube_gap}/100)`);
    lines.push(`  • Total views across top 5 videos: ${ctx.youtube_total_views?.toLocaleString()}`);
    if (ctx.youtube_social_score != null) {
      lines.push(`  • Social engagement score: ${ctx.youtube_social_score}/100 (${ctx.youtube_total_comments?.toLocaleString() ?? "?"} comments, ${ctx.youtube_engagement ?? "?"}% like rate across top videos)`);
    }
    if (ctx.youtube_top_titles.length) {
      lines.push(`  • What ALREADY exists (generate DIFFERENT angles, not these):`);
      ctx.youtube_top_titles.forEach(t => lines.push(`    - "${t}"`));
    }
  }

  if (ctx.social_signal_score != null) {
    lines.push(`\nSOCIAL DEMAND SIGNAL (real engagement, source: ${ctx.social_signal_source}):`);
    lines.push(`  • Measured social score: ${ctx.social_signal_score}/100 — calibrate each topic's "social" sub-score around this real value, adjusting up/down per topic's emotional/share potential.`);
  }
  if (ctx.reddit_questions?.length) {
    lines.push(`  • REAL patient questions (generate topics that answer THESE):`);
    ctx.reddit_questions.forEach(q => lines.push(`    - "${q}"`));
  }

  lines.push(`\nSearch trend data: provided via YouTube API signals above.`);

  lines.push(`\nINSTRUCTIONS FOR USING SIGNALS:`);
  lines.push(`  1. YouTube gap (${ctx.youtube_gap ?? "unknown"}/100) → set competition_gap close to this real value`);
  lines.push(`  2. Social score (${ctx.social_signal_score ?? "unknown"}/100) → calibrate "social" sub-scores around this; do NOT inflate every topic to 90+`);
  lines.push(`  3. YouTube top titles → your topics must be DIFFERENTIATED from these (different angle, not same topic)`);
  lines.push(`  4. Use the YouTube demand score above to calibrate demand scores against real interest.`);

  return lines.join("\n");
}

// ── Tamil seasonal/festival context block (Improvement 1) ────────────────────
function buildTamilContextBlock(tc) {
  if (!tc) return "";
  return `\nTAMIL CULTURAL CONTEXT (current month):
Season: ${tc.season}
Festival: ${tc.festival || "None this month"}
Health angle: ${tc.festival_health_angle}
Regional boost keywords: ${tc.regional_boost_keywords.join(", ")}
Social score instruction: If the topic connects to any boost keyword above, add ${tc.social_score_boost} points to its social signal score before final scoring. This reflects Tamil Nadu audience WhatsApp share-worthiness.\n`;
}

// ── Creator-history block (Improvement 4) ────────────────────────────────────
function buildUsedTopicsBlock(usedTopics) {
  if (!usedTopics || !usedTopics.length) return "";
  return `\nCREATOR HISTORY — ALREADY COVERED TOPICS:
The following topics have already been made by this creator.
Penalize any generated topic that closely matches these by -20 score.
"Close match" = same core claim or angle, even if differently worded.
Do not generate topics that are essentially duplicates of these.
Used topics: ${usedTopics.slice(0, 50).join(" | ")}

Instruction: For each topic you generate, check against this list. If the topic is a near-duplicate of a used topic, set is_used_topic: true and subtract 20 from its final score. If score drops below 50 after penalty, set verdict to "REFRAME".\n`;
}

// ── why_now instruction (Improvement 2) ──────────────────────────────────────
const WHY_NOW_RULES = `
WHY_NOW — REQUIRED for every topic:
Add a "why_now" field (2 sentences max) explaining why this topic is timely RIGHT NOW.
Must reference at least one of: the current season/festival context above; PubMed evidence count (e.g. "47 studies support this"); competitor gap (e.g. "No major Tamil creator has covered this angle"); WhatsApp share-worthiness for the Tamil audience; or a regional Tamil Nadu health concern (diabetes/PCOS/gut prevalence).
why_now must be in English even if the topic is in Tamil. Clinical tone, no marketing language, max 2 sentences.`;

function buildPrompt(keyword, demandContext = null, opts = {}) {
  const { tamilContext = null, usedTopics = [], finalCategories = ALL_CATEGORIES } = opts;
  const topicsPerCat = 5;
  const totalTopics  = finalCategories.length * topicsPerCat;

  const demandBlock =
    (demandContext ? `\n\n${buildDemandContextBlock(demandContext)}\n` : "\n") +
    buildTamilContextBlock(tamilContext) +
    buildUsedTopicsBlock(usedTopics) +
    "\n";

  // Build category instruction list (only selected categories)
  const catLines = finalCategories.map(cat =>
    cat === "myth"
      ? "- myth: { false_myth: [3 topics], true_myth: [2 topics] }"
      : `- ${cat}: [5 topics]`
  ).join("\n");

  // Build category-filter override (only needed when a subset is selected)
  const skippedCats = ALL_CATEGORIES.filter(c => !finalCategories.includes(c));
  const categoryOverride = skippedCats.length > 0
    ? `\n⚠️ CATEGORY FILTER — CRITICAL OVERRIDE:\nGenerate ONLY these ${finalCategories.length} categories: ${finalCategories.join(", ")}\nDO NOT generate any other category — skip entirely: ${skippedCats.join(", ")}\nThe system prompt lists 5 categories; this request overrides it to ${finalCategories.length}.\n`
    : "";

  // Build dynamic JSON schema (only selected categories)
  const topicShape = `{"anchor_type":"A","anchor_note":"...","title":"...","description":"...","demand":0,"social":0,"competition_gap":0,"fit":0,"score":0,"why_now":"...","is_used_topic":false}`;
  const jsonParts = [];
  if (finalCategories.includes("myth")) {
    jsonParts.push(`  "myth": {\n    "false_myth": [${topicShape}],\n    "true_myth": [...]\n  }`);
  }
  for (const cat of ["problem", "faq", "contrarian", "clinical"]) {
    if (finalCategories.includes(cat)) {
      jsonParts.push(`  "${cat}": [${topicShape}]`);
    }
  }
  const jsonSchema = `{\n${jsonParts.join(",\n")}\n}`;

  // Build title-format section (only for selected categories)
  const titleFormats = [];
  if (finalCategories.includes("myth")) {
    titleFormats.push(`myth (false_myth): challenge a specific belief a patient holds — use their own words against the myth.
  ANGLES: "The [number] foods diabetics avoid that actually spike insulin more than [keyword]" | "Your [keyword] number looks normal but you're already in trouble" | "Doctors stopped recommending [keyword] in 2019 — here's why patients still do it"

myth (true_myth): validate something patients suspect but can never confirm.
  ANGLES: "Your body already knows [keyword] isn't working — here's the proof" | "Why [keyword] works differently after age 40 in South Indian women"`);
  }
  if (finalCategories.includes("problem")) {
    titleFormats.push(`problem: reveal a specific mechanism + name the fix.
  ANGLES: "The [specific time of day] [keyword] mistake triggering cortisol spikes in Tamil Nadu patients" | "Why [keyword] is destroying your sleep without you knowing — fix in 3 steps"`);
  }
  if (finalCategories.includes("faq")) {
    titleFormats.push(`faq: answer the real question patients type at 2am.
  ANGLES: "My doctor said [keyword] is fine — so why is my HbA1c still rising?" | "How long before [keyword] changes your fasting glucose?" | "Can PCOD patients use [keyword] the same way diabetics do?"`);
  }
  if (finalCategories.includes("contrarian")) {
    titleFormats.push(`contrarian: pick a fight with standard advice using real data.
  ANGLES: "The [keyword] study your dietitian cited was done on 23 people in 1987" | "ICMR quietly changed its [keyword] guidance last year — nobody told your doctor"`);
  }
  if (finalCategories.includes("clinical")) {
    titleFormats.push(`clinical: specific patient observation or Indian research finding.
  ANGLES: "In 847 MHS patients, [keyword] did X — the outliers taught us Y" | "Tamil Nadu vs Kerala: why [keyword] affects blood sugar differently across South India"`);
  }

  return `Generate exactly ${totalTopics} Doctor Farmer validated topics for the keyword: "${keyword}"${demandBlock}${categoryOverride}
${finalCategories.length} categories — 5 topics each:
${catLines}

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
- why_now: 2 sentences max — why this topic is timely now (see WHY_NOW rules below)
- is_used_topic: boolean — default false; true only if it duplicates a creator-history topic (see CREATOR HISTORY block above, if present)
${WHY_NOW_RULES}

DIVERSITY — HARD RULES (enforced before anything else):
⚠️ Every title MUST be completely unique in structure, angle, and wording.
⚠️ NEVER repeat the same sentence skeleton across topics (e.g. "[keyword] during Ramadan…" can appear AT MOST ONCE across all ${totalTopics} topics).
⚠️ NEVER use "what happens to your body during Karthigai / Ekadasi / Navratri" — this phrase is banned.
⚠️ NEVER use "[keyword] is completely safe for diabetics — the blood sugar truth your doctor skipped" — banned.
⚠️ NEVER use "[keyword] during Ramadan is harming more diabetics than it helps" — banned.
⚠️ Vary the PATIENT situation in every topic: some address newly diagnosed, some address 10-year diabetics, some address family members, some address PCOD patients, some address pre-diabetics.
⚠️ NEVER start any title with "Will".
⚠️ NEVER reference non-medical authorities in titles — banned: "yoga instructor", "gym trainer", "fitness coach", "wellness influencer", "nutritionist said", "dietitian told". Only Dr. Raj (Doctor Farmer) and published research are valid authorities.
⚠️ NEVER write titles where the claim is personal opinion or anecdote with no possible PubMed backing (e.g. "my yoga teacher", "what influencers get wrong"). Every title must be verifiable against peer-reviewed research.

CULTURAL INTERSECTION RULE (max 1 across all ${totalTopics} topics):
- At most ONE topic may reference a religious festival (Karthigai / Ramadan / Ekadasi / Navratri / Diwali).
- Only include it if the keyword is directly related to eating, fasting, or diet.
- For non-food keywords (e.g. "Women Health", "Sleep", "Stress") do NOT force a festival angle.

TITLE FORMAT — write from these ANGLES (pick different ones per topic, never repeat the same angle twice):
${titleFormats.join("\n\n")}

Scoring guides:
- demand: rising 12+ months = 80–100 | flat high volume = 60–79 | falling/niche = 0–59
- social: myth-busters/problem-reveals = 88–96 | culturally specific = 90–98 | general tips = 30–50
- competition_gap: generic creators only, doctor-authority gap open = 70–90 | almost no doctors = 90–100 | other doctors active = 20–50
- fit: diabetic/PCOD + MHS funnel + South Indian food = 90–100 | partial match = 50–69

Return ONLY valid JSON — no markdown, no code fences:
${jsonSchema}

Scores must be mathematically correct.${finalCategories.includes("myth") ? " false_myth must have exactly 3 items. true_myth must have exactly 2 items." : ""} All non-myth arrays must have exactly 5 items.`;
}

// ── Per-category prompt (Improvement 3) — regenerate ONE category only ───────
function buildCategoryPrompt(keyword, category, demandContext = null, opts = {}) {
  const { tamilContext = null, usedTopics = [] } = opts;
  const ctxBlock =
    (demandContext ? `\n\n${buildDemandContextBlock(demandContext)}\n` : "\n") +
    buildTamilContextBlock(tamilContext) +
    buildUsedTopicsBlock(usedTopics) +
    "\n";

  const example = category === "myth"
    ? `{"myth":{"false_myth":[{"anchor_type":"A","anchor_note":"...","title":"...","description":"...","demand":0,"social":0,"competition_gap":0,"fit":0,"score":0,"why_now":"...","is_used_topic":false}],"true_myth":[...]}}`
    : `{"${category}":[{"anchor_type":"A","anchor_note":"...","title":"...","description":"...","demand":0,"social":0,"competition_gap":0,"fit":0,"score":0,"why_now":"...","is_used_topic":false}]}`;

  return `Regenerate ONLY the "${category}" category — fresh topics — for the keyword: "${keyword}"${ctxBlock}

Generate ${category === "myth" ? "5 myth topics (exactly 3 false_myth + 2 true_myth)" : `exactly 5 ${category} topics`} using the SAME Doctor Farmer rules: keyword anchoring (A/B/C), every ban rule, title diversity (never start two topics with the same word), and the scoring formula:
score = Math.round(((demand*0.35 + social*0.40 + competition_gap*0.20 + fit*0.20) / 115) * 100)

For every topic include: anchor_type, anchor_note, title, description, demand, social, competition_gap, fit, score, why_now, is_used_topic.
${WHY_NOW_RULES}

Return ONLY valid JSON (no markdown, no code fences):
${example}`;
}

function sliceToCategory(full, category) {
  if (!category) return full;
  if (category === "myth") return { myth: full.myth };
  return { [category]: full[category] };
}

// ── Pre-Check Pipeline — PubMed validation for ALL 25 topics ─────────────────
//
// Runs AFTER LLM generates topics. For every topic:
//   1. Extract a clean medical query from the creative title
//   2. Call NCBI getEvidenceReport() in parallel (quality-aware: volume + study type + recency)
//   3. Apply the real evidence score heavily to the `fit` sub-score (70% real / 30% LLM)
//      → `fit` is the clinical alignment score — this is where the mismatch lived
//   4. Blend totalCount density lightly into `demand` (40% real / 60% LLM)
//   5. Recalculate the composite score with both adjusted sub-scores
//   6. Auto-downgrade: evidence_score < 40 OR totalCount < 10 → cap score at 69 (REFRAME)
//   7. Drop: totalCount < 10 → no research base exists at all
//   8. Re-sort each category best-first
//
// getEvidenceReport does esearch + esummary per topic (retmax=5, ~2 calls each).
// 25 topics × 2 = 50 NCBI calls. With API key (10 req/s), completes in ~5–8s.
// ─────────────────────────────────────────────────────────────────────────────

// totalCount < DROP_THRESHOLD → drop topic entirely (no research base)
const PUBMED_COUNT_DROP_THRESHOLD = 10;
// evidence_score < REFRAME_THRESHOLD → force verdict to REFRAME (cap overall at 69)
const PUBMED_EVIDENCE_REFRAME_THRESHOLD = 40;

// Score formula matching the Doctor Farmer system
function calcScore(demand, social, competitionGap, fit) {
  return Math.min(100, Math.round(
    ((demand * 0.35 + social * 0.40 + competitionGap * 0.20 + fit * 0.20) / 115) * 100
  ));
}

async function runPubMedPreCheck(topicsObj) {
  // ── 1. Flatten all topics, tagging each with its category/subtype ──────────
  const tagged = [
    ...(topicsObj.myth?.false_myth ?? []).map(t => ({ ...t, _cat: "myth", _sub: "false_myth" })),
    ...(topicsObj.myth?.true_myth  ?? []).map(t => ({ ...t, _cat: "myth", _sub: "true_myth"  })),
    ...(topicsObj.problem    ?? []).map(t => ({ ...t, _cat: "problem"    })),
    ...(topicsObj.faq        ?? []).map(t => ({ ...t, _cat: "faq"        })),
    ...(topicsObj.contrarian ?? []).map(t => ({ ...t, _cat: "contrarian" })),
    ...(topicsObj.clinical   ?? []).map(t => ({ ...t, _cat: "clinical"   })),
  ];

  if (!tagged.length) return topicsObj;

  // ── 2. Run full quality-aware evidence reports in parallel ────────────────
  // getEvidenceReport scores: volume (25pts) + study quality (50pts) + recency (25pts)
  // This matches exactly what Stage 3 Med Quick-Check uses — no more mismatch.
  const settled = await Promise.allSettled(
    tagged.map(t =>
      getEvidenceReport(extractMedicalQuery(t.title, keyword), { maxResults: 5, minYear: 2018 })
        .catch(() => null)
    )
  );
  const reports = settled.map(r => r.status === "fulfilled" ? r.value : null);

  console.log(`[stage2-topics] PubMed pre-check: ${tagged.length} topics checked`);

  // ── 3. Enrich, filter, and re-score every topic ───────────────────────────
  const enriched = tagged
    .map((t, i) => {
      const report = reports[i]; // null = API failed → preserve LLM scores

      if (!report) {
        return { ...t, pubmed_verified: false, _drop: false };
      }

      const { evidence, evidence: { score: evidenceScore, totalCount, label: evidenceLabel } } = report;

      // `fit` is the clinical-alignment sub-score — apply evidence score here
      // so Stage 2 scores predict Stage 3 Med Quick-Check results accurately.
      // Blend: 70% real quality-aware evidence + 30% LLM structural fit
      const adjustedFit = Math.round(t.fit * 0.30 + evidenceScore * 0.70);

      // `demand` gets a lighter touch — totalCount as density proxy
      // Blend: 60% LLM search-demand estimate + 40% real NCBI count density
      const densityProxy = Math.min(100, Math.round((totalCount / 500) * 100));
      const adjustedDemand = Math.round(t.demand * 0.60 + densityProxy * 0.40);

      // Recalculate composite score with both adjusted sub-scores
      const newScore = calcScore(
        adjustedDemand,
        t.social          ?? 75,
        t.competition_gap ?? 75,
        adjustedFit,
      );

      // Force REFRAME for weak evidence (matches Stage 3 "caution" threshold)
      const weakEvidence = evidenceScore < PUBMED_EVIDENCE_REFRAME_THRESHOLD;

      return {
        ...t,
        demand:               adjustedDemand,
        fit:                  adjustedFit,
        score:                weakEvidence ? Math.min(newScore, 69) : newScore,
        pubmed_evidence_score: evidenceScore,
        pubmed_evidence_label: evidenceLabel,
        pubmed_total_count:   totalCount,
        pubmed_verified:      true,
        // Internal: drop if literally no papers exist on this specific claim
        _drop: totalCount < PUBMED_COUNT_DROP_THRESHOLD,
      };
    })
    // ── 4. Drop topics with no research base ──────────────────────────────────
    .filter(t => !t._drop);

  console.log(`[stage2-topics] After pre-check: ${enriched.length}/${tagged.length} topics kept`);

  // ── 5. Rebuild structure per category, sorted best-score first ────────────
  function rebuild(cat, sub = null) {
    return enriched
      .filter(t => t._cat === cat && (!sub || t._sub === sub))
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .map(({ _cat, _sub, _drop, ...rest }) => rest); // strip internal flags
  }

  // Dynamic rebuild — only include categories present in the original input
  const result = {};
  if (topicsObj.myth !== undefined) {
    result.myth = { false_myth: rebuild("myth", "false_myth"), true_myth: rebuild("myth", "true_myth") };
  }
  for (const cat of ["problem", "faq", "contrarian", "clinical"]) {
    if (topicsObj[cat] !== undefined) result[cat] = rebuild(cat);
  }
  return result;
}

// ── Post-generation ban filter ────────────────────────────────────────────────
// Catches LLM defiance of absolute ban rules regardless of model.
// 1. Drop titles that match known-banned sentence structures
// 2. Enforce max-1 festival reference across ALL generated topics
//
// This runs BEFORE PubMed pre-check so banned topics never enter the pipeline.
// ─────────────────────────────────────────────────────────────────────────────

const FESTIVAL_RE = /\b(karthigai|ekadasi|navratri|ramadan|diwali)\b/i;

const BANNED_TITLE_PATTERNS = [
  // The slash-combo festival pattern ("Karthigai / Ekadasi / Navratri")
  /karthigai\s*[\/|]\s*ekadasi/i,
  // "during Ramadan is harming more diabetics"
  /during\s+ramadan\s+is\s+harm/i,
  // "is completely safe for diabetics — the blood sugar truth your doctor skipped"
  /is\s+completely\s+safe\s+for\s+diabetics/i,
  // Patient-count authority claims ("my 600 patient reversals prove it")
  /my\s+\d+\s+patient\s+reversals?\s+prove/i,
  /\d+\s+patient\s+reversals?\s+prove/i,
  // Non-medical authorities in titles
  /\byoga\s+instructor\b/i,
  /\bgym\s+trainer\b/i,
  /\bfitness\s+coach\b/i,
  /\bwellness\s+influencer\b/i,
  // "the way your yoga instructor told you to fast is wrong"
  /yoga\s+instructor\s+told/i,
];

function filterBannedTopics(topicsObj) {
  const tagged = [
    ...(topicsObj.myth?.false_myth ?? []).map(t => ({ ...t, _cat: "myth", _sub: "false_myth" })),
    ...(topicsObj.myth?.true_myth  ?? []).map(t => ({ ...t, _cat: "myth", _sub: "true_myth"  })),
    ...(topicsObj.problem    ?? []).map(t => ({ ...t, _cat: "problem"    })),
    ...(topicsObj.faq        ?? []).map(t => ({ ...t, _cat: "faq"        })),
    ...(topicsObj.contrarian ?? []).map(t => ({ ...t, _cat: "contrarian" })),
    ...(topicsObj.clinical   ?? []).map(t => ({ ...t, _cat: "clinical"   })),
  ];

  let festivalSlots = 0; // max 1 across all topics
  let dropped = 0;
  const kept = [];

  for (const t of tagged) {
    const title = t.title ?? "";

    // Hard ban: exact structural violations
    if (BANNED_TITLE_PATTERNS.some(pat => pat.test(title))) {
      console.log(`[stage2/ban-filter] ❌ Banned pattern: "${title.slice(0, 70)}"`);
      dropped++;
      continue;
    }

    // Festival quota: max 1 across all 25 topics
    if (FESTIVAL_RE.test(title)) {
      if (festivalSlots >= 1) {
        console.log(`[stage2/ban-filter] ❌ Festival quota exceeded: "${title.slice(0, 70)}"`);
        dropped++;
        continue;
      }
      festivalSlots++;
    }

    kept.push(t);
  }

  if (dropped > 0) console.log(`[stage2/ban-filter] Dropped ${dropped}/${tagged.length} topics`);

  function rebuild(cat, sub = null) {
    return kept
      .filter(t => t._cat === cat && (!sub || t._sub === sub))
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .map(({ _cat, _sub, ...rest }) => rest);
  }

  const result = {};
  if (topicsObj.myth !== undefined) {
    result.myth = { false_myth: rebuild("myth", "false_myth"), true_myth: rebuild("myth", "true_myth") };
  }
  for (const cat of ["problem", "faq", "contrarian", "clinical"]) {
    if (topicsObj[cat] !== undefined) result[cat] = rebuild(cat);
  }
  return result;
}

// ── Level 2 Regeneration Loop ─────────────────────────────────────────────────
// For every topic that failed PubMed (evidence_score < 40):
//   1. Ask the LLM to reframe the claim toward established research
//   2. Re-run PubMed check on the new topic
//   3. If it passes → replace the failed topic
//   4. If it fails again → drop it
// Max 2 retries per topic to avoid blocking the pipeline.
const MAX_REGEN_RETRIES = 2;
const REGEN_PASS_THRESHOLD = 40;

async function regenTopic(failedTopic, keyword, req) {
  const regenPrompt = `You are the Doctor Farmer Content Engine. A topic failed medical verification.

KEYWORD: "${keyword}"
FAILED TOPIC: "${failedTopic.title}"
CATEGORY: ${failedTopic._cat}
FAILURE REASON: PubMed evidence score was below 40/100 — the specific claim has insufficient published research.

Generate ONE replacement topic in the SAME category that:
1. Covers the SAME general area (${failedTopic._cat} about "${keyword}")
2. Uses a claim angle that IS supported by published medical research (RCTs, meta-analyses, systematic reviews)
3. Keeps the same Doctor Farmer voice and viral/social potential
4. Still satisfies the keyword anchor rule (A/B/C)

Return ONLY valid JSON for ONE topic object:
{"anchor_type":"A","anchor_note":"...","title":"...","description":"...","demand":0,"social":0,"competition_gap":0,"fit":0,"score":0}

Do NOT wrap in markdown. Do NOT add extra fields.`;

  // Single attempt — no retry loop (saves 30-40s when many topics fail)
  try {
    const { parsed } = await reelsLlmCall(req, {
      system:      SYSTEM,
      user:        regenPrompt,
      temperature: 0.8,
      maxTokens:   400,
      isJson:      true,
    });

    if (!parsed?.title) return null;
    // Reject regen topics that also violate ban rules
    if (BANNED_TITLE_PATTERNS.some(p => p.test(parsed.title)) || FESTIVAL_RE.test(parsed.title)) {
      console.log(`[stage2/L2-regen] ❌ Regen topic also banned: "${parsed.title.slice(0, 60)}"`);
      return null;
    }

    const report = await getEvidenceReport(
      extractMedicalQuery(parsed.title, keyword),
      { maxResults: 5, minYear: 2018 }
    ).catch(() => null);

    const evidenceScore = report?.evidence?.score ?? 0;
    const totalCount    = report?.evidence?.totalCount ?? 0;

    if (evidenceScore >= REGEN_PASS_THRESHOLD && totalCount >= 10) {
      console.log(`[stage2/L2-regen] ✅ "${failedTopic.title.substring(0,30)}..." → "${parsed.title.substring(0,30)}..." (${evidenceScore})`);
      const adjustedFit    = Math.round(parsed.fit * 0.30 + evidenceScore * 0.70);
      const densityProxy   = Math.min(100, Math.round((totalCount / 500) * 100));
      const adjustedDemand = Math.round(parsed.demand * 0.60 + densityProxy * 0.40);
      const newScore       = calcScore(adjustedDemand, parsed.social ?? 75, parsed.competition_gap ?? 75, adjustedFit);
      return {
        ...parsed,
        _cat: failedTopic._cat, _sub: failedTopic._sub,
        demand: adjustedDemand, fit: adjustedFit, score: newScore,
        pubmed_evidence_score: evidenceScore,
        pubmed_evidence_label: report?.evidence?.label ?? "Moderate Evidence",
        pubmed_total_count: totalCount,
        pubmed_verified: true, _regenerated: true,
      };
    }
  } catch (e) {
    console.warn(`[stage2/L2-regen] error:`, e.message);
  }

  return null;
}

// ── Run regeneration for all failed topics in parallel ───────────────────────
async function runRegenerationLoop(topicsObj, keyword, req) {
  const CAT_KEYS = ["myth_false", "myth_true", "problem", "faq", "contrarian", "clinical"];

  // Flatten with category tags
  const all = [
    ...(topicsObj.myth?.false_myth ?? []).map(t => ({ ...t, _cat: "myth", _sub: "false_myth" })),
    ...(topicsObj.myth?.true_myth  ?? []).map(t => ({ ...t, _cat: "myth", _sub: "true_myth"  })),
    ...(topicsObj.problem    ?? []).map(t => ({ ...t, _cat: "problem"    })),
    ...(topicsObj.faq        ?? []).map(t => ({ ...t, _cat: "faq"        })),
    ...(topicsObj.contrarian ?? []).map(t => ({ ...t, _cat: "contrarian" })),
    ...(topicsObj.clinical   ?? []).map(t => ({ ...t, _cat: "clinical"   })),
  ];

  const failed = all.filter(t =>
    t.pubmed_evidence_score != null &&
    t.pubmed_evidence_score < REGEN_PASS_THRESHOLD
  );
  const passed = all.filter(t =>
    t.pubmed_evidence_score == null ||
    t.pubmed_evidence_score >= REGEN_PASS_THRESHOLD
  );

  if (!failed.length) return topicsObj; // nothing to regenerate

  console.log(`[stage2/L2-regen] ${failed.length} topics need regeneration`);

  // Run regenerations in parallel (all failed topics at once)
  const regenResults = await Promise.all(
    failed.map(t => regenTopic(t, keyword, req))
  );

  const regenerated = regenResults.filter(Boolean); // drop nulls (double-failed)
  const final       = [...passed, ...regenerated];

  console.log(`[stage2/L2-regen] ${regenerated.length}/${failed.length} successfully regenerated, ${failed.length - regenerated.length} dropped`);

  // Rebuild structure — only include categories present in the original input
  function rebuild(cat, sub = null) {
    return final
      .filter(t => t._cat === cat && (!sub || t._sub === sub))
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .map(({ _cat, _sub, _drop, _regenerated, ...rest }) => rest);
  }

  const result = {};
  if (topicsObj.myth !== undefined) {
    result.myth = { false_myth: rebuild("myth", "false_myth"), true_myth: rebuild("myth", "true_myth") };
  }
  for (const cat of ["problem", "faq", "contrarian", "clinical"]) {
    if (topicsObj[cat] !== undefined) result[cat] = rebuild(cat);
  }
  return result;
}

// ── Social Score Adjustment ──────────────────────────────────────────────────
// Blends the real social signal (Reddit if available, else YouTube engagement)
// into each topic's `social` sub-score so the displayed score reflects real data
// instead of a pure LLM/mock guess.
//
// Rules (socialSignalScore = unified real signal, 0–100):
//   signal ≥ 10: blend 55% LLM/mock + 45% real signal
//   signal < 10: clamp social to ≤ 72 (no real engagement → no false confidence)
//   signal null: leave topics untouched
// ─────────────────────────────────────────────────────────────────────────────
function applySocialAdjustment(topicsObj, socialSignalScore) {
  if (socialSignalScore == null) return topicsObj;

  function adjustTopic(t) {
    let adjustedSocial;
    if (socialSignalScore >= 10) {
      // Real engagement found: blend estimate with real signal
      adjustedSocial = Math.round((t.social ?? 75) * 0.55 + socialSignalScore * 0.45);
    } else {
      // No real activity: clamp over-estimation — max social = 72
      adjustedSocial = Math.min(t.social ?? 75, 72);
    }
    const newScore = calcScore(t.demand ?? 75, adjustedSocial, t.competition_gap ?? 75, t.fit ?? 75);
    return { ...t, social: adjustedSocial, score: newScore };
  }

  function adjustArr(arr) {
    return (arr ?? [])
      .map(adjustTopic)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }

  const result = {};
  if (topicsObj.myth !== undefined) {
    result.myth = {
      false_myth: adjustArr(topicsObj.myth?.false_myth),
      true_myth:  adjustArr(topicsObj.myth?.true_myth),
    };
  }
  for (const cat of ["problem", "faq", "contrarian", "clinical"]) {
    if (topicsObj[cat] !== undefined) result[cat] = adjustArr(topicsObj[cat]);
  }
  return result;
}

// ── Level 1 signals in-memory cache (5 min TTL) ──────────────────────────────
const _l1Cache = new Map();
async function runLevel1SignalsCached(keyword) {
  const key    = keyword.toLowerCase().trim();
  const cached = _l1Cache.get(key);
  if (cached && Date.now() - cached.ts < 300_000) return cached.data;
  const data = await runLevel1Signals(keyword);
  _l1Cache.set(key, { data, ts: Date.now() });
  return data;
}

// ── All valid category ids ────────────────────────────────────────────────────
const ALL_CATEGORIES = ["myth", "problem", "faq", "contrarian", "clinical"];

// ── POST handler — 3-Level Pipeline ──────────────────────────────────────────
export async function POST(req) {
  let keyword         = "health";
  let category        = null;
  let finalCategories = ALL_CATEGORIES; // fallback default
  let demandContext   = null;           // hoisted so demo fallback can include it

  try {
    const body = await req.json();
    keyword  = body.keyword  || "health";
    category = body.category || null;
    const usedTopics   = Array.isArray(body.usedTopics) ? body.usedTopics : [];
    const tamilContext = getCurrentTamilContext();

    // ── Resolve which categories to generate ─────────────────────────────────
    const rawSelected = Array.isArray(body.selectedContentTypes) ? body.selectedContentTypes : ["auto"];
    const categoriesToGenerate =
      rawSelected.includes("auto") || rawSelected.length === 0
        ? ALL_CATEGORIES
        : rawSelected.filter(c => ALL_CATEGORIES.includes(c));
    finalCategories = categoriesToGenerate.length > 0 ? categoriesToGenerate : ALL_CATEGORIES;
    const topicsPerCategory = 5;
    const totalTopics = finalCategories.length * topicsPerCategory;

    // ══════════════════════════════════════════════════════════════════
    // IMPROVEMENT 3 — Per-category refresh (partial, fewer tokens)
    // Generates only the requested 5 topics. Skips Level 1 entirely and
    // reuses cached level1_signals from the client. No PubMed/regen loop.
    // ══════════════════════════════════════════════════════════════════
    if (category) {
      const demandContext = body.level1_signals ?? null;
      const catResult = await Promise.race([
        reelsLlmCall(req, {
          system:      SYSTEM,
          user:        buildCategoryPrompt(keyword, category, demandContext, { tamilContext, usedTopics }),
          temperature: 0.9,
          maxTokens:   2000,
          isJson:      true,
        }),
        new Promise((_, rej) => setTimeout(() => rej(new Error("LLM timeout")), 40000)),
      ]).catch(e => { console.warn("[stage2/category] LLM failed:", e.message); return { parsed: null, source: "demo" }; });

      const parsed = catResult?.parsed;
      if (parsed && parsed[category]) {
        // Apply ban filter to the single-category slice before returning
        let catTopics = parsed[category];
        try {
          const wrapper = category === "myth" ? { myth: catTopics } : { [category]: catTopics };
          const filtered = filterBannedTopics(wrapper);
          catTopics = category === "myth" ? (filtered.myth ?? catTopics) : (filtered[category] ?? catTopics);
        } catch (e) { /* non-fatal */ }
        return NextResponse.json({ category, topics: catTopics, mode: catResult.source });
      }
      // Demo / failure fallback — return just this category's mock slice
      const mock = generateMockStage2Topics(keyword);
      return NextResponse.json({ category, topics: mock[category], mode: "demo" });
    }

    // ══════════════════════════════════════════════════════════════════
    // LEVEL 1 + LEVEL 2 — Run demand signals and LLM IN PARALLEL
    // L1 capped at 4s so it never blocks the LLM call.
    // LLM uses Gemini by default (fast JSON, ~3-5s) falling back to Claude.
    // ══════════════════════════════════════════════════════════════════
    // 25 topics × ~200 tokens each = ~5000 tokens minimum for complete JSON
    const scaledMaxTokens = Math.ceil(6000 * (finalCategories.length / ALL_CATEGORIES.length));

    // Run L1 signals and LLM in parallel to save time
    const [l1Result, llmResult] = await Promise.all([
      // L1 signals — capped at 4s (non-fatal)
      Promise.race([
        runLevel1SignalsCached(keyword),
        new Promise((_, rej) => setTimeout(() => rej(new Error("L1 timeout")), 4000)),
      ]).catch(e => { console.warn("[stage2/L1] Demand signals:", e.message); return null; }),

      // LLM — respects user's model preference (Gemini or Claude)
      Promise.race([
        reelsLlmCall(req, {
          system:      SYSTEM,
          user:        buildPrompt(keyword, null, { tamilContext, usedTopics, finalCategories }),
          temperature: 0.9,
          maxTokens:   Math.max(scaledMaxTokens, 4000),
          isJson:      true,
        }),
        new Promise((_, rej) => setTimeout(() => rej(new Error("LLM timeout")), 50000)),
      ]).catch(e => { console.warn("[stage2] LLM failed:", e.message); return { parsed: null, source: "demo" }; }),
    ]);

    demandContext = l1Result;
    const { parsed, source, fallback_from, fallback_reason } = llmResult ?? {};

    if (parsed) {
      // ══════════════════════════════════════════════════════════════
      // BAN FILTER — strip topics that violate absolute ban rules
      // (festival quota, banned sentence structures, non-medical authorities)
      // Runs before PubMed so banned topics never enter the pipeline.
      // ══════════════════════════════════════════════════════════════
      let clean = parsed;
      try {
        clean = filterBannedTopics(parsed);
      } catch (e) {
        console.warn("[stage2/ban-filter] failed (non-fatal):", e.message);
      }

      // ══════════════════════════════════════════════════════════════
      // LEVEL 2 — PubMed Pre-Check (quality-aware evidence scoring)
      // ══════════════════════════════════════════════════════════════
      let verified = clean;
      try {
        verified = await runPubMedPreCheck(parsed);
      } catch (e) {
        console.warn("[stage2/L2-pubmed] PubMed pre-check failed (non-fatal):", e.message);
      }

      // ══════════════════════════════════════════════════════════════
      // LEVEL 2 — Regeneration Loop
      // Topics that failed PubMed get auto-reframed toward established research.
      // Max 2 retries per topic. Still-failing topics are dropped.
      // ══════════════════════════════════════════════════════════════
      try {
        verified = await runRegenerationLoop(verified, keyword, req);
      } catch (e) {
        console.warn("[stage2/L2-regen] Regeneration loop failed (non-fatal):", e.message);
      }

      // ══════════════════════════════════════════════════════════════
      // SOCIAL ADJUSTMENT
      // Correct LLM over-estimation of social scores using the real social
      // signal (Reddit if available, else YouTube engagement).
      // Must run AFTER PubMed (which adjusts demand/fit) so calcScore is stable.
      // ══════════════════════════════════════════════════════════════
      try {
        if (demandContext?.social_signal_score != null) {
          verified = applySocialAdjustment(verified, demandContext.social_signal_score);
          console.log(`[stage2/social-adj] Social scores adjusted using ${demandContext.social_signal_source} signal: ${demandContext.social_signal_score}`);
        }
      } catch (e) {
        console.warn("[stage2/social-adj] Adjustment failed (non-fatal):", e.message);
      }

      // Filter response to only include the requested categories
      const filteredTopics = {};
      if (finalCategories.includes("myth") && verified.myth !== undefined) {
        filteredTopics.myth = verified.myth;
      }
      for (const cat of ["problem", "faq", "contrarian", "clinical"]) {
        if (finalCategories.includes(cat) && verified[cat] !== undefined) {
          filteredTopics[cat] = verified[cat];
        }
      }

      return NextResponse.json({
        topics:               filteredTopics,
        mode:                 source,
        pubmed_pre_checked:   true,
        level1_signals:       demandContext,
        selectedContentTypes: finalCategories,
        ...(fallback_from ? { fallback_from, fallback_reason } : {}),
      });
    }
  } catch (e) {
    console.error("[stage2-topics] error:", e.message);
  }

  // Demo fallback — demandContext is hoisted so live signals survive LLM failures
  await new Promise((r) => setTimeout(r, 800));
  let mockTopics = generateMockStage2Topics(keyword, finalCategories);
  // Apply the real social signal to mock topics too — so even in demo mode the
  // social/overall scores reflect actual YouTube engagement, not a fixed guess.
  try {
    if (demandContext?.social_signal_score != null) {
      mockTopics = applySocialAdjustment(mockTopics, demandContext.social_signal_score);
    }
  } catch { /* non-fatal */ }
  const filteredMock = (() => { try { return filterBannedTopics(mockTopics); } catch { return mockTopics; } })();
  // Explain WHY we fell back, so the UI can warn the user honestly (medical app).
  const hasAnyKey = !!(
    req.headers.get("x-client-gemini-key") ||
    req.headers.get("x-client-anthropic-key") ||
    req.headers.get("x-client-openai-key")
  );
  const fallback_reason = hasAnyKey
    ? "Live model call failed or timed out (e.g. API quota exceeded)"
    : "No API key configured for the selected model";
  return NextResponse.json({
    topics:               filteredMock,
    mode:                 "demo",
    fallback_reason,
    selectedContentTypes: finalCategories,
    level1_signals:       demandContext, // include even in demo — signals were fetched before LLM failed
  });
}
