// Rich mock data for demo mode — Idea Matrix Generator

const TEMPLATES = {
  myth_buster: [
    { suffix: "doesn't cause weight gain", scoreRange: [82, 95], rationale: "RCT evidence confirmed" },
    { suffix: "myth about morning workouts", scoreRange: [75, 88], rationale: "Circadian biology studies" },
    { suffix: "detox diets have no evidence", scoreRange: [88, 96], rationale: "Hepatology consensus" },
    { suffix: "supplements vs whole food", scoreRange: [78, 90], rationale: "Meta-analysis confirmed" },
    { suffix: "cardio alone won't burn fat", scoreRange: [80, 92], rationale: "Exercise physiology data" },
  ],
  problem_reveal: [
    { suffix: "is silently wrecking your hormones", scoreRange: [72, 86], rationale: "Endocrine disruptor studies" },
    { suffix: "90% of people are deficient", scoreRange: [75, 88], rationale: "National survey data" },
    { suffix: "your gut is the hidden cause", scoreRange: [68, 82], rationale: "Emerging microbiome research" },
    { suffix: "the silent metabolic killer", scoreRange: [80, 92], rationale: "Cardiovascular cohort data" },
    { suffix: "inflammation you don't know you have", scoreRange: [74, 87], rationale: "CRP biomarker studies" },
  ],
  education_drop: [
    { suffix: "explained in 60 seconds", scoreRange: [85, 97], rationale: "Undisputed basic physiology" },
    { suffix: "what your blood test doesn't show", scoreRange: [70, 84], rationale: "Clinical reference ranges" },
    { suffix: "the science of", scoreRange: [80, 93], rationale: "Established endocrinology" },
    { suffix: "why your body craves", scoreRange: [76, 89], rationale: "Neuroscience appetite research" },
    { suffix: "one number you must track", scoreRange: [82, 94], rationale: "Preventive medicine guidelines" },
  ],
  faq_explainer: [
    { suffix: "— does it actually work?", scoreRange: [65, 85], rationale: "Systematic review evidence" },
    { suffix: "how long does it really take?", scoreRange: [72, 86], rationale: "Longitudinal study data" },
    { suffix: "safe for daily use?", scoreRange: [78, 91], rationale: "Toxicology safety profile" },
    { suffix: "best time of day to use", scoreRange: [66, 80], rationale: "Chronopharmacology emerging" },
    { suffix: "what doctors actually recommend", scoreRange: [80, 93], rationale: "Clinical practice guidelines" },
  ],
  contrarian: [
    { suffix: "is worse than you think", scoreRange: [55, 72], rationale: "Conflicting trial results" },
    { suffix: "why experts got this wrong", scoreRange: [52, 68], rationale: "Landmark study reversal" },
    { suffix: "the real cause no one talks about", scoreRange: [58, 74], rationale: "Emerging clinical trials" },
    { suffix: "stop doing this immediately", scoreRange: [60, 76], rationale: "Recent guideline revision" },
    { suffix: "unpopular truth about modern medicine", scoreRange: [50, 66], rationale: "Evidence-based criticism" },
  ],
};

function pick(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function generateMockIdeaMatrix(keyword) {
  const k = keyword.trim().toLowerCase();

  const build = (category) =>
    TEMPLATES[category].map((t) => ({
      topic: capitalize(`${k} ${t.suffix}`),
      medical_evidence_score: pick(t.scoreRange[0], t.scoreRange[1]),
      score_rationale: t.rationale,
    }));

  return {
    myth_buster:    build("myth_buster"),
    problem_reveal: build("problem_reveal"),
    education_drop: build("education_drop"),
    faq_explainer:  build("faq_explainer"),
    contrarian:     build("contrarian"),
  };
}
