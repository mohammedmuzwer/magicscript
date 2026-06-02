// Doctor Farmer Validation Engine v2 — Mock Single-Topic Validation Report
// Used in demo mode (no API key) when a topic is selected in Stage 2
//
// Includes: biggest_weakness, reframe (with delta ≥ +5 pts), verify, opening_line

// ── Weakness pool per lowest-scoring criterion ────────────────────────────────
const WEAKNESS_POOL = {
  competition_gap: [
    "Competition Gap — this topic angle has been picked up by 2–3 credentialed Indian doctors on Instagram in the last 6 months. The window is narrowing fast; reframe to a more clinical or patient-specific angle Doctor Farmer specifically owns.",
    "Competition Gap — moderate saturation from generic fitness influencers. The doctor-authority gap still exists, but a stronger clinical hook is needed to visually separate this reel from non-medical content.",
    "Competition Gap — top-ranking reels on this topic are 12–18 months old and made by non-doctors. The space is technically open but requires a South Indian patient-data angle to own it long-term.",
  ],
  demand: [
    "Demand — search volume for this specific angle is below the threshold for strong discoverability. Consider reframing to attach this topic to the parent keyword with higher monthly searches.",
    "Demand — Google Trends shows a flat interest curve over the last 12 months. Pair this angle with a rising companion keyword to lift the demand score.",
    "Demand — Answer the Public returns sparse question clusters for this precise framing. The audience is not searching here in large enough numbers to justify this exact title.",
  ],
  social: [
    "Social Demand — this topic has informational search value but low Instagram save potential. People may watch it but they will not save it or send it to their mother. The emotional trigger is missing.",
    "Social Demand — no natural scroll-stop hook in the current framing. The topic needs either a myth-bust opening, a problem-reveal, or a cultural intersection to generate the save/share impulse.",
    "Social Demand — competitor reels on this topic show low comment activity. The emotional charge is insufficient for the Instagram algorithm to amplify organically.",
  ],
  fit: [
    "Doctor Farmer Fit — as currently framed, this topic speaks to a general Indian health audience rather than diabetics, PCOD, or thyroid patients specifically. The MHS funnel connection is too indirect.",
    "Doctor Farmer Fit — any wellness creator could make this reel. It does not use Doctor Farmer's clinical authority, patient data, or Tamil Nadu cultural specificity. Reframe to embed the patient community.",
    "Doctor Farmer Fit — no clear path from this topic to the MHS webinar or consultation. Dead-end content builds awareness but does not convert viewers into leads.",
  ],
};

// ── Reframe title patterns per category ───────────────────────────────────────
const REFRAME_PATTERNS = {
  myth: {
    title_pattern: (kw) =>
      `I've told 600 Tamil Nadu diabetic patients the truth about ${kw} — here is what mainstream medicine gets wrong`,
    why: "Grounds the myth-bust in real patient community data — something no generic creator can replicate — and explicitly signals Doctor Farmer's clinical authority.",
  },
  problem: {
    title_pattern: (kw) =>
      `Stop ${kw}ing this way — the mistake 80% of my South Indian diabetic patients make without knowing`,
    why: "Converts a generic problem reveal into a patient-frequency signal, creating urgency and a direct path to the MHS consultation inquiry.",
  },
  faq: {
    title_pattern: (kw) =>
      `${kw} — what I tell my 1,000+ Tamil Nadu patients every single day that Google cannot answer`,
    why: "Transforms a cold FAQ into a warm patient-community signal, driving comment engagement and consultation inquiries from viewers who want the same answer.",
  },
  contrarian: {
    title_pattern: (kw) =>
      `Everything you were told about ${kw} is wrong — I have 600 patient reversals to prove it`,
    why: "Backs the contrarian position with patient outcome data, giving Doctor Farmer legal and clinical credibility that no fitness influencer can replicate or challenge.",
  },
  clinical: {
    title_pattern: (kw) =>
      `The ${kw} clinical protocol I use at My Health School — exactly what I prescribe and why, from a doctor`,
    why: "Positions Doctor Farmer's MHS program protocol as the gold standard, making this the definitive clinical reference on this topic and driving consultation inquiries.",
  },
};

