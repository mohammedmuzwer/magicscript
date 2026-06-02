import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  // Silently skip in demo mode — the client will be null
  // and all helpers guard against null before calling.
}

/**
 * Supabase browser client.
 * Returns null when keys are missing (demo / local dev without Supabase).
 */
export const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

// ─── Podcast helpers ──────────────────────────────────────────────────────────

/**
 * Save a podcast episode to the `podcasts` table — one row per project.
 *
 * Behaviour:
 * - First call (Stage 8 approval) → INSERT new row, returns { id }
 * - Subsequent calls passing the same `id` (Stage 10 finish) → UPDATE same row
 *
 * This is how we avoid creating duplicate rows for the same project.
 *
 * @param {object} params
 * @param {string} [params.id]           - When provided, UPDATEs the existing row
 * @param {string} params.topic          - The locked episode topic
 * @param {object} params.finalScript    - Full Stage 8 script JSON
 * @param {object} params.showDesign     - Stage 7 segments / superfood / CTAs
 * @param {object} params.allStageData   - Full stageData object (all 10 stages)
 * @returns {Promise<{ id: string } | null>}
 */
export async function savePodcastEpisode({ id, topic, finalScript, showDesign, allStageData }) {
  if (!supabase) return null;

  const payload = {
    topic:             topic ?? "Untitled Episode",
    final_script_json: finalScript ?? null,
    show_design_json:  showDesign  ?? null,
    stage_data_json:   allStageData ?? null,
  };

  try {
    // ── UPDATE path: the project already has a row, refresh it ─────────────
    if (id) {
      const { data, error } = await supabase
        .from("podcasts")
        .update(payload)
        .eq("id", id)
        .select("id")
        .single();

      if (error) {
        console.error("[supabase] savePodcastEpisode update error:", error.message);
        return null;
      }
      return data; // { id }
    }

    // ── INSERT path: first save for this project ───────────────────────────
    const { data, error } = await supabase
      .from("podcasts")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      console.error("[supabase] savePodcastEpisode insert error:", error.message);
      return null;
    }
    return data; // { id: "uuid" }
  } catch (err) {
    console.error("[supabase] savePodcastEpisode exception:", err.message);
    return null;
  }
}

// ─── Verified Facts helpers ───────────────────────────────────────────────────

/**
 * Bulk-upsert verified facts (Stage 4 GREEN/YELLOW claims) to `verified_facts`.
 * Skips duplicates by matching on (claim_text, grade).
 *
 * @param {Array<{claim_text, grade, source_text, topic_tags}>} claims
 */
export async function saveVerifiedFacts(claims) {
  if (!supabase || !claims?.length) return null;
  try {
    const rows = claims.map((c) => ({
      topic_tags:  c.topic_tags  ?? [],
      claim_text:  c.claim_text  ?? c.claim ?? "",
      grade:       c.grade       ?? "GREEN",
      source_text: c.source_text ?? c.citation ?? null,
    }));

    const { error } = await supabase
      .from("verified_facts")
      .upsert(rows, { onConflict: "claim_text,grade", ignoreDuplicates: true });

    if (error) console.error("[supabase] saveVerifiedFacts error:", error.message);
    return !error;
  } catch (err) {
    console.error("[supabase] saveVerifiedFacts exception:", err.message);
    return null;
  }
}

/**
 * Fetch pre-verified facts matching any of the given topic tags.
 * Used by Stage 4 to skip re-researching known claims.
 *
 * @param {string[]} topicTags
 * @returns {Promise<Array>}
 */
export async function fetchVerifiedFacts(topicTags) {
  if (!supabase || !topicTags?.length) return [];
  try {
    const { data, error } = await supabase
      .from("verified_facts")
      .select("*")
      .overlaps("topic_tags", topicTags)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("[supabase] fetchVerifiedFacts error:", error.message);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.error("[supabase] fetchVerifiedFacts exception:", err.message);
    return [];
  }
}

/**
 * Fetch all saved podcast episodes (for Library / History pages).
 */
export async function fetchPodcastEpisodes() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("podcasts")
      .select("id, topic, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("[supabase] fetchPodcastEpisodes error:", error.message);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.error("[supabase] fetchPodcastEpisodes exception:", err.message);
    return [];
  }
}

/**
 * Fetch the podcast history list — used by the History page.
 * Selects topic, created_at, and final_script_json (for quick preview cards).
 *
 * STRICTLY a DB read — never triggers any LLM API calls.
 *
 * @returns {Promise<Array<{id, topic, created_at, final_script_json}>>}
 */
export async function getPodcastHistory() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("podcasts")
      .select("id, topic, created_at, final_script_json")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("[supabase] getPodcastHistory error:", error.message);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.error("[supabase] getPodcastHistory exception:", err.message);
    return [];
  }
}

/**
 * Fetch one complete podcast episode — used by the "View Project" hydration flow.
 * Returns the FULL stage_data_json so the PodcastPipeline can re-render every
 * stage from cached data without re-running any LLM calls.
 *
 * STRICTLY a DB read — never triggers any LLM API calls.
 *
 * @param {string} id  - podcast UUID
 * @returns {Promise<{ id, topic, created_at, final_script_json, show_design_json, stage_data_json } | null>}
 */
