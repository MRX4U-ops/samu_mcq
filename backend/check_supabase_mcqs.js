const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const SUBJECT_ID = 'b3454f82-8aa2-49c0-b8c5-bb25bcaf9c10';

async function run() {
  const { data: topics, error: topicsError } = await supabase
    .from('topics')
    .select('id, title')
    .eq('subject_id', SUBJECT_ID)
    .order('title');

  if (topicsError) {
    console.error('Error fetching topics:', topicsError);
    return;
  }

  console.log(`Found ${topics.length} topics for Medical Biology:`);
  
  for (const t of topics) {
    const { data: mcqs, error: mcqsError } = await supabase
      .from('mcqs')
      .select('id, task_type, question, options')
      .eq('topic_id', t.id);

    if (mcqsError) {
      console.error(`Error fetching MCQs for topic ${t.title}:`, mcqsError);
      continue;
    }

    const testQs = mcqs.filter(m => m.task_type === 'test_question');
    const sitQs = mcqs.filter(m => m.task_type === 'situational_task' || m.task_type === 'situational');
    console.log(`- ${t.title} (ID: ${t.id}): ${testQs.length} test, ${sitQs.length} situational`);

    // Let's log any formatting issue we see in Supabase options
    mcqs.forEach((q, idx) => {
      if (!q.options) {
        console.log(`  [${t.title}] Q${idx} has null options!`);
        return;
      }
      if (q.options.length !== 4) {
        console.log(`  [${t.title}] Q${idx} has ${q.options.length} options!`);
        console.log(`    Question: ${q.question}`);
        console.log(`    Options:`, q.options);
      }
    });
  }
}

run().catch(console.error);
