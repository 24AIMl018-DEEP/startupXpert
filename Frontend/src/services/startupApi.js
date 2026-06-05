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
