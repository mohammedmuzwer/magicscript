-- VeriContent AI — Workflow Builder Schema Migration
-- Run this in the Supabase SQL editor after the base schema.sql

-- ─── Workflow definitions ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workflows (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL DEFAULT 'Untitled Workflow',
  description   TEXT,
  nodes         JSONB NOT NULL DEFAULT '[]',
  edges         JSONB NOT NULL DEFAULT '[]',
  total_credits INTEGER DEFAULT 0,
  is_template   BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Workflow executions ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workflow_executions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id   UUID REFERENCES workflows(id) ON DELETE SET NULL,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  input_data    JSONB DEFAULT '{}',
  results       JSONB DEFAULT '{}',
  node_statuses JSONB DEFAULT '{}',
  status        TEXT NOT NULL DEFAULT 'running'
                CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  credits_used  INTEGER DEFAULT 0,
  started_at    TIMESTAMPTZ DEFAULT NOW(),
  completed_at  TIMESTAMPTZ
);

-- ─── Indexes ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_workflows_user_id    ON workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_created_at ON workflows(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wf_executions_user   ON workflow_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_wf_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_wf_executions_wf_id  ON workflow_executions(workflow_id);

-- ─── updated_at trigger ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_workflow_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_workflows_updated_at ON workflows;
CREATE TRIGGER trg_workflows_updated_at
  BEFORE UPDATE ON workflows
  FOR EACH ROW EXECUTE FUNCTION update_workflow_timestamp();

-- ─── Row Level Security ───────────────────────────────────────────────────
ALTER TABLE workflows           ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

-- Workflows: users own their own, anyone can read public templates
CREATE POLICY "Users manage own workflows"
  ON workflows FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public templates readable"
  ON workflows FOR SELECT
  USING (is_template = true);

-- Executions: users own their own only
CREATE POLICY "Users manage own executions"
  ON workflow_executions FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins see everything
CREATE POLICY "Admins read all workflows"
  ON workflows FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins read all executions"
  ON workflow_executions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
