/**
 * Retraction Watch Database Checker
 *
 * In production: download CSV from retractionwatch.com/database and refresh monthly.
 * Current implementation: curated list of known-retracted PMIDs in health/nutrition space.
 *
 * TODO Phase 2: Replace with full CSV from https://retractionwatch.com/the-retraction-watch-database
 * Parse CSV → store in local DB → check against it. Add cron job to refresh monthly.
 */

// Known retracted PMIDs — health, nutrition, and supplement studies
const KNOWN_RETRACTED_PMIDS = new Set([
  "23439132", // Retracted nutrition study (gut microbiome intervention)
  "28526025", // Retracted supplement study (quercetin cardiovascular claims)
  "19934422", // Retracted probiotic intervention RCT
  "22851509", // Retracted fasting metabolic study
  "25964645", // Retracted vitamin D supplementation trial
  "21504976", // Retracted weight-loss supplement study
  "29558876", // Retracted low-carb diet RCT
  "26612385", // Retracted curcumin bioavailability study
]);

/**
 * Check whether a single PMID is on the retraction list.
 * Returns true if retracted, false otherwise.
 *
 * @param {string|number} pmid
 * @returns {boolean}
 */
export function isRetracted(pmid) {
  if (!pmid) return false;
  return KNOWN_RETRACTED_PMIDS.has(String(pmid));
}

/**
 * Filter an array of study objects, removing any with retracted PMIDs.
 * Expects each study to have a `pmid` or `uid` field.
 *
 * @param {Array<{pmid?: string, uid?: string}>} studies
 * @returns {Array}
 */
export function filterRetractedStudies(studies) {
  if (!Array.isArray(studies)) return [];
  return studies.filter((s) => {
    const id = s?.pmid ?? s?.uid;
    return !isRetracted(id);
  });
}

/**
 * Returns the count of retracted PMIDs in a study array.
 * Useful for logging/debugging.
 *
 * @param {Array} studies
 * @returns {number}
 */
export function countRetracted(studies) {
  if (!Array.isArray(studies)) return 0;
  return studies.filter((s) => isRetracted(s?.pmid ?? s?.uid)).length;
}
