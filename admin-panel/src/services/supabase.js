import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kzvixaayzqgkdftfpdsi.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_MrxugWrfei7zCHAPkr4KaA_ChQFj6mk';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

export const supabaseAdmin = supabase;
export default supabase;
