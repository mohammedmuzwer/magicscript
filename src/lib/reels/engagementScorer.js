// Client-side engagement prediction scoring
// NOT a live API call — computed from generation metadata weights

const CONTENT_TYPE_WEIGHT = {
  "myth-buster": 0.9,
  "contrarian": 0.95,
  "problem-reveal": 0.85,
  "education-drop": 0.80,
  "faq-explainer": 0.75,
};

const STYLE_WEIGHT = {
  cinematic: 0.88,
  rebel: 0.92,
  education: 0.80,
};

const BUCKET_VIRALITY = {
  "weight-loss": 0.95,
  "gut-secrets": 0.90,
  "women-health": 0.88,
  "diabetes": 0.85,
  "metabolic": 0.82,
  "kids": 0.80,
  "lifestyle": 0.78,
};

const LANGUAGE_BOOST = {
  tanglish: 1.08,
  tamil: 1.05,
  hindi: 1.04,
  malayalam: 1.03,
  telugu: 1.02,
  kannada: 1.02,
  english: 1.0,
};

/**
 * Compute a 0–100 engagement prediction score for a given script style.
 * @param {object} params
 * @param {string} params.contentTypeId  - e.g. "myth-buster"
 * @param {string} params.scriptStyle    - "cinematic" | "education" | "rebel"
 * @param {number} params.evidenceScore  - 0–100 from med quick-check
 * @param {string} params.bucketId       - e.g. "weight-loss"
 * @param {string} params.language       - e.g. "tanglish"
 * @returns {{ score: number, label: string, hookStrength: string }}
 */
export function computeEngagementScore({
  contentTypeId = "education-drop",
  scriptStyle = "education",
  evidenceScore = 70,
  bucketId = "lifestyle",
  language = "english",
}) {
  const ct = CONTENT_TYPE_WEIGHT[contentTypeId] ?? 0.80;
  const st = STYLE_WEIGHT[scriptStyle] ?? 0.80;
  const bv = BUCKET_VIRALITY[bucketId] ?? 0.80;
  const lb = LANGUAGE_BOOST[language] ?? 1.0;

  // Evidence score normalised 0–1, weighted at 15%
  const ev = (evidenceScore / 100) * 0.15;

  // Core formula: weighted average of content type, style, bucket virality
  const base = (ct * 0.35 + st * 0.30 + bv * 0.20) + ev;

  // Apply language boost, then clamp to 0–100
  const raw = Math.min(100, Math.round(base * lb * 100));

  const label =
    raw >= 85 ? "Viral" :
    raw >= 70 ? "Strong" :
    raw >= 50 ? "Moderate" :
    "Low";

  const hookStrength =
    ["myth-buster", "contrarian"].includes(contentTypeId) ? "Strong" :
    ["problem-reveal"].includes(contentTypeId) ? "Strong" :
    "Moderate";

  return { score: raw, label, hookStrength };
}
