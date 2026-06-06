-- ============================================================
-- FULL REFERENCE SCHEMA (both modules, matches actual Supabase)
-- This is for reference. For fresh setup paste this entirely.
-- For existing DB use supabase_migration.sql instead.
-- ============================================================

-- users and profiles managed by Supabase Auth — not included here

create table public.startup_input (
  id                            uuid primary key default gen_random_uuid(),
  created_at                    timestamp default current_timestamp,
  updated_at                    timestamp default current_timestamp,
  user_id                       uuid references auth.users(id) on delete set null,
  full_name                     varchar,
  age                           int,
  gender                        varchar,
  city                          varchar,
  country                       varchar,
  profession                    varchar,
  industry_experience           varchar,
  founder_count                 int,
  founder_skillset              jsonb,
  startup_name                  varchar,
  startup_domain                varchar,
  problem_statement             text,
  startup_description           text,
  target_audience               varchar,
  geographic_market             varchar,
  existing_competitors          text,
  revenue_model                 varchar,
  estimated_pricing             varchar,
  available_funding             varchar,
  monthly_burn_capacity         varchar,
  platform_type                 jsonb,
  technology_complexity         varchar,
  mvp_timeline                  varchar,
  scalability_goal              text,
  customer_acquisition_strategy text,
  current_startup_stage         varchar
);

create table public.pitch_phase (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamp default current_timestamp,
  session_id     uuid not null references public.startup_input(id) on delete cascade,
  startup_name   varchar,
  pitch_text     text,
  pitch_length   int,
  indexed_chunks int
);

create table public.query_phase (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamp default current_timestamp,
  session_id         uuid not null unique references public.startup_input(id) on delete cascade,
  total_agents       int,
  successful_agents  int,
  failed_agents      int,
  empty_agents       int,
  total_docs_indexed int
);

create table public.query_agent_results (
  id                 uuid primary key default gen_random_uuid(),
  query_phase_id     uuid not null references public.query_phase(id) on delete cascade,
  agent_name         varchar,
  queries_generated  jsonb,
  results_collected  int,
  indexed_count      int,
  duplicates_dropped int,
  status             varchar
);

create table public.analysis_phase (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamp default current_timestamp,
  session_id        uuid not null unique references public.startup_input(id) on delete cascade,
  total_agents      int,
  successful_agents int,
  failed_agents     int,
  aggregate_score   double precision
);

create table public.analysis_agent_results (
  id                             uuid primary key default gen_random_uuid(),
  created_at                     timestamp default current_timestamp,
  analysis_phase_id              uuid not null references public.analysis_phase(id) on delete cascade,
  agent                          varchar,
  score                          double precision,
  verdict                        varchar,
  status                         varchar,
  summary                        text,
  strengths                      jsonb,
  weaknesses                     jsonb,
  tam_signal                     text,
  demand_signals                 jsonb,
  timing_assessment              text,
  key_competitors                jsonb,
  competitive_gaps               jsonb,
  differentiation_strength       text,
  overall_risk_level             varchar,
  usp_statement                  text,
  innovation_factors             jsonb,
  defensibility                  text,
  differentiation_vs_competitors jsonb,
  risks                          jsonb,
  recommendations                jsonb
);

create table public.critical_risks (
  id                        uuid primary key default gen_random_uuid(),
  analysis_agent_result_id  uuid not null references public.analysis_agent_results(id) on delete cascade,
  risk                      text,
  severity                  varchar,
  mitigation                text
);

create table public.pipeline_output (
  id                           uuid primary key default gen_random_uuid(),
  created_at                   timestamp default current_timestamp,
  session_id                   uuid not null unique references public.startup_input(id) on delete cascade,
  status                       varchar,
  aggregate_validation_score   double precision,
  total_docs_in_vector_store   int
);

create table public.roadmap_profiler (
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

create table public.roadmap_branches (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  profiler_id uuid not null references public.roadmap_profiler(id) on delete cascade,
  session_id  uuid not null references public.startup_input(id) on delete cascade,
  branch      text,
  status      text,
  summary     text
);

create table public.roadmap_tasks (
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

-- Indexes
create index on public.startup_input(startup_name);
create index on public.startup_input(user_id);
create index on public.pitch_phase(session_id);
create index on public.query_phase(session_id);
create index on public.query_agent_results(query_phase_id);
create index on public.analysis_phase(session_id);
create index on public.analysis_agent_results(analysis_phase_id);
create index on public.analysis_agent_results(agent);
create index on public.critical_risks(analysis_agent_result_id);
create index on public.pipeline_output(session_id);
create index on public.roadmap_profiler(session_id);
create index on public.roadmap_branches(profiler_id);
create index on public.roadmap_branches(session_id);
create index on public.roadmap_tasks(branch_id);
create index on public.roadmap_tasks(dep_status);
