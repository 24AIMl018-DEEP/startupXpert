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
    }
    // Fallback: check profiles.last_session_id in Supabase directly
    const { supabase } = await import('./supabase');
    const { data: profile } = await supabase
      .from('profiles')
      .select('last_session_id, last_startup_name')
      .eq('id', userId)
      .single();
    if (profile?.last_session_id) {
      return {
        hasValidation: true,
        sessionId:     profile.last_session_id,
        startupName:   profile.last_startup_name || null,
        score:         null,
      };
    }
    return { hasValidation: false, sessionId: null, startupName: null };
  } catch {
    return { hasValidation: false, sessionId: null, startupName: null };
  }
}

// Fetch all sessions for a user (for dashboard history display)
export async function fetchUserSessions(userId) {
  if (!userId) return [];
  const headers = await getAuthHeaders();
  try {
    const res = await fetch(`${VALIDATION_URL}/api/v1/sessions/${userId}`, { headers });
    if (!res.ok) return [];
    return res.json();
  } catch {
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
    if (!res.ok) return null;
    const data = await res.json();
    return data.found ? data.session : null;
  } catch {
    return null;
  }
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
