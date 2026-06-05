/**
 * YouTube Data API v3 — Demand Signal Library
 *
 * Part of the Level 1 topic pipeline. Measures real-world YouTube demand
 * for a health keyword using search volume + engagement signals.
 *
 * Quota cost per call:
 *   searchVideos()       → 100 units  (search)
 *   getVideoStatistics() →   1 unit   (videos.list)
 *   getYouTubeDemandReport() → 101 units total
 *   Daily free quota: 10,000 units = ~99 full reports/day
 *
 * Docs: https://developers.google.com/youtube/v3/docs
 */

const BASE     = "https://www.googleapis.com/youtube/v3";
const CACHE_S  = 3600; // cache 1 hour in Next.js — conserves daily quota

// ── 0. API KEY ────────────────────────────────────────────────────────────────
function key() {
  const k = process.env.YOUTUBE_API_KEY;
  if (!k) throw new Error("YOUTUBE_API_KEY is not set in .env.local");
  return k;
}

// ── 1. SEARCH — top N video IDs + titles for a keyword ───────────────────────
// regionCode=IN + relevanceLanguage=hi gives India-relevant results.
// Returns video stubs (no stats yet).
async function searchVideos(keyword, { maxResults = 5, regionCode = "IN" } = {}) {
  const params = new URLSearchParams({
    part:              "snippet",
    q:                 keyword,
    type:              "video",
    maxResults:        String(maxResults),
    regionCode,
    relevanceLanguage: "hi",   // India-relevant (catches Tamil/Hindi content)
    order:             "relevance",
    key:               key(),
  });

  const res = await fetch(`${BASE}/search?${params}`, {
    next: { revalidate: CACHE_S },
  });

  if (res.status === 403) {
    const body = await res.json().catch(() => ({}));
    const reason = body?.error?.errors?.[0]?.reason ?? "unknown";
    throw new Error(
      reason === "quotaExceeded"
        ? "YouTube quota exceeded — resets at midnight Pacific Time"
        : "YouTube API key invalid or access denied"
    );
  }
  if (res.status === 429) throw new Error("YouTube rate limit — retry in 60s");
  if (!res.ok)            throw new Error(`YouTube search failed: ${res.status}`);

  const data = await res.json();
  return (data.items ?? [])
    .map(item => ({
      videoId:      item.id?.videoId ?? null,
      title:        item.snippet?.title        ?? "Untitled",
      channelTitle: item.snippet?.channelTitle ?? "Unknown",
      publishedAt:  item.snippet?.publishedAt  ?? null,
    }))
    .filter(v => v.videoId); // drop items with no videoId
}

// ── 2. STATISTICS — view / like / comment counts for an ID list ───────────────
// Single videos.list call (1 quota unit) — much cheaper than N search calls.
async function fetchStats(videoIds) {
  if (!videoIds.length) return [];

  const params = new URLSearchParams({
    part: "statistics",
    id:   videoIds.join(","),
    key:  key(),
  });

  const res = await fetch(`${BASE}/videos?${params}`, {
    next: { revalidate: CACHE_S },
  });

  if (res.status === 403) throw new Error("YouTube API quota exceeded or key invalid");
  if (res.status === 429) throw new Error("YouTube rate limit — retry in 60s");
  if (!res.ok)            throw new Error(`YouTube videos fetch failed: ${res.status}`);

  const data = await res.json();
  return (data.items ?? []).map(item => ({
    videoId:      item.id,
    viewCount:    parseInt(item.statistics?.viewCount    ?? "0", 10),
    likeCount:    parseInt(item.statistics?.likeCount    ?? "0", 10),
    commentCount: parseInt(item.statistics?.commentCount ?? "0", 10),
  }));
}

// ── 3. SCORING HELPERS ────────────────────────────────────────────────────────

/**
 * demandScore — log-scale 0-100 based on aggregate views across top 5 videos.
 *
 * Benchmarks (top 5 total):
 *   50M+ views → 100  (mega-viral topic — weight loss, diabetes diet)
 *   10M  views →  86  (very high demand)
 *    1M  views →  71  (solid demand)
 *  100K  views →  57  (moderate)
 *   10K  views →  43  (niche)
 *    1K  views →  29  (very niche)
 *     0  views →   0
 */
function calcDemandScore(totalViews) {
  if (totalViews <= 0) return 0;
  const BENCHMARK = 50_000_000;
  return Math.min(100, Math.round(
    (Math.log10(totalViews + 1) / Math.log10(BENCHMARK)) * 100
  ));
}

/**
 * competitionScore — how dominated the space is.
 * High score = one video has 10M+ views = hard to crack.
 * We flip this to competitionGap = 100 - competitionScore.
 */
function calcCompetitionScore(videos) {
  if (!videos.length) return 50;
  const topViews = Math.max(...videos.map(v => v.viewCount ?? 0));
  if (topViews <= 0) return 0;
  return Math.min(100, Math.round(
    (Math.log10(topViews + 1) / Math.log10(10_000_000)) * 100
  ));
}

/**
 * engagementRate — average like/view ratio across top 5.
 * Returned as a percentage, e.g. 4.25 means 4.25% of viewers liked.
 * Industry average for health content: ~3-5%.
 */
function calcEngagementRate(videos) {
  const valid = videos.filter(v => v.viewCount > 1000); // skip tiny videos
  if (!valid.length) return 0;
  const avg = valid.reduce((s, v) => s + (v.likeCount / v.viewCount), 0) / valid.length;
  return Math.round(avg * 10000) / 100; // e.g. 0.0425 → 4.25
}

