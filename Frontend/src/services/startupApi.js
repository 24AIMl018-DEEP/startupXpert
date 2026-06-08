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
  const res = await fetch(`${ROADMAP_URL}/api/v1/roadmap`, {
    method:  'POST',
    headers,
    body:    JSON.stringify({ session_id: sessionId, team }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Roadmap API error: ${res.status}`);
  }
  return res.json();
}

// Fetch saved roadmap for a session from DB
export async function fetchSessionRoadmap(sessionId) {
  if (!sessionId) return null;
  const headers = await getAuthHeaders();
  try {
    const res = await fetch(`${ROADMAP_URL}/api/v1/roadmap/${sessionId}`, { headers });
    if (!res.ok) return null;
    return res.json();
  } catch {
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

// Sync a branch edit to DB
export async function patchBranch(branchId, fields) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${ROADMAP_URL}/api/v1/branches/${branchId}`, {
    method:  'PATCH',
    headers,
    body:    JSON.stringify(fields),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Branch update error: ${res.status}`);
  }
  return res.json();
}

// Sync a task edit to DB
export async function patchTask(taskId, fields) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${ROADMAP_URL}/api/v1/tasks/${taskId}`, {
    method:  'PATCH',
    headers,
    body:    JSON.stringify(fields),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Task update error: ${res.status}`);
  }
  return res.json();
}