// ── Opening line pool per category ────────────────────────────────────────────
const OPENING_LINES = {
  myth: [
    "உங்க doctor உங்களுக்கு இந்த truth சொல்லிருப்பாங்களா? Probably not. And that's exactly why you need to watch this.",
    "My patients come to me after 3 years of wrong advice. Let me tell you what their doctors got wrong — in the next 60 seconds.",
    "If you fast and you are diabetic — stop. Watch this first. I have seen what happens when people get this wrong.",
  ],
  problem: [
    "என் clinic-ல வர்ற every second diabetic patient has this problem. None of them know they are doing it.",
    "Your blood sugar is going in the wrong direction. Not because of your food. Because of this one hidden pattern.",
    "90% of my new patients are making this mistake. I can tell within 10 minutes of their first consultation.",
  ],
  faq: [
    "என் patients எல்லாரும் ஒரே question கேக்கிறாங்க — and today I am answering it for all of you at once.",
    "1,000+ Tamil Nadu diabetics asked me this exact question. Here is the honest clinical answer — not what Google tells you.",
    "Patients ask me this in every consultation. Today I am saying it publicly so you do not have to ask alone.",
  ],
  contrarian: [
    "I am a doctor. I am supposed to support mainstream advice. But after 600 patient reversals — I cannot stay quiet.",
    "Everything you read online about this is incomplete. I know because my patients follow that advice and come to me worse.",
    "Your wellness influencer told you one thing. My patients' lab reports tell a different story.",
  ],
  clinical: [
    "In my 10+ years of treating diabetics in Tamil Nadu — this is what the data from my own patients shows.",
    "This is what I explain on day one of every My Health School enrollment. Today I am sharing it publicly.",
    "Western research says one thing. Indian patient data says another. As a Tamil Nadu doctor, I see the difference every day.",
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function pick(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function dfScore(d, s, cg, f) {
  const raw = d * 0.35 + s * 0.40 + cg * 0.20 + f * 0.20;
  return Math.round((raw / 115) * 100);
}

function pickWeakness(demand, social, competition_gap, fit) {
  const criteria = [
    { key: "demand",          score: demand },
    { key: "social",          score: social },
    { key: "competition_gap", score: competition_gap },
    { key: "fit",             score: fit },
  ];
  const weakest = [...criteria].sort((a, b) => a.score - b.score)[0];
  const pool    = WEAKNESS_POOL[weakest.key] ?? WEAKNESS_POOL.social;
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildVerify(title) {
  const words = title.replace(/[^a-zA-Z0-9 ]/g, "").split(" ").filter((w) => w.length > 3);
  const kw1   = (words[0] ?? "fasting").toLowerCase();
  const kw2   = (words[1] ?? "diabetes").toLowerCase();
  return {
    ubersuggest:       `${kw1} for Indian diabetics`,
    answer_the_public: `${kw1} ${kw2} India`,
    google_trends:     `${kw1} vs intermittent fasting vs lifestyle reversal`,
    seo_angle:         `${kw1} diet plan for South Indian diabetics 2024`,
  };
}

function buildOpeningLine(tabId) {
  const pool = OPENING_LINES[tabId] ?? OPENING_LINES.faq;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Build the reframe and ensure score delta ≥ +5 points.
 */
function buildReframe(topic, tabId, originalScore) {
  const pattern   = REFRAME_PATTERNS[tabId] ?? REFRAME_PATTERNS.faq;
  const titleBase = topic.title.split(" ").slice(0, 2).join(" ");
  const rfTitle   = pattern.title_pattern(titleBase);

  // Boost scores — reframe must score at least 5 pts higher
  let attempts = 0;
  let rf_demand, rf_social, rf_cg, rf_fit, rf_score;

  do {
    rf_demand = Math.min(100, topic.demand          + pick(4 + attempts, 9 + attempts));
    rf_social = Math.min(100, topic.social          + pick(5 + attempts, 12 + attempts));
    rf_cg     = Math.min(100, topic.competition_gap + pick(4 + attempts, 10 + attempts));
    rf_fit    = Math.min(100, topic.fit             + pick(6 + attempts, 14 + attempts));
    rf_score  = dfScore(rf_demand, rf_social, rf_cg, rf_fit);
    attempts++;
  } while (rf_score - originalScore < 5 && attempts < 10);

  const delta = rf_score - originalScore;

  return {
    title:           rfTitle,
    why_stronger:    pattern.why,
    demand:          rf_demand,
    social:          rf_social,
    competition_gap: rf_cg,
    fit:             rf_fit,
    score:           rf_score,
    _originalScore:  originalScore,
    delta,
  };
}

/**
 * Generate a full mock validation report for a selected topic.
 *
 * @param {{ title, demand, social, competition_gap, fit, score }} topic
 * @param {string} tabId  — "myth" | "problem" | "faq" | "contrarian" | "clinical"
 * @returns {object}
 */
export function generateMockValidation(topic, tabId) {
  const { demand, social, competition_gap, fit, score } = topic;

  const biggest_weakness = pickWeakness(demand, social, competition_gap, fit);
  const reframe          = buildReframe(topic, tabId, score);
  const verify           = buildVerify(topic.title);
  const opening_line     = buildOpeningLine(tabId);

  return {
    biggest_weakness,
    reframe,
    verify,
    opening_line,
  };
}
