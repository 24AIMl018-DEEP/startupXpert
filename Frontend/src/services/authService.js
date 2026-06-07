import { supabase } from "./supabase";

// Human-readable error mapper for Supabase auth errors
function parseAuthError(error) {
  const msg = error?.message?.toLowerCase() || '';

  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return 'Incorrect email or password. Please try again.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Please verify your email before logging in. Check your inbox for a confirmation link.';
  }
  if (msg.includes('user already registered') || msg.includes('already registered')) {
    return 'An account with this email already exists. Try logging in instead.';
  }
  if (msg.includes('password should be at least')) {
    return 'Password must be at least 6 characters long.';
  }
  if (msg.includes('unable to validate email address')) {
    return 'Please enter a valid email address.';
  }
  if (msg.includes('signup is disabled')) {
    return 'New registrations are currently disabled. Please contact support.';
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'Network error. Please check your internet connection and try again.';
  }

  // Fallback to original message
  return error.message || 'Something went wrong. Please try again.';
}

export async function signUpUser(fullName, email, password, role) {
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) throw new Error(parseAuthError(error));

  const user = data.user;
  if (user?.identities?.length > 0) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{ id: user.id, full_name: fullName, role }]);
    if (profileError) console.warn('Profile insert warning:', profileError.message);
  }

  return data;
}

export async function getCurrentUserId() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id || null;
}

export async function signInUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw new Error(parseAuthError(error));
  }

  // Upsert profile on every login — ensures profile row always exists
  const user = data.user;
  if (user?.id) {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert([{ id: user.id, full_name: user.user_metadata?.full_name || '' }], { onConflict: 'id' });
    if (profileError) console.warn('Profile upsert warning:', profileError.message);
  }

  return data;
}
