const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const SUBJECT_ID = 'b3454f82-8aa2-49c0-b8c5-bb25bcaf9c10';

async function run() {
  // Get all topics
  const { data: topics } = await supabase.from('topics').select('id, title').eq('subject_id', SUBJECT_ID);
  const topicMap = {};
  for (const t of topics) {
    const match = t.title.match(/Topic (\d+)/i);
    if (match) {
      topicMap[match[1]] = t.id;
    }
  }
  
  // Clean previously inserted situational tasks
  console.log('Cleaning previously inserted situational tasks...');
  const topicIds = Object.values(topicMap);
  if (topicIds.length > 0) {
    // Delete in chunks if needed, but in this case we only inserted 22 so we can just delete by topic_id IN (...)
    // Supabase JS doesn't support 'in' with a massive array if it's too big, but 24 is fine.
    await supabase.from('mcqs').delete().eq('task_type', 'situational_task').in('topic_id', topicIds);
  }

  const text = fs.readFileSync(path.join(__dirname, '../scratch/new_situational_tasks.txt'), 'utf-8');
  // Split by "Situational Task Topic X"
  const blocks = text.split(/Situational Task Topic (\d+)/i);
  
  const mcqsToInsert = [];
  
  for (let i = 1; i < blocks.length; i += 2) {
    const topicNum = blocks[i];
    const topicText = blocks[i + 1];
    const topicId = topicMap[topicNum];
    
    if (!topicId) {
      console.log(`Warning: No topic ID found for Topic ${topicNum}`);
      continue;
    }
    
    const lines = topicText.split('\n').map(l => l.trim()).filter(l => l && l !== 'Plaintext');
    let currentQuestion = null;
    let currentOptions = [];
    
    for (let j = 0; j < lines.length; j++) {
      const line = lines[j];
      
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
        currentQuestion = qMatch[1].trim(); 
        currentOptions = [];
      } else if (/^[a-d]\.\s*(.+)/i.test(line) || /^\*(?:\*|\\\*)*[a-d]\.\s*(.+)/i.test(line)) {
        currentOptions.push(line);
      } else if (currentQuestion !== null && currentOptions.length === 0) {
        currentQuestion += (currentQuestion ? ' ' : '') + line;
      }
    }
    
    // Add the last question
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
  }
  
  // Clean options: make the correct option first
  for (let q of mcqsToInsert) {
    let correctIdx = -1;
    let cleanOptions = [];
    for (let i = 0; i < q.options.length; i++) {
      const opt = q.options[i];
      if (opt.startsWith('*')) {
        correctIdx = i;
        cleanOptions.push(opt.replace(/^\*(?:\*|\\\*)*/, '').trim());
      } else {
        cleanOptions.push(opt.trim());
      }
    }
    
    if (correctIdx !== -1 && correctIdx !== 0) {
      const temp = cleanOptions[0];
      cleanOptions[0] = cleanOptions[correctIdx];
      cleanOptions[correctIdx] = temp;
    }
    
    // Make sure 'a.', 'b.', etc are stripped
    q.options = cleanOptions.map(opt => opt.replace(/^[a-d]\.\s*/i, '').trim());
  }
  
  console.log(`Inserting ${mcqsToInsert.length} situational MCQs...`);
  
  const chunkSize = 50;
  for (let i = 0; i < mcqsToInsert.length; i += chunkSize) {
    const chunk = mcqsToInsert.slice(i, i + chunkSize);
    const { error } = await supabase.from('mcqs').insert(chunk);
    if (error) {
      console.error('Error inserting:', error);
    } else {
      process.stdout.write('.');
    }
  }
  
  console.log('\nDone inserting situational tasks!');
}

run().catch(console.error);
