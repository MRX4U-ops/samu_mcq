import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kzvixaayzqgkdftfpdsi.supabase.co';
const supabaseAnonKey = 'sb_publishable_MrxugWrfei7zCHAPkr4KaA_ChQFj6mk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
