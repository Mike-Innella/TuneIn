import { supabase } from './supabaseClient';

export async function signInWithEmail(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin }
  });
  if (error) throw error;
}

export async function signInWithGoogle() {
  const siteUrl =
    import.meta.env.VITE_SITE_URL ??
    (typeof window !== 'undefined' ? window.location.origin : '');

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/app`,
      queryParams: { access_type: 'offline', prompt: 'consent' }
    }
  });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
}