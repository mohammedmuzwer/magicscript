-- ═══════════════════════════════════════════════════════════════════════════
-- Magic Script — Doctor Farmer Podcast Pipeline
-- Supabase Schema v1
--
-- Run this in the Supabase Dashboard → SQL Editor → Paste → Run
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Enable UUID extension (already on by default in Supabase) ─────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ── TABLE: podcasts ───────────────────────────────────────────────────────
-- Stores one row per completed episode (created when Stage 8 is approved).
CREATE TABLE IF NOT EXISTS podcasts (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  topic             TEXT        NOT NULL,
  final_script_json JSONB,          -- Full Stage 8 two-column production script
  show_design_json  JSONB,          -- Stage 7 segments / superfood / CTAs
  stage_data_json   JSONB,          -- Complete stageData snapshot (all 10 stages)
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index: latest episodes first
CREATE INDEX IF NOT EXISTS podcasts_created_at_idx ON podcasts (created_at DESC);

-- ── TABLE: verified_facts ─────────────────────────────────────────────────
-- Fact library: GREEN and YELLOW claims from Stage 4, persisted across episodes.
-- Stage 4 queries this before calling the LLM — prevents re-researching known claims.
CREATE TABLE IF NOT EXISTS verified_facts (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_tags   TEXT[]      NOT NULL DEFAULT '{}',   -- e.g. ['sleep','diabetes']
  claim_text   TEXT        NOT NULL,
  grade        TEXT        NOT NULL CHECK (grade IN ('GREEN','YELLOW','BLUE','RED')),
  source_text  TEXT,                                 -- Citation / annotation
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint: no duplicate claim+grade pairs
CREATE UNIQUE INDEX IF NOT EXISTS verified_facts_claim_grade_uidx
  ON verified_facts (claim_text, grade);

-- Index: fast overlap search on topic_tags (GIN index for array operators)
CREATE INDEX IF NOT EXISTS verified_facts_tags_gin_idx
  ON verified_facts USING GIN (topic_tags);


-- ── TABLE: idea_vault ─────────────────────────────────────────────────────
-- "Zero-waste" Stage 1 backlog. When a user picks 1 of the 5 generated topics,
-- the other 4 are silently saved here so no idea is ever lost.
-- Surfaced as the "💡 Unused Ideas" dropdown on Stage 1.
CREATE TABLE IF NOT EXISTS idea_vault (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_title     TEXT        NOT NULL,
  search_keyword  TEXT,                              -- The seed keyword that produced this idea
  topic_json      JSONB       NOT NULL,              -- Full Stage 1 topic object (so it can be re-hydrated 1-to-1)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index: latest ideas first (dropdown shows newest 20)
CREATE INDEX IF NOT EXISTS idea_vault_created_at_idx ON idea_vault (created_at DESC);


-- ── ROW LEVEL SECURITY ────────────────────────────────────────────────────
-- Enable RLS on all tables (required for anon/publishable key access).

ALTER TABLE podcasts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE verified_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_vault     ENABLE ROW LEVEL SECURITY;

-- Policy: allow all operations from the browser (anon key).
-- Tighten this once you add Supabase Auth (restrict to auth.uid() matches).

CREATE POLICY "allow_anon_all_podcasts"
  ON podcasts
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "allow_anon_all_verified_facts"
  ON verified_facts
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "allow_anon_all_idea_vault"
  ON idea_vault
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);


-- ═══════════════════════════════════════════════════════════════════════════
-- Done. Three tables created:
--   podcasts       — one row per completed episode
--   verified_facts — cross-episode fact library for Stage 4
--   idea_vault     — Stage 1 unselected-topic backlog (zero-waste workflow)
-- ═══════════════════════════════════════════════════════════════════════════
