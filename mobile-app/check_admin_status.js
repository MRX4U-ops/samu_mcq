const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kzvixaayzqgkdftfpdsi.supabase.co';
const supabaseAnonKey = 'sb_publishable_MrxugWrfei7zCHAPkr4KaA_ChQFj6mk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAdmin() {
  console.log("Fetching all profiles to test RLS...");
  const { data, error } = await supabase
    .from('profiles')
    .select('*');

  if (error) {
    console.error("Error fetching profiles:", error.message);
  } else if (data) {
    console.log("Profiles found:", data.length);
    if (data.length > 0) {
        data.forEach(p => console.log(`Email: ${p.email}, Status: ${p.status}`));
    }
  }
}

checkAdmin();
