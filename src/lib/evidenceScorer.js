/**
 * Evidence Scorer — MHS Research Agent v3.0
 *
 * Scores study arrays using design-quality weights, applies guideline bonuses,
 * derives evidence grades, and checks drug interactions for content safety.
 */

// ── Study design weights ──────────────────────────────────────────────────────
const STUDY_WEIGHTS = {
  umbrella_review:    10,
  systematic_review:  8,
  meta_analysis:      7,
  rct:                5,
  clinical_guideline: 5,
  cohort:             3,
  case_control:       2,
  cross_sectional:    1,
  case_report:        0.5,
  animal:             0.2,
  in_vitro:           0.1,
};

/**
 * Detect study design from title + abstract text.
 * Returns a key matching STUDY_WEIGHTS.
 */
export function detectStudyDesign(text) {
  const t = (text || "").toLowerCase();
  if (t.includes("umbrella review"))                                          return "umbrella_review";
  if (t.includes("systematic review"))                                        return "systematic_review";
  if (t.includes("meta-analysis") || t.includes("meta analysis"))            return "meta_analysis";
  if (t.includes("randomized") || t.includes("randomised") || t.includes("rct")) return "rct";
  if (t.includes("clinical guideline") || t.includes("practice guideline"))  return "clinical_guideline";
  if (t.includes("cohort"))                                                   return "cohort";
  if (t.includes("case-control") || t.includes("case control"))              return "case_control";
  if (t.includes("cross-sectional") || t.includes("cross sectional"))        return "cross_sectional";
  if (t.includes("case report") || t.includes("case series"))                return "case_report";
  if (t.includes("animal") || t.includes("mice") || t.includes(" rat ") || t.includes("rodent")) return "animal";
  if (t.includes("in vitro") || t.includes("in-vitro") || t.includes("cell line")) return "in_vitro";
  return "rct"; // default assumption for PubMed clinical articles
}

/**
 * Calculate an evidence score and grade from a set of studies.
 *
 * @param {Array<{title?: string, abstract?: string}>} studies
 * @param {{ score_boost?: number } | null} guidelineMatch
 * @returns {{ score: number, grade: 'A'|'B'|'C'|'D', passed: boolean, studyCount: number }}
 */
export function calculateEvidenceScore(studies, guidelineMatch = null) {
  if (!studies || studies.length === 0) {
    return { score: 0, grade: "D", passed: false, studyCount: 0 };
  }

  let rawScore = 0;
  studies.forEach((study) => {
    const designText = (study.title || "") + " " + (study.abstract || "");
    const key = detectStudyDesign(designText);
    rawScore += STUDY_WEIGHTS[key] || 1;
  });

  // Scale to 0–100 (cap at 100)
  let score = Math.min(Math.round(rawScore * 10), 100);

  // Guideline match bonus
  if (guidelineMatch?.score_boost) {
    score = Math.min(score + guidelineMatch.score_boost, 100);
  }

  // Evidence grade
  let grade = "D";
  if (score >= 80) grade = "A";
  else if (score >= 60) grade = "B";
  else if (score >= 40) grade = "C";

  const passed = studies.length >= 3 && grade !== "D";

  return { score, grade, passed, studyCount: studies.length };
}

// ── Drug interaction flags ────────────────────────────────────────────────────

const FLAGGED_INTERACTIONS = [
  {
    keywords: ["berberine"],
    drugs: ["metformin"],
    risk: "Additive glucose-lowering — hypoglycemia risk with concurrent metformin use",
  },
  {
    keywords: ["ashwagandha"],
    drugs: ["thyroid medication", "levothyroxine"],
    risk: "May alter thyroid hormone levels — monitor TSH when co-administering",
  },
  {
    keywords: ["fenugreek", "methi"],
    drugs: ["metformin", "insulin"],
    risk: "Additive blood sugar lowering — adjust monitoring frequency",
  },
  {
    keywords: ["turmeric", "curcumin"],
    drugs: ["blood thinners", "warfarin"],
    risk: "Increased bleeding risk — caution with anticoagulant therapy",
  },
  {
    keywords: ["cinnamon"],
    drugs: ["insulin", "metformin"],
    risk: "Additive glucose lowering — hypoglycemia risk in Type 2 diabetics on medication",
  },
  {
    keywords: ["intermittent fasting", "fasting"],
    drugs: ["insulin", "metformin"],
    risk: "Hypoglycemia risk during extended fasting window — dose timing review required",
  },
  {
    keywords: ["high protein", "protein powder", "whey"],
    drugs: ["kidney disease"],
    risk: "High protein intake is contraindicated in CKD — content must include renal disclaimer",
  },
  {
    keywords: ["vitamin d"],
    drugs: ["calcium channel blockers"],
    risk: "May increase calcium absorption — cardiac monitoring advised for at-risk patients",
  },
  {
    keywords: ["green tea", "egcg"],
    drugs: ["warfarin", "blood thinners"],
    risk: "EGCG may potentiate anticoagulant effect — include bleeding risk advisory",
  },
  {
    keywords: ["ginger"],
    drugs: ["warfarin", "aspirin", "NSAIDs"],
    risk: "Mild antiplatelet effect — combined use with NSAIDs increases GI bleed risk",
  },
];

/**
 * Check a topic for potential drug–supplement interactions.
 * Returns an array of flag objects, or null if none found.
 *
 * @param {string} topicTitle
 * @param {string} [topicDescription]
 * @returns {Array<{ keywords, drugs, risk }> | null}
 */
export function checkDrugInteractions(topicTitle, topicDescription = "") {
  const text = ((topicTitle || "") + " " + (topicDescription || "")).toLowerCase();
  const flags = FLAGGED_INTERACTIONS.filter((f) =>
    f.keywords.some((kw) => text.includes(kw.toLowerCase()))
  );
  return flags.length > 0 ? flags : null;
}
