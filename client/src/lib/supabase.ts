import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const authConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Missing environment variables. Auth features will not work.');
}

// Keep public pages renderable without credentials. The auth provider blocks
// sign-in and session requests when configuration is missing.
export const supabase = createClient(supabaseUrl || 'http://127.0.0.1:9', supabaseAnonKey || 'unconfigured', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
