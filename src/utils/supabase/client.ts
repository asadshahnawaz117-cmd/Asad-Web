import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://wvswfxiipcresycdhvtl.supabase.co';
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_JA1H9iqe31mvcumBJxWE-g_RJMkHW-g';

let clientInstance: SupabaseClient | null = null;

export const createClient = (): SupabaseClient => {
  if (!clientInstance) {
    clientInstance = createSupabaseClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return clientInstance;
};

export const supabase = createClient();
