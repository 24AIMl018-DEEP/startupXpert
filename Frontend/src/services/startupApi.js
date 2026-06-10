import { supabase } from './supabase';

const VALIDATION_URL = import.meta.env.VITE_VALIDATION_API_URL || 'http://localhost:8000';
const ROADMAP_URL    = import.meta.env.VITE_ROADMAP_API_URL    || 'http://localhost:8001';

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    ...(session?.access_token && { Authorization: `Bearer ${session.access_token}` }),
  };
}

// ── Validation Module ─────────────────────────────────────────────────────────

export async function submitValidation(startupPayload) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${VALIDATION_URL}/api/v1/validate`, {
    method:  'POST',
    headers,
    body:    JSON.stringify(startupPayload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Validation API error: ${res.status}`);
  }
  return res.json();
}

// ── DB as source of truth — no localStorage for logic ────────────────────────

// Check if user has completed validation + get their latest session_id
// Use this instead of localStorage to determine onboarding/routing
export async function checkUserHasValidation(userId) {
  if (!userId) return { hasValidation: false, sessionId: null, startupName: null };
  const headers = await getAuthHeaders();
  try {
    // Primary: check validation module's /latest endpoint
    const res = await fetch(`${VALIDATION_URL}/api/v1/sessions/${userId}/latest`, { headers });
    if (res.ok) {
      const data = await res.json();
      if (data.found) {
        return {
          hasValidation: true,
          sessionId:     data.session?.id || null,
          startupName:   data.session?.startup_name || null,
          score:         data.session?.aggregate_validation_score || null,
        };
      }
      return { hasValidation: false, sessionId: null, startupName: null };
    }
  } catch (err) {
    console.warn('[Validation] API unreachable, falling back to direct DB query.');
  }

  // Fallback: Query Supabase directly
  try {
    const { supabase } = await import('./supabase');
    const { data: sessions } = await supabase
      .from('startup_input')
      .select('id, startup_name')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (sessions && sessions.length > 0) {
      const ids = sessions.map(s => s.id);
      const { data: pipelines } = await supabase
        .from('pipeline_output')
        .select('session_id, aggregate_validation_score')
        .in('session_id', ids)
        .order('created_at', { ascending: false })
        .limit(1);

      if (pipelines && pipelines.length > 0) {
        const p = pipelines[0];
        const s = sessions.find(x => x.id === p.session_id);
        return {
          hasValidation: true,
          sessionId:     p.session_id,
          startupName:   s?.startup_name || null,
          score:         p.aggregate_validation_score || null,
        };
      }
    }
  } catch (dbErr) {
    console.error('[Validation] DB Fallback failed:', dbErr);
  }

  return { hasValidation: false, sessionId: null, startupName: null };
}

// Fetch all sessions for a user (for dashboard history display)
export async function fetchUserSessions(userId) {
  if (!userId) return [];
  const headers = await getAuthHeaders();
  try {
    const res = await fetch(`${VALIDATION_URL}/api/v1/sessions/${userId}`, { headers });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('[Validation] API unreachable for history, falling back to direct DB query.');
  }

  // Fallback: Query Supabase directly
  try {
    const { supabase } = await import('./supabase');
    const { data: sessions } = await supabase
      .from('startup_input')
      .select('id, created_at, startup_name, startup_domain, current_startup_stage')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return sessions || [];
  } catch (dbErr) {
    console.error('[Validation] History DB Fallback failed:', dbErr);
    return [];
  }
}

// Get latest validated session from validation module (for login redirect)
export async function fetchLatestSession(userId) {
  const r = await checkUserHasValidation(userId);
  return r.hasValidation ? { id: r.sessionId, startup_name: r.startupName } : null;
}

// ── Roadmap Module ────────────────────────────────────────────────────────────

