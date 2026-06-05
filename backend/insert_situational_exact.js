const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const SUBJECT_ID = 'b3454f82-8aa2-49c0-b8c5-bb25bcaf9c10';

async function run() {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    console.error('Usage: node insert_situational_exact.js <TopicNumber> <Filename>');
    process.exit(1);
  }

  const topicNum = args[0];
  const filename = args[1];

  const { data: topics } = await supabase.from('topics').select('id, title').eq('subject_id', SUBJECT_ID);
  const topicMap = {};
  for (const t of topics) {
    const match = t.title.match(/Topic (\d+)/i);
    if (match) {
      topicMap[match[1]] = t.id;
    }
  }

  const topicId = topicMap[topicNum];
  if (!topicId) {
    console.error(`Topic ${topicNum} ID not found`);
    return;
  }

  const text = fs.readFileSync(path.join(__dirname, '../scratch', filename), 'utf-8');
  
  const lines = text.split('\n').map(l => l.trim()).filter(l => 
    l && 
    !l.startsWith('Situational Task') && 
    !l.startsWith('___')
  );
  const mcqsToInsert = [];
  let currentQuestion = null;
  let currentOptions = [];

  for (let j = 0; j < lines.length; j++) {
    const line = lines[j];
    
    // Check if line is a question (starts with number. or Question number. or Q number.)
    const qMatch = line.match(/^(?:Question\s*\d+|Q\s*\d+|\d+)\.?\s*(.*)/i);
    
    if (qMatch) {
      if (currentQuestion !== null) {
        mcqsToInsert.push({
          topic_id: topicId,
          task_type: 'situational_task',
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
      task_type: 'situational_task',
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

  console.log(`Found ${mcqsToInsert.length} situational tasks for Topic ${topicNum}.`);

  console.log(`Cleaning existing situational_task for Topic ${topicNum}...`);
  await supabase.from('mcqs').delete().eq('task_type', 'situational_task').eq('topic_id', topicId);

  console.log('Inserting exactly as provided...');
  const { error } = await supabase.from('mcqs').insert(mcqsToInsert);
  if (error) {
    console.error('Error inserting:', error);
  } else {
    console.log(`Successfully inserted topic ${topicNum}`);
  }
}

run().catch(console.error);
