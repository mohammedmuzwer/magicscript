/**
 * ICMR / WHO / FSSAI Guideline Registry
 * Maps health topics → official clinical guidelines for evidence boosting.
 * Used in Stage 3 med-check to award guideline-match score bonuses.
 */

const GUIDELINES = [
  {
    id: "icmr-diabetes-2023",
    org: "ICMR",
    title: "ICMR Clinical Practice Guidelines for Type 2 Diabetes",
    year: 2023,
    keywords: ["diabetes", "type 2", "blood sugar", "glucose", "insulin", "metformin", "hba1c"],
    score_boost: 10,
    badge: "ICMR Guideline",
  },
  {
    id: "icmr-obesity-2022",
    org: "ICMR",
    title: "ICMR Guidelines on Management of Obesity",
    year: 2022,
    keywords: ["obesity", "weight loss", "bmi", "overweight", "fat"],
    score_boost: 10,
    badge: "ICMR Guideline",
  },
  {
    id: "icmr-diet-2020",
    org: "ICMR-NIN",
    title: "Dietary Guidelines for Indians — ICMR-NIN",
    year: 2020,
    keywords: ["diet", "nutrition", "indian diet", "food", "calories", "protein", "carbs"],
    score_boost: 10,
    badge: "ICMR-NIN Guideline",
  },
  {
    id: "who-diabetes-2023",
    org: "WHO",
    title: "WHO Global Diabetes Compact Guidelines",
    year: 2023,
    keywords: ["diabetes", "blood sugar", "glucose", "insulin"],
    score_boost: 8,
    badge: "WHO Guideline",
  },
  {
    id: "who-obesity-2022",
    org: "WHO",
    title: "WHO Obesity and Overweight Fact Sheet",
    year: 2022,
    keywords: ["obesity", "overweight", "weight", "bmi", "fat loss"],
    score_boost: 8,
    badge: "WHO Guideline",
  },
  {
    id: "icmr-pcos-2021",
    org: "ICMR",
    title: "ICMR Consensus Statement on PCOS",
    year: 2021,
    keywords: ["pcos", "polycystic", "hormone", "fertility", "women", "periods"],
    score_boost: 10,
    badge: "ICMR Guideline",
  },
  {
    id: "who-cvd-2021",
    org: "WHO",
    title: "WHO Cardiovascular Disease Prevention Guidelines",
    year: 2021,
    keywords: ["heart", "cardiovascular", "cholesterol", "bp", "hypertension", "stroke"],
    score_boost: 8,
    badge: "WHO Guideline",
  },
  {
    id: "icmr-thyroid-2019",
    org: "ICMR",
    title: "ICMR Task Force on Thyroid Disorders",
    year: 2019,
    keywords: ["thyroid", "hypothyroid", "hyperthyroid", "tsh", "t3", "t4"],
    score_boost: 10,
    badge: "ICMR Guideline",
  },
  {
    id: "fssai-supplements-2022",
    org: "FSSAI",
    title: "FSSAI Regulations on Health Supplements",
    year: 2022,
    keywords: ["supplement", "vitamin", "mineral", "protein powder", "ashwagandha"],
    score_boost: 8,
    badge: "FSSAI Approved",
  },
  {
    id: "who-gut-2022",
    org: "WHO",
    title: "WHO Guidelines on Probiotics and Gut Health",
    year: 2022,
    keywords: ["gut", "probiotics", "microbiome", "digestion", "ibs", "constipation"],
    score_boost: 8,
    badge: "WHO Guideline",
  },
  {
    id: "icmr-kids-nutrition-2020",
    org: "ICMR-NIN",
    title: "ICMR-NIN Nutrient Requirements for Children",
    year: 2020,
    keywords: ["kids", "children", "child", "growth", "nutrition", "school", "teenage"],
    score_boost: 10,
    badge: "ICMR-NIN Guideline",
  },
  {
    id: "who-intermittent-fasting-2022",
    org: "WHO",
    title: "WHO Evidence Review on Intermittent Fasting",
    year: 2022,
    keywords: ["intermittent fasting", "fasting", "if", "16:8", "time restricted"],
    score_boost: 8,
    badge: "WHO Evidence Review",
  },
];

/**
 * Check whether a topic title + description matches any known clinical guideline.
 * Returns the best-matching guideline (highest score_boost), or null.
 *
 * @param {string} topicTitle
 * @param {string} [topicDescription]
 * @returns {{ id, org, title, year, badge, score_boost } | null}
 */
export function checkGuidelineMatch(topicTitle, topicDescription = "") {
  const text = ((topicTitle || "") + " " + (topicDescription || "")).toLowerCase();
  const matches = GUIDELINES.filter((g) =>
    g.keywords.some((kw) => text.includes(kw.toLowerCase()))
  );
  if (!matches.length) return null;
  return matches.sort((a, b) => b.score_boost - a.score_boost)[0];
}

export { GUIDELINES };
