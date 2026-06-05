/**
 * Reddit Public JSON API — Global Social Demand Signal Library
 *
 * Queries Reddit's public search endpoint (no OAuth / no API key required).
 * Searches ALL of Reddit (not restricted to specific subreddits) for keyword
 * discussions — returns real upvote + comment engagement as Social Demand Score.
 *
 * Endpoint: https://www.reddit.com/search.json?q={keyword}&type=link&sort=hot&limit=10
 * Rate limit: ~60 req/min — pass a custom User-Agent to reduce blocking.
 * 429 → silent fallback to zero score (never crashes the pipeline).
 */

const REDDIT_SEARCH = "https://www.reddit.com/search.json";
const USER_AGENT    = "MagicScript-SEO-Bot/1.0 (health content research tool; non-commercial)";
const CACHE_SECS    = 1800; // 30-min server cache per keyword
const TIMEOUT_MS    = 5000; // 5s hard cap — never block the LLM call

// ── Zero-score fallback (safe to spread into any response) ───────────────────
const EMPTY = {
  socialScore:      0,
  totalPosts:       0,
  totalComments:    0,
  totalUps:         0,
  patientQuestions: [],
  topPostTitles:    [],
  topPosts:         [],
  verdict:          "no_data",
  source:           "Reddit Public JSON",
};

// ── Social Demand Score: 0–100 ────────────────────────────────────────────────
// Weighted: comments 70% (debate proxy) + upvotes 30% (reach proxy).
// Benchmarks: 1000+ total comments → 100 | 5000+ total upvotes → 100.
function calcSocialScore(posts) {
  if (!posts.length) return 0;
  const totalComments = posts.reduce((s, p) => s + (p.num_comments ?? 0), 0);
  const totalUps      = posts.reduce((s, p) => s + (p.ups          ?? 0), 0);
  const commentScore  = Math.min(100, Math.round((totalComments / 1000) * 100));
  const upvoteScore   = Math.min(100, Math.round((totalUps      / 5000) * 100));
  return Math.round(commentScore * 0.70 + upvoteScore * 0.30);
}

// ── Extract patient questions (FAQ demand signal) ─────────────────────────────
const Q_WORDS = /\b(what|why|how|can|does|is|should|will|which|when|do|are)\b/i;
function extractQuestions(posts) {
  return posts.filter(p => Q_WORDS.test(p.title)).map(p => p.title).slice(0, 5);
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function getRedditSocialSignals(keyword) {
  const params = new URLSearchParams({
    q:     keyword,
    type:  "link",
    sort:  "hot",
    limit: "10",
    t:     "year", // last 12 months — avoids stale old threads
  });

  const url = `${REDDIT_SEARCH}?${params}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, "Accept": "application/json" },
      next:   { revalidate: CACHE_SECS },
      signal: controller.signal,
    });
    clearTimeout(timer);

    // 429 — rate limited. Return zero score silently.
    if (res.status === 429) {
      console.warn("[reddit-public] 429 rate limit — zero score fallback");
      return { ...EMPTY, verdict: "rate_limited" };
    }
    if (!res.ok) throw new Error(`Reddit responded ${res.status}`);

    const json  = await res.json();
    const posts = (json?.data?.children ?? [])
      .map(c => ({
        title:        c.data?.title        ?? "",
        ups:          c.data?.ups          ?? 0,
        num_comments: c.data?.num_comments ?? 0,
        subreddit:    c.data?.subreddit    ?? "",
        permalink:    `https://reddit.com${c.data?.permalink ?? ""}`,
      }))
      .filter(p => p.title.length > 5); // drop blank/garbage entries

    if (!posts.length) {
      console.log(`[reddit-public] No posts found for "${keyword}"`);
      return { ...EMPTY, verdict: "no_data" };
    }

    const sorted        = [...posts].sort((a, b) => b.num_comments - a.num_comments);
    const socialScore   = calcSocialScore(posts);
    const totalComments = posts.reduce((s, p) => s + p.num_comments, 0);
    const totalUps      = posts.reduce((s, p) => s + p.ups, 0);

    console.log(`[reddit-public] "${keyword}" → score:${socialScore} posts:${posts.length} comments:${totalComments} ups:${totalUps}`);

    return {
      socialScore,
      totalPosts:       posts.length,
      totalComments,
      totalUps,
      patientQuestions: extractQuestions(sorted),
      topPostTitles:    sorted.slice(0, 5).map(p => p.title),
      topPosts:         sorted.slice(0, 5),
      verdict:
        socialScore >= 70 ? "high_buzz"     :
        socialScore >= 40 ? "moderate_buzz" :
        socialScore >= 10 ? "low_buzz"      : "no_data",
      source:     "Reddit Public JSON",
      searchedAt: new Date().toISOString(),
    };

  } catch (err) {
    clearTimeout(timer);
    if (err.name === "AbortError") console.warn("[reddit-public] Timeout after 5s");
    else console.warn("[reddit-public] Error:", err.message);
    return { ...EMPTY, verdict: "error" };
  }
}
