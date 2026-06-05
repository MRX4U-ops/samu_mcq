const { supabaseAdmin } = require('../src/config/supabase');

async function main() {
  const { data: mcq, error } = await supabaseAdmin
    .from('mcqs')
    .select('*, topics(id, title, subject_id, subjects(id, title))')
    .eq('id', '9d826af9-7c7c-4dde-b864-3b01820619ee')
    .single();

  if (error) {
    console.error('Error:', error);
  } else {
    console.log(JSON.stringify(mcq, null, 2));
  }
}

main();
