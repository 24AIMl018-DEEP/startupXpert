-- 1. Enable Row Level Security (RLS) on all relevant tables
ALTER TABLE public.startup_input ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_output ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_phase ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_agent_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.critical_risks ENABLE ROW LEVEL SECURITY;

-- 2. Clean up any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read their own startup_input" ON public.startup_input;
DROP POLICY IF EXISTS "Users can read their own pipeline_output" ON public.pipeline_output;
DROP POLICY IF EXISTS "Users can read their own analysis_phase" ON public.analysis_phase;
DROP POLICY IF EXISTS "Users can read their own analysis_agent_results" ON public.analysis_agent_results;
DROP POLICY IF EXISTS "Users can read their own critical_risks" ON public.critical_risks;

-- 3. Create SELECT policies for frontend (authenticated users via ANON_KEY)
-- This allows the Dashboard to fetch the data directly using supabase-js
CREATE POLICY "Users can read their own startup_input"
ON public.startup_input FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own pipeline_output"
ON public.pipeline_output FOR SELECT
USING (session_id IN (SELECT id FROM public.startup_input WHERE user_id = auth.uid()));

CREATE POLICY "Users can read their own analysis_phase"
ON public.analysis_phase FOR SELECT
USING (session_id IN (SELECT id FROM public.startup_input WHERE user_id = auth.uid()));

CREATE POLICY "Users can read their own analysis_agent_results"
ON public.analysis_agent_results FOR SELECT
USING (analysis_phase_id IN (
    SELECT id FROM public.analysis_phase WHERE session_id IN (
        SELECT id FROM public.startup_input WHERE user_id = auth.uid()
    )
));

CREATE POLICY "Users can read their own critical_risks"
ON public.critical_risks FOR SELECT
USING (analysis_agent_result_id IN (
    SELECT id FROM public.analysis_agent_results WHERE analysis_phase_id IN (
        SELECT id FROM public.analysis_phase WHERE session_id IN (
            SELECT id FROM public.startup_input WHERE user_id = auth.uid()
        )
    )
));

-- 4. Create INSERT/UPDATE policies for startup_input (Frontend needs to insert initial data)
DROP POLICY IF EXISTS "Users can insert their own startup_input" ON public.startup_input;
CREATE POLICY "Users can insert their own startup_input"
ON public.startup_input FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own startup_input" ON public.startup_input;
CREATE POLICY "Users can update their own startup_input"
ON public.startup_input FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
