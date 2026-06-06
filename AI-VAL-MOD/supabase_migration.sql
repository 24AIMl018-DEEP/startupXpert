-- ============================================================
-- MIGRATION SCRIPT — Run in Supabase SQL Editor
--
-- Step 1: Drop old unused tables (safe — no real data)
-- Step 2: Add Roadmap Module tables
-- Step 3: Add user_id + updated_at to startup_input
-- Step 4: Indexes
-- ============================================================


-- ── Step 1: Drop old unused tables ───────────────────────────────────────────
drop table if exists public.documents    cascade;
drop table if exists public.roadmaps     cascade;
drop table if exists public.validations  cascade;
drop table if exists public.startup_ideas cascade;


-- ── Shared trigger function (idempotent) ─────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ── Step 2: Roadmap Module tables ────────────────────────────────────────────

-- Profiler output: business classification + dynamic branch plan
create table if not exists public.roadmap_profiler (
  id                   uuid primary key default gen_random_uuid(),
  created_at           timestamptz default now(),
  session_id           uuid not null references public.startup_input(id) on delete cascade,
  startup_name         text,
  business_type        text,
  tech_required        boolean,
  prioritized_branches jsonb,
  branch_tier_map      jsonb,
  reasoning            text
);

-- Per-branch roadmap summary
create table if not exists public.roadmap_branches (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  profiler_id uuid not null references public.roadmap_profiler(id) on delete cascade,
  session_id  uuid not null references public.startup_input(id) on delete cascade,
  branch      text,
  status      text,
  summary     text
);

-- Tasks per branch (resource-assigned + dependency-synced)
create table if not exists public.roadmap_tasks (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  branch_id       uuid not null references public.roadmap_branches(id) on delete cascade,
  task_id         text,
  title           text,
  description     text,
  timeline        text,
  priority        text,
  assigned_to     text,
  assignee_role   text,
  estimated_hours int,
  complexity      text,
  cost_impact     text,
  dep_status      text default 'Ready',
  blocked_by      jsonb default '[]',
  unblocks        jsonb default '[]'
);

-- updated_at triggers for roadmap tables
drop trigger if exists roadmap_branches_updated_at on public.roadmap_branches;
create trigger roadmap_branches_updated_at
  before update on public.roadmap_branches
  for each row execute function public.set_updated_at();

drop trigger if exists roadmap_tasks_updated_at on public.roadmap_tasks;
create trigger roadmap_tasks_updated_at
  before update on public.roadmap_tasks
  for each row execute function public.set_updated_at();


-- ── Step 3: Add user_id + updated_at to startup_input ──────────────────────
alter table public.startup_input
  add column if not exists user_id    uuid references auth.users(id) on delete set null,
  add column if not exists updated_at timestamptz default now();

drop trigger if exists startup_input_updated_at on public.startup_input;
create trigger startup_input_updated_at
  before update on public.startup_input
  for each row execute function public.set_updated_at();


-- ── Step 4: Indexes ───────────────────────────────────────────────────────────
create index if not exists idx_startup_input_user_id      on public.startup_input(user_id);
create index if not exists idx_roadmap_profiler_session   on public.roadmap_profiler(session_id);
create index if not exists idx_roadmap_branches_profiler  on public.roadmap_branches(profiler_id);
create index if not exists idx_roadmap_branches_session   on public.roadmap_branches(session_id);
create index if not exists idx_roadmap_tasks_branch       on public.roadmap_tasks(branch_id);
create index if not exists idx_roadmap_tasks_dep_status   on public.roadmap_tasks(dep_status);
create index if not exists idx_roadmap_tasks_assigned     on public.roadmap_tasks(assigned_to);
