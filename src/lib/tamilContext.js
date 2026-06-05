// Tamil Nadu seasonal / festival calendar — drives Stage 2 social-score boosts.
// Hardcoded month-by-month so it needs no external API and is fully deterministic.

const TAMIL_CALENDAR = {
  1:  { season: "Winter end",    festival: "Pongal",
        festival_health_angle: "Pongal food + diabetes — sugar crash after sweet pongal",
        regional_boost_keywords: ["pongal", "sugarcane", "rice", "harvest"],            social_score_boost: 15 },
  2:  { season: "Early spring",  festival: null,
        festival_health_angle: "Heart health month — valentine season awareness",
        regional_boost_keywords: ["heart", "cholesterol", "BP"],                         social_score_boost: 5 },
  3:  { season: "Summer start",  festival: "Ugadi/Tamil New Year prep",
        festival_health_angle: "Summer heat + dehydration + cooling foods",
        regional_boost_keywords: ["summer", "heat", "dehydration", "cooling"],           social_score_boost: 10 },
  4:  { season: "Peak summer",   festival: "Tamil New Year (Puthandu)",
        festival_health_angle: "New year detox + traditional Tamil diet reset",
        regional_boost_keywords: ["puthandu", "new year", "detox", "traditional"],       social_score_boost: 12 },
  5:  { season: "Peak summer",   festival: "Ramadan end / Eid",
        festival_health_angle: "Post-Ramadan health recovery + fasting side effects",
        regional_boost_keywords: ["ramadan", "eid", "fasting", "glucose"],               social_score_boost: 14 },
  6:  { season: "Monsoon start", festival: null,
        festival_health_angle: "Monsoon infections + immunity + gut health",
        regional_boost_keywords: ["monsoon", "infection", "immunity", "gut"],            social_score_boost: 8 },
  7:  { season: "Monsoon peak",  festival: null,
        festival_health_angle: "Waterborne diseases + joint pain + respiratory",
        regional_boost_keywords: ["monsoon", "joint", "respiratory", "water"],           social_score_boost: 7 },
  8:  { season: "Monsoon",       festival: "Krishna Jayanthi / Onam",
        festival_health_angle: "Festival fasting + traditional foods + gut health",
        regional_boost_keywords: ["onam", "sadhya", "fasting", "traditional"],           social_score_boost: 10 },
  9:  { season: "Post-monsoon",  festival: "Navarathri / Ramadan (varies)",
        festival_health_angle: "Navarathri fasting safety for diabetics",
        regional_boost_keywords: ["navarathri", "fasting", "diabetes", "vrat"],          social_score_boost: 13 },
  10: { season: "Post-monsoon",  festival: "Diwali / Vijaya Dasami",
        festival_health_angle: "Diwali sweets + blood sugar spike prevention",
        regional_boost_keywords: ["diwali", "sweets", "sugar", "mithai"],                social_score_boost: 14 },
  11: { season: "Winter start",  festival: "Karthigai Deepam",
        festival_health_angle: "Karthigai fasting + lamp smoke + respiratory health",
        regional_boost_keywords: ["karthigai", "deepam", "fasting", "respiratory"],      social_score_boost: 11 },
  12: { season: "Winter",        festival: "Christmas / year-end",
        festival_health_angle: "Year-end health reset + winter diet + immunity",
        regional_boost_keywords: ["winter", "immunity", "year-end", "resolution"],       social_score_boost: 6 },
};

/**
 * Returns the Tamil Nadu seasonal/festival context for a given month
 * (1–12). Defaults to the current month. Always returns a complete,
 * safe object so callers never need null-guards on the shape.
 */
export function getCurrentTamilContext(month) {
  let m = month;
  if (m == null) {
    try { m = new Date().getMonth() + 1; } catch { m = 1; }
  }
  m = Number(m);
  if (!Number.isFinite(m) || m < 1 || m > 12) m = 1;

  const c = TAMIL_CALENDAR[m];
  return {
    month: m,
    season: c.season,
    festival: c.festival,
    festival_health_angle: c.festival_health_angle,
    regional_boost_keywords: c.regional_boost_keywords,
    social_score_boost: c.social_score_boost,
  };
}
