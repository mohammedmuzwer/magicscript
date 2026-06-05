/**
 * Google Trends — Interest Score Library
 *
 * No API key, no npm package. Uses direct HTTP calls to Google's
 * unofficial Trends JSON API (same approach as the google-trends-api package).
 *
 * Returns a 0-100 interest score for a keyword over the last 12 months.
 * geo=IN  → India-specific trends (correct for Dr. Prabhakar's audience)
 *
 * Rate limit: ~5 req/sec. Add 200ms delay between parallel calls.
 * Gracefully returns null on failure — trends is a boost signal, not critical.
 */

const TRENDS_BASE = "https://trends.google.com/trends/api";

// ── Build the explore request payload ────────────────────────────────────────
function buildExploreReq(keyword) {
  return JSON.stringify({
    comparisonItem: [{ keyword, geo: "IN", time: "today 12-m" }],
    category: 0,
    property: "",
  });
}

// ── Step 1: Get explore token + widget list from Trends API ──────────────────
async function fetchExploreWidgets(keyword) {
  const params = new URLSearchParams({
    hl:  "en-IN",
    tz:  "-330",       // IST offset
    req: buildExploreReq(keyword),
  });

  const res = await fetch(`${TRENDS_BASE}/explore?${params}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept":     "application/json, text/plain, */*",
      "Referer":    "https://trends.google.com/",
    },
    // No Next.js cache here — response starts with ")]}'\n" which needs stripping
  });

  if (!res.ok) throw new Error(`Trends explore failed: ${res.status}`);

  // Google Trends prepends ")]}'\n" to prevent JSON hijacking — strip it
  const raw  = await res.text();
  const json = JSON.parse(raw.replace(/^\)\]\}'\n/, ""));
  return json?.widgets ?? [];
}

// ── Step 2: Get interest over time from the TIMESERIES widget ────────────────
async function fetchInterestOverTime(token, req) {
  const params = new URLSearchParams({
    hl:    "en-IN",
    tz:    "-330",
    token,
    req,
  });

  const res = await fetch(`${TRENDS_BASE}/widgetdata/multiline?${params}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept":     "application/json, text/plain, */*",
      "Referer":    "https://trends.google.com/",
    },
  });

  if (!res.ok) throw new Error(`Trends timeseries failed: ${res.status}`);

  const raw  = await res.text();
  const json = JSON.parse(raw.replace(/^\)\]\}'\n/, ""));

  // Extract interest values (0-100 per week over 12 months)
  const points = json?.default?.timelineData ?? [];
  return points.map(p => p.value?.[0] ?? 0).filter(v => v > 0);
}

// ── Calculate a single 0-100 score from the weekly time series ───────────────
function calcTrendScore(values) {
  if (!values.length) return 0;

  const avg     = values.reduce((s, v) => s + v, 0) / values.length;
  const recent  = values.slice(-4); // last 4 weeks
  const recentAvg = recent.reduce((s, v) => s + v, 0) / recent.length;

  // Blend: 60% overall average + 40% recent trend (rising = boosted)
  const raw = avg * 0.60 + recentAvg * 0.40;
  return Math.min(100, Math.round(raw));
}

// ── Rising trend detection ────────────────────────────────────────────────────
function isRising(values) {
  if (values.length < 8) return false;
  const firstHalf  = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  const avgFirst   = firstHalf.reduce((s, v) => s + v, 0) / firstHalf.length;
  const avgSecond  = secondHalf.reduce((s, v) => s + v, 0) / secondHalf.length;
  return avgSecond > avgFirst * 1.10; // 10%+ increase = rising
}

// ── MAIN EXPORT — full Google Trends report ───────────────────────────────────
/**
 * @param {string}  keyword  e.g. "diabetes fasting"
 * @returns {Promise<TrendsReport|null>}  null on failure (non-critical signal)
 */
export async function getTrendsScore(keyword) {
  try {
    const widgets = await fetchExploreWidgets(keyword);

    // Find the TIMESERIES (Interest Over Time) widget
    const tsWidget = widgets.find(w => w.id === "TIMESERIES");
    if (!tsWidget?.token || !tsWidget?.request) {
      throw new Error("No TIMESERIES widget found");
    }

    const values = await fetchInterestOverTime(
      tsWidget.token,
      JSON.stringify(tsWidget.request)
    );

    if (!values.length) {
      return { keyword, trendScore: 0, rising: false, verdict: "no_data", source: "Google Trends" };
    }

    const trendScore = calcTrendScore(values);
    const rising     = isRising(values);

    return {
      keyword,
      trendScore,         // 0-100 search interest (India-specific)
      rising,             // true = trending upward in last 6 months
      peakValue:          Math.max(...values),
      recentValue:        values[values.length - 1] ?? 0,
      dataPoints:         values.length,
      verdict:
        trendScore >= 70 ? "trending"       :
        trendScore >= 40 ? "steady"         :
        trendScore >= 15 ? "low_interest"   : "no_data",
      source:     "Google Trends (India)",
      searchedAt: new Date().toISOString(),
    };
  } catch (err) {
    // Trends is a non-critical signal — never block the pipeline
    console.warn(`[trends] ${keyword}: ${err.message}`);
    return null;
  }
}

// ── BATCH — parallel with no stagger (each call is already ~300-500ms) ───────
export async function getTrendsScoreBatch(keywords) {
  const settled = await Promise.allSettled(keywords.map(kw => getTrendsScore(kw)));
  return Object.fromEntries(
    keywords.map((kw, i) => [
      kw,
      settled[i].status === "fulfilled" ? settled[i].value : null,
    ])
  );
}
