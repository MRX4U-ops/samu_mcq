const path = require('path');
// Load .env explicitly from the current folder
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { supabaseAdmin } = require('./src/config/supabase');

async function run() {
  const topicId = '9bf609d1-e760-4529-a0e5-b30f8c7eef07'; // Clinical Anatomy Topic 5
  console.log('Querying MCQs for topic in DB:', topicId);
  
  const { data: mcqs, error } = await supabaseAdmin
    .from('mcqs')
    .select('id, question, options, correct_index, task_type')
    .eq('topic_id', topicId);

  if (error) {
    console.error('Error fetching MCQs:', error);
    return;
  }

  console.log(`Found ${mcqs.length} MCQs in DB:`);
  mcqs.forEach((q, i) => {
    console.log(`\nMCQ ${i + 1}:`);
    console.log(`ID: ${q.id}`);
    console.log(`Question: ${q.question}`);
    console.log(`Options Type: ${typeof q.options} | Array: ${Array.isArray(q.options)}`);
    console.log(`Options:`, q.options);
    console.log(`Correct Index: ${q.correct_index}`);
    console.log(`Task Type: ${q.task_type}`);
  });
}

run();
