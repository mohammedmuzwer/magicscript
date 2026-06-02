-- ============================================================
--  VeriContent AI — Supabase schema
--  Run in the Supabase SQL editor to provision the live backend.
--  Demo mode (no env vars) does NOT require this — it uses mock data.
-- ============================================================

-- ---------- Enums -------------------------------------------------
create type plan_tier      as enum ('free', 'creator', 'pro', 'enterprise');
create type user_role      as enum ('creator', 'admin');
create type evidence_verdict as enum ('proven', 'mixed', 'misleading', 'false');
create type content_language as enum ('en', 'ta', 'tanglish', 'hi', 'ml', 'te', 'kn');
create type flag_status     as enum ('pending', 'reviewing', 'resolved', 'removed');

-- ---------- users -------------------------------------------------
-- One row per auth user. id mirrors auth.users.id.
create table public.users (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text unique not null,
  full_name     text,
  avatar_hue    int default 210,
  role          user_role default 'creator',
  niche         text default 'Health & Wellness',
  plan          plan_tier default 'free',
  credits       int default 15,
  credits_total int default 15,
  provider      text default 'email',
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ---------- subscriptions ----------------------------------------
create table public.subscriptions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.users (id) on delete cascade,
  plan               plan_tier not null default 'free',
  status             text not null default 'active',   -- active | trialing | past_due | canceled
  stripe_customer_id text,
  current_period_end timestamptz,
  monthly_credits    int default 15,
  created_at         timestamptz default now()
);

-- ---------- generations ------------------------------------------
-- One row per topic verification + multilingual content set.
create table public.generations (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users (id) on delete cascade,
  topic            text not null,
  language         content_language not null default 'en',
  tone             text not null default 'educational',
  platform         text not null default 'reels',
  length           text not null default 'medium',
  verdict          evidence_verdict not null default 'mixed',
  confidence       int  not null default 0,
  evidence_strength int default 0,
  misinfo_risk     int  default 0,
  consensus        int  default 0,
  research_quality int  default 0,
  viral_potential  int  default 0,
  content          jsonb not null default '{}'::jsonb,  -- hooks, scripts, carousel, caption, cta, hashtags
  research_summary text,
  created_at       timestamptz default now()
);
create index generations_user_idx     on public.generations (user_id, created_at desc);
create index generations_verdict_idx  on public.generations (verdict);

-- ---------- saved_content ----------------------------------------
create table public.saved_content (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users (id) on delete cascade,
  generation_id uuid not null references public.generations (id) on delete cascade,
  collection    text default 'My Library',
  notes         text,
  created_at    timestamptz default now(),
  unique (user_id, generation_id)
);

-- ---------- citations --------------------------------------------
-- Research sources attached to a generation.
create table public.citations (
  id             uuid primary key default gen_random_uuid(),
  generation_id  uuid not null references public.generations (id) on delete cascade,
  source         text not null,            -- PubMed | NIH | WHO | FDA | ClinicalTrials.gov
  title          text not null,
  journal        text,
  publication_year int,
  study_type     text,                     -- Meta-analysis | RCT | Cohort | ...
  subjects       text,                     -- Human | Animal
  sample_size    text,
  evidence_level text,
  summary        text,
  url            text,
  created_at     timestamptz default now()
);
create index citations_generation_idx on public.citations (generation_id);

-- ---------- flagged_content --------------------------------------
-- Items the safety engine routed to the moderation queue.
create table public.flagged_content (
  id            uuid primary key default gen_random_uuid(),
  generation_id uuid references public.generations (id) on delete set null,
  user_id       uuid references public.users (id) on delete set null,
  topic         text not null,
  verdict       evidence_verdict,
  risk_score    int not null default 0,
  flagged_for   text not null,
  status        flag_status not null default 'pending',
  reviewed_by   uuid references public.users (id),
  created_at    timestamptz default now()
);
create index flagged_status_idx on public.flagged_content (status);

-- ---------- usage_logs -------------------------------------------
-- Credit + API usage audit trail.
create table public.usage_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users (id) on delete cascade,
  action       text not null,              -- generate | verify | export | regenerate
  credits_used int default 1,
  api_source   text,                       -- PubMed | NIH | WHO | FDA | OpenAI
  metadata     jsonb default '{}'::jsonb,
  created_at   timestamptz default now()
);
create index usage_logs_user_idx on public.usage_logs (user_id, created_at desc);

-- ============================================================
--  Row Level Security
-- ============================================================
alter table public.users           enable row level security;
alter table public.subscriptions   enable row level security;
alter table public.generations     enable row level security;
alter table public.saved_content   enable row level security;
alter table public.citations       enable row level security;
alter table public.flagged_content enable row level security;
alter table public.usage_logs      enable row level security;

-- Users: a person can read/update only their own row.
create policy "own profile read"   on public.users for select using (auth.uid() = id);
create policy "own profile update" on public.users for update using (auth.uid() = id);

-- Generations / saved / usage: owner-scoped.
create policy "own generations" on public.generations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own saved" on public.saved_content
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own subscriptions" on public.subscriptions
  for select using (auth.uid() = user_id);
create policy "own usage" on public.usage_logs
  for select using (auth.uid() = user_id);

-- Citations: readable if the parent generation belongs to the user.
create policy "own citations" on public.citations
  for select using (
    exists (
      select 1 from public.generations g
      where g.id = citations.generation_id and g.user_id = auth.uid()
    )
  );

-- Flagged content: only admins may read/manage.
create policy "admin flagged" on public.flagged_content
  for all using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

-- ============================================================
--  Auto-provision a profile + subscription on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, provider)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_app_meta_data ->> 'provider', 'email')
  );
  insert into public.subscriptions (user_id, plan, monthly_credits)
  values (new.id, 'free', 15);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- Create the Podcasts table to store your finished episodes
CREATE TABLE podcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  final_script_json JSONB,
  show_design_json JSONB,
  stage_data_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the Verified Facts Library table for your AI's memory
CREATE TABLE verified_facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_tags TEXT[],
  claim_text TEXT NOT NULL,
  grade TEXT,
  source_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create a quick index to make searching tags super fast
CREATE INDEX verified_facts_tags_idx ON verified_facts USING GIN (topic_tags);
