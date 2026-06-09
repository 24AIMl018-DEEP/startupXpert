-- Definitive Migration SQL for AI-VAL-MOD and Roadmap-Module
-- Links Login (auth.users) -> Validation (startup_input) -> Roadmap (roadmap_*)

-- 1. Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Modify startup_input (Login -> Validation link)
ALTER TABLE public.startup_input 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS set_timestamp_startup_input ON public.startup_input;
CREATE TRIGGER set_timestamp_startup_input
BEFORE UPDATE ON public.startup_input
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- 3. Create roadmap_profiler
CREATE TABLE IF NOT EXISTS public.roadmap_profiler (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.startup_input(id) ON DELETE CASCADE,
    startup_name TEXT,
    business_type TEXT,
    tech_required BOOLEAN,
    prioritized_branches JSONB,
    branch_tier_map JSONB,
    reasoning TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_timestamp_roadmap_profiler ON public.roadmap_profiler;
CREATE TRIGGER set_timestamp_roadmap_profiler
BEFORE UPDATE ON public.roadmap_profiler
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- 4. Create roadmap_branches
CREATE TABLE IF NOT EXISTS public.roadmap_branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profiler_id UUID REFERENCES public.roadmap_profiler(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.startup_input(id) ON DELETE CASCADE,
    branch TEXT,
    status TEXT DEFAULT 'Pending',
    summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_timestamp_roadmap_branches ON public.roadmap_branches;
CREATE TRIGGER set_timestamp_roadmap_branches
BEFORE UPDATE ON public.roadmap_branches
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- 5. Create roadmap_tasks
CREATE TABLE IF NOT EXISTS public.roadmap_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES public.roadmap_branches(id) ON DELETE CASCADE,
    task_id TEXT,
    title TEXT,
    description TEXT,
    timeline TEXT,
    priority TEXT,
    assigned_to TEXT,
    assignee_role TEXT,
    estimated_hours NUMERIC,
    complexity TEXT,
    cost_impact TEXT,
    dep_status TEXT DEFAULT 'Ready',
    blocked_by JSONB,
    unblocks JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_timestamp_roadmap_tasks ON public.roadmap_tasks;
CREATE TRIGGER set_timestamp_roadmap_tasks
BEFORE UPDATE ON public.roadmap_tasks
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- 6. Clean up old unused tables (Optional but recommended)
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.roadmaps CASCADE;
DROP TABLE IF EXISTS public.validations CASCADE;
DROP TABLE IF EXISTS public.startup_ideas CASCADE;

-- 7. Add phase/milestone columns to roadmap_tasks (run if columns are missing)
ALTER TABLE public.roadmap_tasks
    ADD COLUMN IF NOT EXISTS phase       TEXT,
    ADD COLUMN IF NOT EXISTS phase_goal  TEXT,
    ADD COLUMN IF NOT EXISTS milestone   BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_milestone ON public.roadmap_tasks(milestone);
CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_phase     ON public.roadmap_tasks(phase);
