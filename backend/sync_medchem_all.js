const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const content = fs.readFileSync('../mobile-app/src/data/repository/course1/s-1-10.js', 'utf8');
  let objStr = content.replace('export const s_1_10 = ', '');
  let s_1_10;
  try { 
      eval('s_1_10 = ' + objStr); 
  } catch(e) { 
      console.log('Eval error', e); 
      process.exit(1); 
  }
  
  const subject1Id = '5a962027-bc0a-43dd-87c0-a32611229cc6'; // Module 1

  const { data: topics, error: tErr } = await supabase.from('topics').select('id, title').eq('subject_id', subject1Id);
  if (tErr || !topics) {
      console.log('Error fetching topics:', tErr);
      process.exit(1);
  }

  const topicMap = {};
  for(let t of topics) topicMap[t.title] = t.id;

  for (let i = 0; i <= 11; i++) {
    const key = 't-s-1-10-' + i;
    const questions = s_1_10[key];
    if (!questions) continue;

    const topicTitle = 'Topic ' + (i + 1);
    const topicId = topicMap[topicTitle];

    if (!topicId) {
      console.log('Skipping', topicTitle, 'because no ID found');
      continue;
    }

    console.log('Updating test questions for', topicTitle);

    // Delete existing test questions
    const { error: delErr } = await supabase.from('mcqs').delete().eq('topic_id', topicId).eq('task_type', 'test_question');
    if (delErr) {
        console.log('Error deleting:', delErr);
        continue;
    }

    // Insert new questions
    for (const q of questions) {
      // make sure explanation is set
      let exp = q.explanation;
      if (!exp && q.options[q.correctIndex]) {
        exp = "The correct answer is '" + q.options[q.correctIndex] + "'. This choice aligns with the established clinical curriculum.";
      }
      
      await supabase.from('mcqs').insert({
        topic_id: topicId,
        question: q.question,
        options: q.options,
        correct_index: q.correctIndex,
        explanation: exp,
        task_type: 'test_question'
      });
    }
    console.log('Completed', topicTitle);
  }
  console.log('All done!');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
