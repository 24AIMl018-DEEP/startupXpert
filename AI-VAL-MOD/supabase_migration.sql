-- ============================================================
-- MIGRATION SCRIPT — Run in Supabase SQL Editor
-- 
-- Step 1: Drops old unused tables (safe — no real data there)
-- Step 2: Adds Roadmap Module tables
-- Existing tables (startup_input, pitch_phase, etc.) are UNTOUCHED
-- users and profiles are UNTOUCHED
-- ============================================================


-- ── Step 1: Drop old unused tables ───────────────────────────────────────────
drop table if exists public.documents   cascade;
drop table if exists public.roadmaps    cascade;
drop table if exists public.validations cascade;
drop table if exists public.startup_ideas cascade;


-- ── Step 2: Roadmap Module tables ────────────────────────────────────────────

-- Profiler output: business classification + dynamic branch plan
create table if not exists public.roadmap_profiler (
  id                   uuid primary key default gen_random_uuid(),
  created_at           timestamptz default now(),
  session_id           uuid not null references public.startup_input(id) on delete cascade,
  startup_name         text,
  business_type        text,
  tech_required        boolean,
  prioritized_branches jsonb,   -- ["branch_a", "branch_b", ...]
  branch_tier_map      jsonb,   -- {"branch_a": 2, "branch_b": 1, ...}
  reasoning            text
);

-- Per-branch roadmap summary
create table if not exists public.roadmap_branches (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  profiler_id uuid not null references public.roadmap_profiler(id) on delete cascade,
  session_id  uuid not null references public.startup_input(id) on delete cascade,
  branch      text,
  status      text,   -- 'success' | 'failed'
  summary     text
);

-- Tasks per branch (resource-assigned + dependency-synced)
create table if not exists public.roadmap_tasks (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz default now(),
  branch_id       uuid not null references public.roadmap_branches(id) on delete cascade,
  task_id         text,
  title           text,
  description     text,
  timeline        text,
  priority        text,    -- 'High' | 'Medium' | 'Low'
  assigned_to     text,    -- team member name or 'External / Outsource'
  assignee_role   text,
  estimated_hours int,
  complexity      text,    -- 'Low' | 'Medium' | 'High'
  cost_impact     text,    -- 'None' | 'Low' | 'Medium' | 'High'
  dep_status      text default 'Ready',   -- 'Ready' | 'Blocked'
  blocked_by      jsonb default '[]',
  unblocks        jsonb default '[]'
);


-- ── Step 3: Indexes ───────────────────────────────────────────────────────────
create index if not exists idx_roadmap_profiler_session  on public.roadmap_profiler(session_id);
create index if not exists idx_roadmap_branches_profiler on public.roadmap_branches(profiler_id);
create index if not exists idx_roadmap_branches_session  on public.roadmap_branches(session_id);
create index if not exists idx_roadmap_tasks_branch      on public.roadmap_tasks(branch_id);
create index if not exists idx_roadmap_tasks_dep_status  on public.roadmap_tasks(dep_status);
create index if not exists idx_roadmap_tasks_assigned    on public.roadmap_tasks(assigned_to);
