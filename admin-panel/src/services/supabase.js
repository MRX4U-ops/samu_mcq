import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kzvixaayzqgkdftfpdsi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_MrxugWrfei7zCHAPkr4KaA_ChQFj6mk';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6dml4YWF5enFna2RmdGZwZHNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY1MTkxNywiZXhwIjoyMDkzMjI3OTE3fQ.cJ5q789e5ODGM18nQ3ZLVPt9ckQtnNhQ613B-dAU3iY';

// Auth client — uses anon key, persists session for login
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Admin client — uses service role key, NO session persistence
// This bypasses RLS and can read and write all production tables regardless of logged-in user
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  }
});

export default supabase;