export async function submitRoadmap(sessionId, team = []) {
  const headers = await getAuthHeaders();
  // Railway HTTP proxy enforces a ~100s hard timeout — use AbortController
  // so we can detect the cutoff and fall back to polling DB instead of hanging.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 95_000);
  try {
    const res = await fetch(`${ROADMAP_URL}/api/v1/roadmap`, {
      method:  'POST',
      headers,
      body:    JSON.stringify({ session_id: sessionId, team }),
      signal:  controller.signal,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || `Roadmap API error: ${res.status}`);
    }
    return res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      // Backend is still running — poll DB until roadmap appears (max ~3min)
      throw new Error('ROADMAP_TIMEOUT');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Fetch saved roadmap for a session from DB
export async function fetchSessionRoadmap(sessionId) {
  if (!sessionId) return null;
  const headers = await getAuthHeaders();
  try {
    const res = await fetch(`${ROADMAP_URL}/api/v1/roadmap/${sessionId}`, { headers });
    if (res.ok) return await res.json();
  } catch {
    console.warn('[Roadmap] API unreachable, falling back to direct DB query.');
  }

  // Fallback: Query Supabase directly
  try {
    const { supabase } = await import('./supabase');
    
    // 1. Get profiler
    const { data: profilerData } = await supabase
      .from('roadmap_profiler')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
      
    // 2. Get branches
    const { data: branchesData } = await supabase
      .from('roadmap_branches')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
      
    if (!branchesData || branchesData.length === 0) return null;

    // 3. Get tasks for each branch
    const branchIds = branchesData.map(b => b.id);
    const { data: tasksData } = await supabase
      .from('roadmap_tasks')
      .select('*')
      .in('branch_id', branchIds);
      
    const branchesWithTasks = branchesData.map(branch => ({
      ...branch,
      tasks: (tasksData || []).filter(t => t.branch_id === branch.id)
    }));

    // 4. Get pipeline output
    const { data: pipelineData } = await supabase
      .from('pipeline_output')
      .select('aggregate_validation_score, status')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      session_id: sessionId,
      profiler: profilerData || {},
      branches: branchesWithTasks,
      pipeline_output: pipelineData || {}
    };
  } catch (dbErr) {
    console.error('[Roadmap] DB Fallback failed:', dbErr);
    return null;
  }
}

// Get latest validated session from roadmap module DB (DB source of truth for roadmap)
export async function fetchLatestValidatedSession(userId) {
  if (!userId) return null;
  const headers = await getAuthHeaders();
  try {
    const res = await fetch(`${ROADMAP_URL}/api/v1/sessions/${userId}/latest`, { headers });
    if (res.ok) {
      const data = await res.json();
      return data.found ? data.session : null;
    }
  } catch (err) {
    console.warn('[Roadmap] API unreachable, falling back to direct DB query.');
  }

  // Fallback: Query Supabase directly
  try {
    const { supabase } = await import('./supabase');
    const { data: sessions } = await supabase
      .from('startup_input')
      .select('id, created_at, startup_name, startup_domain, current_startup_stage')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (sessions && sessions.length > 0) {
      const ids = sessions.map(s => s.id);
      const { data: pipelines } = await supabase
        .from('pipeline_output')
        .select('session_id, aggregate_validation_score, status, created_at')
        .in('session_id', ids)
        .order('created_at', { ascending: false })
        .limit(1);

      if (pipelines && pipelines.length > 0) {
        const po = pipelines[0];
        const s = sessions.find(x => x.id === po.session_id);
        if (s) {
          return {
            ...s,
            aggregate_validation_score: po.aggregate_validation_score,
            status: po.status
          };
        }
      }
    }
  } catch (dbErr) {
    console.error('[Roadmap] DB Fallback failed:', dbErr);
  }

  return null;
}

// Fetch all validated sessions (for dashboard list)
export async function fetchValidatedSessions(userId) {
  if (!userId) return [];
  const headers = await getAuthHeaders();
  try {
    const res = await fetch(`${ROADMAP_URL}/api/v1/sessions/${userId}`, { headers });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// Fetch ALL roadmaps for a user (for history view) — pure Supabase, no API
export async function fetchAllUserRoadmaps(userId) {
  if (!userId) return [];
  try {
    // 1. All startup sessions for this user
    const { data: sessions } = await supabase
      .from('startup_input')
      .select('id, startup_name, startup_domain, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!sessions?.length) return [];

    // 2. Which ones have a roadmap profiler (= roadmap was generated)
    const sessionIds = sessions.map(s => s.id);
    const { data: profilers } = await supabase
      .from('roadmap_profiler')
      .select('session_id, startup_name, business_type, created_at')
      .in('session_id', sessionIds)
      .order('created_at', { ascending: false });

    if (!profilers?.length) return [];

    // 3. Return merged list — only sessions that have a roadmap
    return profilers.map(p => {
      const session = sessions.find(s => s.id === p.session_id);
      return {
        sessionId:   p.session_id,
        startupName: p.startup_name || session?.startup_name || 'Unnamed',
        domain:      session?.startup_domain || '',
        createdAt:   p.created_at,
      };
    });
  } catch (err) {
    console.error('[fetchAllUserRoadmaps] failed:', err);
    return [];
  }
}

// Sync a branch edit to DB
export async function patchBranch(branchId, fields) {
  const headers = await getAuthHeaders();
  try {
    const res = await fetch(`${ROADMAP_URL}/api/v1/branches/${branchId}`, {
      method:  'PATCH',
      headers,
      body:    JSON.stringify(fields),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('[Roadmap] API unreachable for patchBranch, falling back to direct DB query.');
  }

  try {
    const { supabase } = await import('./supabase');
    const { data, error } = await supabase.from('roadmap_branches').update(fields).eq('id', branchId).select().single();
    if (error) throw error;
    return { status: 'updated', branch: data };
  } catch (dbErr) {
    console.error('[Roadmap] DB Fallback patchBranch failed:', dbErr);
    throw dbErr;
  }
}

// ── Post-login DB restoration ─────────────────────────────────────────────────

/**
 * Restore full analysis data from Supabase after a fresh login.
 * Reconstructs fullAnalysisData, analysisScores, and startupDetails
 * from the DB tables so tabs (Market/Competition/Risks/Intelligence/Pitch)
 * show correct data even without sessionStorage.
 */
export async function fetchLatestAnalysis(userId) {
  if (!userId) return null;
  try {
    const { supabase } = await import('./supabase');

    // 1. Latest startup_input for this user
    const { data: session } = await supabase
      .from('startup_input')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!session) return null;
    const sessionId = session.id;

    // 2. pipeline_output — confirm validation completed
    const { data: po } = await supabase
      .from('pipeline_output')
      .select('aggregate_validation_score, status')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!po) return null;

    // 3. analysis_phase
    const { data: ap } = await supabase
      .from('analysis_phase')
      .select('id, aggregate_score')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!ap) return null;

    // 4. Per-agent results
    const { data: agentRows } = await supabase
      .from('analysis_agent_results')
      .select(
        'agent, score, verdict, summary,' +
        'strengths, weaknesses, recommendations, risks,' +
        'tam_signal, demand_signals, timing_assessment,' +
        'key_competitors, competitive_gaps, differentiation_strength,' +
        'overall_risk_level, usp_statement, innovation_factors,' +
        'defensibility, differentiation_vs_competitors'
      )
      .eq('analysis_phase_id', ap.id);

    if (!agentRows || agentRows.length === 0) return null;

    const byAgent = {};
    agentRows.forEach(r => { byAgent[r.agent] = r; });

    const fe  = byAgent['feasibility_analysis'] || {};
    const mo  = byAgent['market_opportunity']   || {};
    const co  = byAgent['competition_analysis'] || {};
    const ri  = byAgent['risk_analysis']        || {};
    const inn = byAgent['innovation_usp']       || {};

    // 5. Pitch phase
    const { data: pitchData } = await supabase
      .from('pitch_phase')
      .select('startup_name, pitch_text, pitch_length, indexed_chunks')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Reconstruct fullAnalysisData matching backend PipelineState structure
    const fullAnalysisData = {
      session_id:                 sessionId,
      status:                     po.status || 'success',
      startup_name:               session.startup_name,
      aggregate_validation_score: po.aggregate_validation_score,
      analysis_phase_state: {
        total_agents:      agentRows.length,
        successful_agents: agentRows.filter(r => r.score != null).length,
        failed_agents:     agentRows.filter(r => r.score == null).length,
        aggregate_score:   ap.aggregate_score || po.aggregate_validation_score || 0,
        feasibility:        fe,
        market_opportunity: mo,
        competition:        co,
        risk:               ri,
        innovation_usp:     inn,
      },
      query_phase_state: {},
      pitch_state:        pitchData || {},
    };

    // Reconstruct analysisScores (mirrors _mapAgent in StartupContext)
    const mapAgent = (agent) => {
      if (!agent || agent.score == null) return { score: 0, status: 'Low', details: 'Data unavailable.' };
      const score  = Math.round(agent.score || 0);
      const status = score >= 70 ? 'High' : score >= 45 ? 'Medium' : 'Low';
      return { score, status, details: agent.summary || agent.verdict || '' };
    };

    const analysisScores = {
      feasibility:        mapAgent(fe),
      marketDemand:       mapAgent(mo),
      competitorPresence: mapAgent(co),
      riskLevel:          mapAgent(ri),
      innovationLevel:    mapAgent(inn),
      targetAudienceFit:  mapAgent(fe),
      problemSolutionFit: mapAgent(fe),
      revenuePotential:   mapAgent(mo),
      scalability:        mapAgent(fe),
    };

    // Reconstruct startupDetails (frontend camelCase ↔ DB snake_case)
    const startupDetails = {
      startupName:         session.startup_name                      || '',
      startupDomain:       session.startup_domain                    || '',
      problemStatement:    session.problem_statement                 || '',
      startupDescription:  session.startup_description               || '',
      targetAudience:      session.target_audience                   || '',
      geographicMarket:    session.geographic_market                 || '',
      existingCompetitors: session.existing_competitors              || '',
      revenueModel:        session.revenue_model                     || '',
      estimatedPricing:    session.estimated_pricing                 || '',
      availableFunding:    session.available_funding                 || '',
      monthlyBurnCapacity: session.monthly_burn_capacity             || '',
      platformType:        session.platform_type                     || [],
      techComplexity:      session.technology_complexity             || '',
      mvpTimeline:         session.mvp_timeline                      || '',
      scalabilityGoal:     session.scalability_goal                  || '',
      acquisitionStrategy: session.customer_acquisition_strategy     || '',
      startupStage:        session.current_startup_stage             || '',
    };

    console.log(`[DB Restore] Restored analysis for session=${sessionId} score=${po.aggregate_validation_score}`);
    return { fullAnalysisData, analysisScores, startupDetails, sessionId };
  } catch (err) {
    console.error('[API] fetchLatestAnalysis failed:', err);
    return null;
  }
}


// Sync a task edit to DB
export async function patchTask(taskId, fields) {
  const headers = await getAuthHeaders();
  try {
    const res = await fetch(`${ROADMAP_URL}/api/v1/tasks/${taskId}`, {
      method:  'PATCH',
      headers,
      body:    JSON.stringify(fields),
    });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn('[Roadmap] API unreachable for patchTask, falling back to direct DB query.');
  }

  try {
    const { supabase } = await import('./supabase');
    const { data, error } = await supabase.from('roadmap_tasks').update(fields).eq('id', taskId).select().single();
    if (error) throw error;
    return { status: 'updated', task: data };
  } catch (dbErr) {
    console.error('[Roadmap] DB Fallback patchTask failed:', dbErr);
    throw dbErr;
  }
}

// ── Organization APIs ──────────────────────────────────────────────────────────

// Create a new organization (called by founder on register)
export async function createOrganization(name, domain, userId) {
  const { data, error } = await supabase
    .from('organizations')
    .insert({ name, domain: domain || null, created_by: userId })
    .select()
    .single();
  if (error) throw error;
  // Auto-add founder as org_members with role 'founder'
  await supabase.from('org_members').insert({
    org_id: data.id, user_id: userId, role: 'founder',
  });
  return data;
}

// Get org + members for the logged-in user
export async function getMyOrganization(userId) {
  if (!userId) return null;

  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${ROADMAP_URL}/api/v1/organizations/my-org/${userId}`, { headers });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[Roadmap API] getMyOrganization backend error, falling back to direct Supabase query:', err);
  }

  const { data: membership } = await supabase
    .from('org_members')
    .select('org_id, role, full_name, job_title, skills')
    .eq('user_id', userId)
    .order('joined_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!membership) return null;

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, domain, invite_code')
    .eq('id', membership.org_id)
    .single();

  const { data: members } = await supabase
    .from('org_members')
    .select('id, user_id, role, full_name, job_title, skills, joined_at')
    .eq('org_id', membership.org_id)
    .order('joined_at', { ascending: true });

  return { org, myRole: membership.role, members: (members || []).map(m => ({ ...m, email: '' })) };
}

// Add or invite member to organization using the backend API
export async function addOrganizationMember(orgId, email, fullName, role, skills) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${ROADMAP_URL}/api/v1/organizations/members`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      org_id: orgId,
      email,
      full_name: fullName,
      role,
      skills: Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()).filter(Boolean),
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to add member: ${res.status}`);
  }
  return res.json();
}

// Join org via invite code
export async function joinOrganization(inviteCode, userId, fullName, jobTitle, skills) {
  const { data: org, error } = await supabase
    .from('organizations')
    .select('id')
    .eq('invite_code', inviteCode)
    .single();
  if (error || !org) throw new Error('Invalid invite code.');

  const { error: joinErr } = await supabase.from('org_members').insert({
    org_id: org.id, user_id: userId, role: 'member',
    full_name: fullName, job_title: jobTitle,
    skills: skills || [],
  });
  if (joinErr) throw new Error(joinErr.message);
  return org;
}

// Get tasks assigned to a specific org member (for member dashboard)
export async function getMemberTasks(userId) {
  if (!userId) return [];
  // Get the org_member id
  const { data: member } = await supabase
    .from('org_members')
    .select('id, org_id')
    .eq('user_id', userId)
    .maybeSingle();
  if (!member) return [];

  const { data: tasks } = await supabase
    .from('roadmap_tasks')
    .select(`
      id, task_id, title, description, timeline, priority,
      dep_status, complexity, cost_impact, completed_at, completion_note,
      branch_id,
      roadmap_branches ( branch, session_id,
        roadmap_profiler ( startup_name )
      )
    `)
    .eq('assigned_member_id', member.id)
    .order('created_at', { ascending: true });

  return (tasks || []).map(t => ({
    id: t.id,
    taskId: t.task_id,
    title: t.title,
    description: t.description,
    timeline: t.timeline,
    priority: t.priority,
    status: t.dep_status || 'Pending',
    complexity: t.complexity,
    costImpact: t.cost_impact,
    completedAt: t.completed_at,
    completionNote: t.completion_note,
    branch: t.roadmap_branches?.branch?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    startupName: t.roadmap_branches?.roadmap_profiler?.startup_name || 'Startup',
    sessionId: t.roadmap_branches?.session_id,
  }));
}

// Member updates their task status
export async function updateTaskStatus(taskId, depStatus, completionNote) {
  const fields = { dep_status: depStatus };
  if (depStatus === 'Done') fields.completed_at = new Date().toISOString();
  if (completionNote) fields.completion_note = completionNote;
  const { error } = await supabase.from('roadmap_tasks').update(fields).eq('id', taskId);
  if (error) throw error;
}

// Founder assigns task to an org member
export async function assignTaskToMember(taskId, memberId, memberName, memberRole) {
  const { error } = await supabase
    .from('roadmap_tasks')
    .update({ assigned_member_id: memberId, assigned_to: memberName, assignee_role: memberRole })
    .eq('id', taskId);
  if (error) throw error;
}

// Delete task from DB
export async function deleteTask(taskId) {
  const { error } = await supabase
    .from('roadmap_tasks')
    .delete()
    .eq('id', taskId);
  if (error) throw error;
}
