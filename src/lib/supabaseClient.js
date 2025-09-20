import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function assertEnv(name, val) {
  if (!val || typeof val !== 'string' || val.trim().length < 10) {
    const msg = `[Supabase] Missing or invalid env: ${name}`;
    if (import.meta.env.DEV) {
      console.error(msg);
      // Throwing here prevents a silent white screen later.
      throw new Error(msg);
    } else {
      // In prod, degrade gracefully to avoid blank page.
      console.error(msg);
    }
  }
}

assertEnv('VITE_SUPABASE_URL', supabaseUrl);
assertEnv('VITE_SUPABASE_ANON_KEY', supabaseAnonKey);

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : new Proxy({}, {
      get() {
        throw new Error('[Supabase] Client unavailable due to missing env.');
      }
    });