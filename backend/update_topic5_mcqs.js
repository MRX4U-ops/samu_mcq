const fs = require('fs');
const path = require('path');
const { supabaseAdmin } = require('./src/config/supabase');

// Load questions from mobile-app repository to ensure absolute consistency
const mobileRepo = require('../mobile-app/src/data/repository/course2/s-2-2.js');
const newQuestions = mobileRepo.s_2_2['t-s-2-2-4'];

async function run() {
  console.log('Starting Topic 5 updates in Supabase...');

  if (!newQuestions || newQuestions.length !== 20) {
    console.error(`❌ Expected exactly 20 test questions in mobile repo, but found ${newQuestions ? newQuestions.length : 0}`);
    return;
  }

  // Topic ID for Clinical Anatomy Topic 5
  const topicId = '9bf609d1-e760-4529-a0e5-b30f8c7eef07';

  // Fetch existing test questions from database
  const { data: dbMcqs, error: fetchError } = await supabaseAdmin
    .from('mcqs')
    .select('id')
    .eq('topic_id', topicId)
    .eq('task_type', 'test_question')
    .order('id');

  if (fetchError) {
    console.error('❌ Error fetching from Supabase:', fetchError);
    return;
  }

  console.log(`Found ${dbMcqs.length} test question records in Supabase for Topic 5.`);

  if (dbMcqs.length === 20) {
    for (let i = 0; i < 20; i++) {
      const dbId = dbMcqs[i].id;
      const q = newQuestions[i];

      const { error: updateError } = await supabaseAdmin
        .from('mcqs')
        .update({
          question: q.question,
          options: q.options,
          correct_index: q.correctIndex,
          explanation: `Correct answer: ${q.options[q.correctIndex]}`
        })
        .eq('id', dbId);

      if (updateError) {
        console.error(`❌ Error updating MCQ ID ${dbId}:`, updateError);
      } else {
        console.log(`✅ Updated MCQ ${i + 1}/20: ID ${dbId}`);
      }
    }
    console.log('✅ Supabase Topic 5 update complete.');
  } else {
    console.error(`❌ Expected exactly 20 test question records in DB, but found ${dbMcqs.length}.`);
  }
}

run().catch(err => {
  console.error('Unexpected error:', err);
});
