-- Enable RLS on roadmap tables (in case it's not already enabled)
ALTER TABLE public.roadmap_profiler ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_tasks ENABLE ROW LEVEL SECURITY;

-- Clean up any existing policies
DROP POLICY IF EXISTS "Users can read their own roadmap_profiler" ON public.roadmap_profiler;
DROP POLICY IF EXISTS "Users can read their own roadmap_branches" ON public.roadmap_branches;
DROP POLICY IF EXISTS "Users can read their own roadmap_tasks" ON public.roadmap_tasks;

-- Create SELECT policies for frontend (authenticated users via ANON_KEY)
CREATE POLICY "Users can read their own roadmap_profiler"
ON public.roadmap_profiler FOR SELECT
USING (session_id IN (SELECT id FROM public.startup_input WHERE user_id = auth.uid()));

CREATE POLICY "Users can read their own roadmap_branches"
ON public.roadmap_branches FOR SELECT
USING (session_id IN (SELECT id FROM public.startup_input WHERE user_id = auth.uid()));

CREATE POLICY "Users can read their own roadmap_tasks"
ON public.roadmap_tasks FOR SELECT
USING (branch_id IN (
    SELECT id FROM public.roadmap_branches WHERE session_id IN (
        SELECT id FROM public.startup_input WHERE user_id = auth.uid()
    )
));

-- Create UPDATE policies for frontend (for toggling tasks and updating branches)
DROP POLICY IF EXISTS "Users can update their own roadmap_branches" ON public.roadmap_branches;
CREATE POLICY "Users can update their own roadmap_branches"
ON public.roadmap_branches FOR UPDATE
USING (session_id IN (SELECT id FROM public.startup_input WHERE user_id = auth.uid()))
WITH CHECK (session_id IN (SELECT id FROM public.startup_input WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their own roadmap_tasks" ON public.roadmap_tasks;
CREATE POLICY "Users can update their own roadmap_tasks"
ON public.roadmap_tasks FOR UPDATE
USING (branch_id IN (
    SELECT id FROM public.roadmap_branches WHERE session_id IN (
        SELECT id FROM public.startup_input WHERE user_id = auth.uid()
    )
))
WITH CHECK (branch_id IN (
    SELECT id FROM public.roadmap_branches WHERE session_id IN (
        SELECT id FROM public.startup_input WHERE user_id = auth.uid()
    )
));
