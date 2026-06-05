const { supabaseAdmin } = require('./src/config/supabase');
async function run() {
  const { data: subject } = await supabaseAdmin.from('subjects').select('id, title').ilike('title', 'Medical chemistry').single();
  console.log('Subject:', subject);
  const { data: topics } = await supabaseAdmin.from('topics').select('id, title').eq('subject_id', subject.id).order('title');
  console.log('Topics:', topics);
  process.exit(0);
}
run();