export async function getPodcastEpisode(id) {
  if (!supabase || !id) return null;
  try {
    const { data, error } = await supabase
      .from("podcasts")
      .select("id, topic, created_at, final_script_json, show_design_json, stage_data_json")
      .eq("id", id)
      .single();

    if (error) {
      console.error("[supabase] getPodcastEpisode error:", error.message);
      return null;
    }
    return data ?? null;
  } catch (err) {
    console.error("[supabase] getPodcastEpisode exception:", err.message);
    return null;
  }
}

// ─── Idea Vault helpers ───────────────────────────────────────────────────────
// "Zero-waste" Stage 1 workflow:
//   - When the user picks 1 of 5 generated topics, the other 4 are silently
//     saved to `idea_vault`, tagged with the original search keyword.
//   - Stage 1 shows a "💡 Unused Ideas" dropdown of the latest 20 vault entries.
//   - Clicking a vault idea hydrates Stage 1 with it and deletes the row.

/**
 * Insert Stage 1 topics into the vault.
 *
 * Called immediately after generation with ALL 5 topics — so a user who
 * regenerates without picking still gets fresh angles next time.
 * On proceed, the single picked topic is removed via `deleteFromVaultByTitle`.
 *
 * @param {Array}  topics         - The topics to save (typically the 5 just generated)
 * @param {string} searchKeyword  - The keyword that generated those topics
 * @returns {Promise<Array<{id, topic_title}> | null>}  - Inserted rows (with new IDs) or null on error
 */
export async function saveToVault(topics, searchKeyword) {
  if (!supabase) return null;
  if (!Array.isArray(topics) || topics.length === 0) return null;
  try {
    const rows = topics.map((t) => ({
      topic_title:    t?.title ?? "Untitled Topic",
      search_keyword: searchKeyword ?? null,
      topic_json:     t ?? {},
    }));

    const { data, error } = await supabase
      .from("idea_vault")
      .insert(rows)
      .select("id, topic_title");

    if (error) {
      console.error("[supabase] saveToVault error:", error.message);
      return null;
    }
    return data ?? [];
  } catch (err) {
    console.error("[supabase] saveToVault exception:", err.message);
    return null;
  }
}

/**
 * Delete a vault row by (topic_title, search_keyword) — used on Stage 1 proceed
 * to remove the picked topic from the vault (since it's now being used in the pipeline).
 *
 * @param {string} topicTitle
 * @param {string} searchKeyword
 * @returns {Promise<boolean>}
 */
export async function deleteFromVaultByTitle(topicTitle, searchKeyword) {
  if (!supabase || !topicTitle) return false;
  try {
    let q = supabase.from("idea_vault").delete().eq("topic_title", topicTitle);
    if (searchKeyword) q = q.eq("search_keyword", searchKeyword);
    const { error } = await q;
    if (error) {
      console.error("[supabase] deleteFromVaultByTitle error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[supabase] deleteFromVaultByTitle exception:", err.message);
    return false;
  }
}

/**
 * Fetch the latest 20 unused ideas — surfaced as the Stage 1 dropdown.
 * @returns {Promise<Array<{ id, topic_title, search_keyword, topic_json, created_at }>>}
 */
export async function getVaultIdeas() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("idea_vault")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("[supabase] getVaultIdeas error:", error.message);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.error("[supabase] getVaultIdeas exception:", err.message);
    return [];
  }
}

/**
 * Remove a vault entry once it's been re-used.
 * @param {string} id - idea_vault UUID
 * @returns {Promise<boolean>}
 */
export async function deleteFromVault(id) {
  if (!supabase || !id) return false;
  try {
    const { error } = await supabase.from("idea_vault").delete().eq("id", id);
    if (error) {
      console.error("[supabase] deleteFromVault error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[supabase] deleteFromVault exception:", err.message);
    return false;
  }
}

/**
 * Fetch every topic title we've already seen for a keyword — from BOTH:
 *   1. Saved podcasts (the user actually shipped these)
 *   2. The idea vault (the user already has these queued)
 *
 * The Stage 1 generator uses this to AVOID re-suggesting the same titles
 * when the same keyword is searched again. This is the cure for the
 * "I keep getting the same 5 topics" problem.
 *
 * @param {string} keyword
 * @returns {Promise<string[]>}  - array of topic_title strings (unique)
 */
export async function getUsedTopicTitles(keyword) {
  if (!supabase) return [];
  const kw = (keyword ?? "").trim();
  if (!kw) return [];

  try {
    // Run both lookups in parallel
    const [vaultRes, podcastsRes] = await Promise.all([
      // Vault matches the keyword exactly (vault rows are tagged with search_keyword)
      supabase
        .from("idea_vault")
        .select("topic_title")
        .ilike("search_keyword", kw)
        .limit(200),
      // Podcasts: fuzzy match on topic field
      supabase
        .from("podcasts")
        .select("topic")
        .ilike("topic", `%${kw}%`)
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

    const fromVault    = (vaultRes.data ?? []).map((r) => r.topic_title).filter(Boolean);
    const fromPodcasts = (podcastsRes.data ?? []).map((r) => r.topic).filter(Boolean);

    // Dedupe (case-insensitive)
    const seen = new Set();
    const out  = [];
    for (const t of [...fromVault, ...fromPodcasts]) {
      const k = t.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(t);
    }
    return out;
  } catch (err) {
    console.error("[supabase] getUsedTopicTitles exception:", err.message);
    return [];
  }
}
