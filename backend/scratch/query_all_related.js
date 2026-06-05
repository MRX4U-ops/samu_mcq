const { supabaseAdmin } = require('../src/config/supabase');

async function main() {
  const { data: mcqs, error } = await supabaseAdmin
    .from('mcqs')
    .select('*, topics(id, title, subject_id, subjects(id, title))')
    .or('question.ilike.%meningitidis%,explanation.ilike.%meningitidis%');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`Found ${mcqs.length} records:`);
    mcqs.forEach((mcq, index) => {
      console.log(`\n--- #${index + 1} ---`);
      console.log(`ID: ${mcq.id}`);
      console.log(`Subject: ${mcq.topics?.subjects?.title} (${mcq.topics?.subjects?.id})`);
      console.log(`Topic: ${mcq.topics?.title} (${mcq.topics?.id})`);
      console.log(`Task Type: ${mcq.task_type}`);
      console.log(`Question: "${mcq.question}"`);
      console.log(`Options:`, mcq.options);
      console.log(`Correct Index: ${mcq.correct_index}`);
    });
  }
}

main();
