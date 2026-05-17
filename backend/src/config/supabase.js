const { createClient } = require('@supabase/supabase-js');
const env = require('./env');

const supabaseAnonKey = 'sb_publishable_MrxugWrfei7zCHAPkr4KaA_ChQFj6mk';
const supabaseUrl = process.env.SUPABASE_URL || 'https://kzvixaayzqgkdftfpdsi.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin;

if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
} else {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY missing. Falling back to ANON_KEY (RLS will apply).');
  supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

module.exports = { supabaseAdmin };
