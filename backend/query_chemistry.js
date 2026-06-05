const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function findSubjects() {
  const { data, error } = await supabase.from('subjects').select('id, title, course_id').ilike('title', '%chemistry%');
  if (error) console.error(error);
  console.log(data);
}

findSubjects();
