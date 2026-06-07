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
  return res.json(); // returns PipelineState with session_id
}

// Fetch all sessions belonging to a user (validation module)
export async function fetchUserSessions(userId) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${VALIDATION_URL}/api/v1/sessions/${userId}`, { headers });
  if (!res.ok) return [];
  return res.json();
}

// Check if user already has a completed validation session (used on login to skip onboarding)
export async function fetchLatestSession(userId) {
  const headers = await getAuthHeaders();
  try {
    const res = await fetch(`${VALIDATION_URL}/api/v1/sessions/${userId}/latest`, { headers });
    if (!res.ok) return null;
    const data = await res.json();
    return data.found ? data.session : null;
  } catch {
    return null;
  }
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
  return res.json(); // returns RoadmapPipelineState
}

// Fetch saved roadmap for a session from DB
export async function fetchSessionRoadmap(sessionId) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${ROADMAP_URL}/api/v1/roadmap/${sessionId}`, { headers });
  if (!res.ok) return null;
  return res.json();
}

// Fetch all user sessions with validation status (roadmap module)
export async function fetchValidatedSessions(userId) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${ROADMAP_URL}/api/v1/sessions/${userId}`, { headers });
  if (!res.ok) return [];
  return res.json();
}

// Get latest validated session from roadmap module DB
export async function fetchLatestValidatedSession(userId) {
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

