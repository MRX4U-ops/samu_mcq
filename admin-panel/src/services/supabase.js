import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kzvixaayzqgkdftfpdsi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_MrxugWrfei7zCHAPkr4KaA_ChQFj6mk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
