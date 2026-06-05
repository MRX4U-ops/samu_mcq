const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase URL or Service Role Key missing in backend/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Inserting/upserting TRH100 promocode...');
  const { data, error } = await supabase
    .from('promo_codes')
    .upsert({
      code: 'TRH100',
      discount_percentage: 100.00,
      usage_limit: 10000,
      is_active: true
    }, { onConflict: 'code' })
    .select();

  if (error) {
    console.error('❌ Error inserting TRH100:', error.message);
    process.exit(1);
  }

  console.log('✅ TRH100 promocode upserted successfully:', data);
}

run();
