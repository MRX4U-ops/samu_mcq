const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const SUBJECT_ID = 'b3454f82-8aa2-49c0-b8c5-bb25bcaf9c10';

async function run() {
  const { data: topics } = await supabase.from('topics').select('id, title').eq('subject_id', SUBJECT_ID);
  const topicMap = {};
  for (const t of topics) {
    const match = t.title.match(/Topic (\d+)/i);
    if (match) {
      topicMap[match[1]] = t.id;
    }
  }

  const topicId = topicMap['1'];
  if (!topicId) {
    console.error('Topic 1 ID not found');
    return;
  }

  const text = fs.readFileSync(path.join(__dirname, '../scratch/topic_1_exact.txt'), 'utf-8');
  
  const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('Test Questions'));
  const mcqsToInsert = [];
  let currentQuestion = null;
  let currentOptions = [];

  for (let j = 0; j < lines.length; j++) {
    const line = lines[j];
    
    // Check if line is a question (starts with number.)
    const qMatch = line.match(/^(\d+)\.\s*(.*)/i);
    
    if (qMatch) {
      if (currentQuestion !== null) {
        mcqsToInsert.push({
          topic_id: topicId,
          task_type: 'test_question',
          question: currentQuestion,
          options: currentOptions,
          correct_index: 0,
          explanation: ''
        });
      }
      currentQuestion = line; // keep the entire line exactly as provided
      currentOptions = [];
    } else {
      // It's an option. 
      currentOptions.push(line);
    }
  }

  // push last question
  if (currentQuestion !== null) {
    mcqsToInsert.push({
      topic_id: topicId,
      task_type: 'test_question',
      question: currentQuestion,
      options: currentOptions,
      correct_index: 0,
      explanation: ''
    });
  }

  // Reorder options so the one starting with * is first
  for (let q of mcqsToInsert) {
    let correctIdx = -1;
    for (let i = 0; i < q.options.length; i++) {
      if (q.options[i].startsWith('*')) {
        correctIdx = i;
        break;
      }
    }

    if (correctIdx !== -1 && correctIdx !== 0) {
      const temp = q.options[0];
      q.options[0] = q.options[correctIdx];
      q.options[correctIdx] = temp;
    }
  }

  console.log(`Found ${mcqsToInsert.length} test questions for Topic 1.`);

  console.log('Cleaning existing test_question for Topic 1...');
  await supabase.from('mcqs').delete().eq('task_type', 'test_question').eq('topic_id', topicId);

  console.log('Inserting exactly as provided...');
  const { error } = await supabase.from('mcqs').insert(mcqsToInsert);
  if (error) {
    console.error('Error inserting:', error);
  } else {
    console.log('Successfully inserted topic 1');
  }
}

run().catch(console.error);
