/**
 * Reddit Public JSON API — Demand Signal Library
 *
 * No API key required. Uses Reddit's public JSON endpoints.
 * Rate limit: ~60 requests/min (add User-Agent header to avoid throttling).
 *
 * What this measures:
 *   - How much patients TALK about a topic (comment count = controversy/interest)
 *   - How many questions are asked (post count = FAQ demand)
 *   - Upvote count (= save/share proxy = viral potential)
 */

// Health subreddits relevant for Dr. Prabhakar's audience
const HEALTH_SUBREDDITS = [
  "diabetes",
  "diabetes_t2",
  "intermittentfasting",
  "nutrition",
  "india",
];

const REDDIT_BASE    = "https://www.reddit.com";
const USER_AGENT     = "MagicScript/1.0 (health content research tool)";
const CACHE_SECONDS  = 1800; // 30 min — Reddit content refreshes faster than YouTube

// ── 1. SEARCH a subreddit for a keyword ──────────────────────────────────────
async function searchSubreddit(subreddit, query, { limit = 5 } = {}) {
  const url = `${REDDIT_BASE}/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&sort=hot&limit=${limit}&restrict_sr=on`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000); // 4s timeout per subreddit
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      next:    { revalidate: CACHE_SECONDS },
      signal:  controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.data?.children ?? []).map(c => ({
      subreddit:    c.data?.subreddit    ?? subreddit,
      title:        c.data?.title        ?? "",
      score:        c.data?.score        ?? 0,   // upvotes
      numComments:  c.data?.num_comments ?? 0,
      upvoteRatio:  c.data?.upvote_ratio ?? 0,
      url:          `https://reddit.com${c.data?.permalink ?? ""}`,
      created:      c.data?.created_utc  ?? 0,
    }));
  } catch {
    return []; // graceful — Reddit is not critical path
  }
}

// ── 2. GLOBAL search across all health subreddits ────────────────────────────
async function searchAllSubreddits(query, { limit = 3 } = {}) {
  const results = await Promise.allSettled(
    HEALTH_SUBREDDITS.map(sub => searchSubreddit(sub, query, { limit }))
  );
  return results
    .filter(r => r.status === "fulfilled")
    .flatMap(r => r.value);
}

// ── 3. SOCIAL SCORE — 0-100 based on comment volume + upvotes ────────────────
// Comments are weighted higher than upvotes because comments = controversy + engagement.
// A post with 500 comments = doctor should make a reel on this.
function calcSocialScore(posts) {
  if (!posts.length) return 0;

  const totalComments = posts.reduce((s, p) => s + p.numComments, 0);
  const totalUpvotes  = posts.reduce((s, p) => s + p.score, 0);

  // Normalise: 1000+ total comments = 100 score
  const commentScore = Math.min(100, Math.round((totalComments / 1000) * 100));
  // Normalise: 5000+ total upvotes = 100 score
  const upvoteScore  = Math.min(100, Math.round((totalUpvotes  / 5000) * 100));

  // Comments weighted 70%, upvotes 30%
  return Math.round(commentScore * 0.70 + upvoteScore * 0.30);
}

// ── 4. QUESTION EXTRACTION — what do patients actually ask? ─────────────────
// Returns titles that contain question words — direct FAQ demand signals.
function extractQuestions(posts) {
  const QUESTION_WORDS = /\b(what|why|how|can|does|is|should|will|which|when|do|are)\b/i;
  return posts
    .filter(p => QUESTION_WORDS.test(p.title))
    .map(p => p.title)
    .slice(0, 5);
}

// ── 5. MAIN EXPORT — full Reddit demand report ───────────────────────────────
/**
 * @param {string} keyword  e.g. "diabetes fasting"
 * @returns {Promise<RedditDemandReport>}
 */
export async function getRedditSignals(keyword) {
  const posts = await searchAllSubreddits(keyword, { limit: 3 });

  if (!posts.length) {
    return {
      keyword,
      socialScore:      0,
      totalPosts:       0,
      totalComments:    0,
      totalUpvotes:     0,
      patientQuestions: [],
      topPostTitles:    [],
      verdict:          "no_data",
      source:           "Reddit Public API",
      searchedAt:       new Date().toISOString(),
    };
  }

  const socialScore  = calcSocialScore(posts);
  const totalComments = posts.reduce((s, p) => s + p.numComments, 0);
  const totalUpvotes  = posts.reduce((s, p) => s + p.score, 0);

  // Sort posts by engagement (comments first)
  const sorted = [...posts].sort((a, b) => b.numComments - a.numComments);

  return {
    keyword,
    socialScore,                               // 0-100 conversation volume
    totalPosts:       posts.length,
    totalComments,
    totalUpvotes,
    patientQuestions: extractQuestions(sorted), // real questions patients type
    topPostTitles:    sorted.slice(0, 5).map(p => p.title), // for LLM context
    topPosts: sorted.slice(0, 5).map(p => ({
      title:       p.title,
      subreddit:   p.subreddit,
      comments:    p.numComments,
      upvotes:     p.score,
      url:         p.url,
    })),
    verdict:
      socialScore >= 70 ? "high_buzz"     :
      socialScore >= 40 ? "moderate_buzz" :
      socialScore >= 10 ? "low_buzz"      : "no_data",
    source:    "Reddit Public API",
    searchedAt: new Date().toISOString(),
  };
}

// ── 6. BATCH ──────────────────────────────────────────────────────────────────
export async function getRedditSignalsBatch(keywords) {
  const results = await Promise.allSettled(
    keywords.map(kw => getRedditSignals(kw))
  );
  return Object.fromEntries(
    keywords.map((kw, i) => [
      kw,
      results[i].status === "fulfilled"
        ? results[i].value
        : { keyword: kw, socialScore: null, error: results[i].reason?.message },
    ])
  );
}
