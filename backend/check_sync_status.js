const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { supabaseAdmin } = require('./src/config/supabase');
const mobileRepo = require('../mobile-app/src/data/repository/course2/s-2-2.js');
const localQuestions = mobileRepo.s_2_2['t-s-2-2-4'];

async function run() {
  const topicId = '9bf609d1-e760-4529-a0e5-b30f8c7eef07';
  
  const { data: dbMcqs, error } = await supabaseAdmin
    .from('mcqs')
    .select('id, question, options, correct_index, task_type')
    .eq('topic_id', topicId)
    .eq('task_type', 'test_question')
    .order('id');

  if (error) {
    console.error('Error fetching DB:', error);
    return;
  }

  console.log(`DB Test Questions: ${dbMcqs.length}`);
  console.log(`Local Test Questions: ${localQuestions ? localQuestions.length : 0}`);

  console.log('\n--- FIRST 5 DB QUESTIONS ---');
  dbMcqs.slice(0, 5).forEach((q, i) => {
    console.log(`${i+1}. ${q.question}`);
    console.log(`Options: ${JSON.stringify(q.options)}`);
    console.log(`Correct: ${q.correct_index}`);
  });

  console.log('\n--- FIRST 5 LOCAL QUESTIONS ---');
  localQuestions.slice(0, 5).forEach((q, i) => {
    console.log(`${i+1}. ${q.question}`);
    console.log(`Options: ${JSON.stringify(q.options)}`);
    console.log(`Correct: ${q.correctIndex}`);
  });
}

run();