/**
 * socialScore — 0-100 social-demand proxy from real YouTube engagement.
 *
 * Combines two real signals across the top 5 videos:
 *   • Comment volume (60%) — how much the topic drives conversation/debate.
 *       log-scale: 20,000+ total comments → 100
 *   • Like engagement rate (40%) — how strongly viewers react.
 *       5%+ avg like/view → 100
 *
 * This replaces the (now Reddit-blocked) social signal. YouTube comments +
 * like-rate are a defensible measure of how "shareable / save-worthy" a topic is.
 */
function calcSocialScore(totalComments, engagementRate) {
  const commentScore = totalComments > 0
    ? Math.min(100, Math.round((Math.log10(totalComments + 1) / Math.log10(20_000)) * 100))
    : 0;
  const engagementScore = Math.min(100, Math.round((engagementRate / 5) * 100));
  return Math.round(commentScore * 0.60 + engagementScore * 0.40);
}

// ── 4. MAIN — full demand report for one keyword ──────────────────────────────
/**
 * @param {string} keyword  e.g. "diabetes fasting"
 * @param {object} options  { maxResults, regionCode }
 * @returns {Promise<YouTubeDemandReport>}
 */
export async function getYouTubeDemandReport(keyword, options = {}) {
  const { maxResults = 5, regionCode = "IN" } = options;

  // Step 1 — search (100 quota units)
  const stubs = await searchVideos(keyword, { maxResults, regionCode });

  if (!stubs.length) {
    return {
      keyword,
      demandScore:      0,
      competitionScore: 0,
      competitionGap:   100,
      engagementRate:   0,
      totalViews:       0,
      videoCount:       0,
      topVideos:        [],
      topTitles:        [],
      verdict:          "no_data",
      source:           "YouTube Data API v3",
      searchedAt:       new Date().toISOString(),
    };
  }

  // Step 2 — statistics (1 quota unit)
  const stats    = await fetchStats(stubs.map(v => v.videoId));
  const statsMap = Object.fromEntries(stats.map(s => [s.videoId, s]));

  // Merge
  const videos = stubs.map(s => ({
    ...s,
    ...(statsMap[s.videoId] ?? { viewCount: 0, likeCount: 0, commentCount: 0 }),
  }));

  // Step 3 — scores
  const totalViews      = videos.reduce((n, v) => n + v.viewCount, 0);
  const totalComments   = videos.reduce((n, v) => n + (v.commentCount ?? 0), 0);
  const demandScore     = calcDemandScore(totalViews);
  const competitionScore = calcCompetitionScore(videos);
  const engagementRate  = calcEngagementRate(videos);
  const socialScore     = calcSocialScore(totalComments, engagementRate);

  // Verdict label for quick display
  const verdict =
    demandScore >= 70 ? "high_demand"     :
    demandScore >= 45 ? "moderate_demand" :
    demandScore >= 20 ? "low_demand"      : "niche";

  return {
    keyword,
    demandScore,                              // 0-100 — how much demand exists
    competitionScore,                         // 0-100 — how hard to rank against
    competitionGap: Math.max(0, 100 - competitionScore), // opportunity score
    socialScore,                              // 0-100 — social-demand proxy (comments + like rate)
    engagementRate,                           // avg like%, e.g. 4.25
    totalViews,                               // raw aggregate
    totalComments,                            // raw aggregate comment volume
    videoCount: videos.length,
    topVideos: videos.map(v => ({
      videoId:      v.videoId,
      title:        v.title,
      channel:      v.channelTitle,
      viewCount:    v.viewCount,
      likeCount:    v.likeCount,
      commentCount: v.commentCount,
      url:          `https://youtube.com/watch?v=${v.videoId}`,
    })),
    topTitles:  videos.map(v => v.title),    // for LLM prompt injection
    verdict,
    source:    "YouTube Data API v3",
    searchedAt: new Date().toISOString(),
  };
}

// ── 5. BATCH — multiple keywords in parallel ──────────────────────────────────
// Max 10 keywords at once to stay within quota.
// Each keyword costs 101 units; 10 keywords = 1,010 units of 10,000 daily budget.
/**
 * @param {string[]} keywords
 * @returns {Promise<Record<string, YouTubeDemandReport>>}
 */
export async function getYouTubeDemandBatch(keywords, options = {}) {
  const capped = keywords.slice(0, 10); // hard cap — protect quota

  const results = await Promise.allSettled(
    capped.map(kw => getYouTubeDemandReport(kw, options))
  );

  return Object.fromEntries(
    capped.map((kw, i) => [
      kw,
      results[i].status === "fulfilled"
        ? results[i].value
        : {
            keyword:     kw,
            demandScore: null,
            error:       results[i].reason?.message ?? "Unknown error",
          },
    ])
  );
}

// ── 6. QUOTA GUARD — estimate remaining daily budget ─────────────────────────
// 10,000 units/day. Each full report = 101 units = ~99 reports/day max.
// This is a helper for the UI to warn when quota is low.
export function estimateQuotaCost(reportCount = 1) {
  return {
    unitsUsed:      reportCount * 101,
    unitsRemaining: Math.max(0, 10000 - reportCount * 101),
    reportsLeft:    Math.floor((10000 - reportCount * 101) / 101),
  };
}
