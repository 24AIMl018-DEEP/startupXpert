-- ============================================================
-- Roadmap Module -- Supabase Schema (Full)
-- ============================================================

-- Table 1: roadmap_profiler
-- ============================================================
create table if not exists roadmap_profiler (
    id                   uuid primary key default gen_random_uuid(),
    session_id           uuid not null references pipeline_output(id) on delete cascade,
    startup_name         text,
    business_type        text,
    tech_required        boolean not null default false,
    prioritized_branches text[]  not null default '{}',
    banned_branches      text[]  not null default '{}',
    reasoning            text,
    created_at           timestamptz not null default now()
);

create index if not exists idx_roadmap_profiler_session on roadmap_profiler(session_id);


-- Table 2: roadmap_branches
-- ============================================================
create table if not exists roadmap_branches (
    id           uuid primary key default gen_random_uuid(),
    profiler_id  uuid not null references roadmap_profiler(id) on delete cascade,
    session_id   uuid not null,
    branch       text not null,
    status       text not null check (status in ('success', 'failed')),
    summary      text,
    created_at   timestamptz not null default now()
);

create index if not exists idx_roadmap_branches_profiler on roadmap_branches(profiler_id);
create index if not exists idx_roadmap_branches_session  on roadmap_branches(session_id);


-- Table 3: roadmap_tasks
-- Module 3 (team assignment) + Module 4 (dependency sync)
-- ============================================================
create table if not exists roadmap_tasks (
    id               uuid primary key default gen_random_uuid(),
    branch_id        uuid not null references roadmap_branches(id) on delete cascade,

    -- identity
    task_id          text not null,
    title            text,
    description      text,
    timeline         text,
    priority         text check (priority in ('High', 'Medium', 'Low')),

    -- Module 3: team assignment
    assigned_to      text,        -- team member name or "External / Outsource"
    assignee_role    text,        -- their role e.g. "Developer", "Co-Founder"
    estimated_hours  integer,
    complexity       text check (complexity in ('Low', 'Medium', 'High')),
    cost_impact      text check (cost_impact in ('None', 'Low', 'Medium', 'High')),

    -- Module 4: dependency sync
    status           text not null default 'Ready' check (status in ('Ready', 'Blocked')),
    blocked_by       text[] not null default '{}',
    unblocks         text[] not null default '{}',

    created_at       timestamptz not null default now()
);

create index if not exists idx_roadmap_tasks_branch   on roadmap_tasks(branch_id);
create index if not exists idx_roadmap_tasks_task_id  on roadmap_tasks(task_id);
create index if not exists idx_roadmap_tasks_status   on roadmap_tasks(status);
create index if not exists idx_roadmap_tasks_assignee on roadmap_tasks(assigned_to);
