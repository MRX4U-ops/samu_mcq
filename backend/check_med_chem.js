const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: subject } = await supabase.from('subjects').select('id, title').ilike('title', 'Medical chemistry').single();
  console.log('Subject:', subject);
  const { data: topics } = await supabase.from('topics').select('id, title').eq('subject_id', subject.id).order('title');
  console.log('Topics:', topics);
}
run();
