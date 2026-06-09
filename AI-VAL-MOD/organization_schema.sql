-- ============================================================
-- Organization & Team Collaboration Schema
-- Run this in Supabase SQL editor
-- ============================================================

-- User type enum
create type user_type as enum ('organization', 'solo');

-- Organization roles
create type org_role as enum ('founder', 'admin', 'member', 'viewer');

-- ── Table: organizations ──────────────────────────────────────
create table if not exists organizations (
    id           uuid primary key default gen_random_uuid(),
    name         text not null,
    domain       text,                          -- e.g. "acme.com" for auto-invite
    created_by   uuid not null references auth.users(id) on delete cascade,
    invite_code  text unique default substring(gen_random_uuid()::text, 1, 8),
    created_at   timestamptz not null default now()
);

create index if not exists idx_organizations_created_by on organizations(created_by);

-- ── Table: org_members ────────────────────────────────────────
create table if not exists org_members (
    id          uuid primary key default gen_random_uuid(),
    org_id      uuid not null references organizations(id) on delete cascade,
    user_id     uuid not null references auth.users(id) on delete cascade,
    role        org_role not null default 'member',
    full_name   text,
    job_title   text,                           -- e.g. "CTO", "Marketing Lead"
    skills      text[] not null default '{}',   -- e.g. ['Python', 'React']
    joined_at   timestamptz not null default now(),
    unique(org_id, user_id)
);

create index if not exists idx_org_members_org    on org_members(org_id);
create index if not exists idx_org_members_user   on org_members(user_id);

-- ── Alter: users table — add user_type + org linkage ─────────
-- (startup_input already has user_id; org_id links validation to an org)
alter table startup_input
    add column if not exists org_id      uuid references organizations(id) on delete set null,
    add column if not exists user_type   user_type not null default 'solo';

-- ── Alter: roadmap_tasks — add org_member assignment ─────────
-- assigned_member_id links to org_members.id for proper collaboration
alter table roadmap_tasks
    add column if not exists assigned_member_id uuid references org_members(id) on delete set null,
    add column if not exists completion_note    text,       -- member can add note when done
    add column if not exists completed_at       timestamptz,
    add column if not exists dep_status         text not null default 'Pending'
        check (dep_status in ('Pending', 'In Progress', 'Done', 'Blocked'));

create index if not exists idx_roadmap_tasks_member on roadmap_tasks(assigned_member_id);

-- ── Table: task_comments (collaboration) ─────────────────────
create table if not exists task_comments (
    id          uuid primary key default gen_random_uuid(),
    task_id     uuid not null references roadmap_tasks(id) on delete cascade,
    user_id     uuid not null references auth.users(id) on delete cascade,
    comment     text not null,
    created_at  timestamptz not null default now()
);

create index if not exists idx_task_comments_task on task_comments(task_id);

-- ── RLS Policies ──────────────────────────────────────────────

-- organizations: only members can read, only founder/admin can write
alter table organizations enable row level security;
create policy "org_read"   on organizations for select using (
    exists (select 1 from org_members where org_id = organizations.id and user_id = auth.uid())
    or created_by = auth.uid()
);
create policy "org_insert" on organizations for insert with check (auth.uid() = created_by);
create policy "org_update" on organizations for update using (
    exists (select 1 from org_members where org_id = organizations.id and user_id = auth.uid() and role in ('founder','admin'))
    or created_by = auth.uid()
);

-- org_members: members can read their org, founders/admins can manage
alter table org_members enable row level security;
create policy "member_read" on org_members for select using (
    org_id in (select org_id from org_members where user_id = auth.uid())
    or user_id = auth.uid()
);
create policy "member_insert" on org_members for insert with check (
    -- founder inserting others, or self-join via invite
    auth.uid() in (
        select user_id from org_members where org_id = org_members.org_id and role in ('founder','admin')
    )
    or auth.uid() = user_id
);
create policy "member_update" on org_members for update using (
    -- can update own row, or founder/admin can update others
    user_id = auth.uid()
    or exists (select 1 from org_members m2 where m2.org_id = org_members.org_id and m2.user_id = auth.uid() and m2.role in ('founder','admin'))
);

-- task_comments: any org member of the roadmap's org can read/write
alter table task_comments enable row level security;
create policy "comment_read"   on task_comments for select using (auth.uid() is not null);
create policy "comment_insert" on task_comments for insert with check (auth.uid() = user_id);
