const { supabaseAdmin } = require('./src/config/supabase');

async function run() {
  const subjectId = 'c254b505-636d-4e25-8e7c-842db4beab27'; // Clinic anatomy
  console.log('Fetching topics for Clinic anatomy...');
  const { data: topics, error: topicsError } = await supabaseAdmin
    .from('topics')
    .select('id, title')
    .eq('subject_id', subjectId)
    .order('title');

  if (topicsError) {
    console.error('Error fetching topics:', topicsError);
    return;
  }

  console.log(`Found ${topics.length} topics:`);
  for (const topic of topics) {
    const { count, error: countError } = await supabaseAdmin
      .from('mcqs')
      .select('*', { count: 'exact', head: true })
      .eq('topic_id', topic.id);

    const { count: testCount } = await supabaseAdmin
      .from('mcqs')
      .select('*', { count: 'exact', head: true })
      .eq('topic_id', topic.id)
      .eq('task_type', 'test_question');

    const { count: sitCount } = await supabaseAdmin
      .from('mcqs')
      .select('*', { count: 'exact', head: true })
      .eq('topic_id', topic.id)
      .eq('task_type', 'situational_task');

    console.log(`Topic ID: ${topic.id} | Title: "${topic.title}" | Total MCQs: ${count} (Test: ${testCount}, Sit: ${sitCount})`);
  }
}

run();
