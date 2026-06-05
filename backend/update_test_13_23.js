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

  const text = fs.readFileSync(path.join(__dirname, '../scratch/new_test_questions_13_23.txt'), 'utf-8');
  const blocks = text.split(/Test Questions Topic (\d+)/i);
  
  const mcqsToInsert = [];
  const topicsToClear = new Set();
  
  for (let i = 1; i < blocks.length; i += 2) {
    const topicNum = blocks[i];
    const topicText = blocks[i + 1];
    const topicId = topicMap[topicNum];
    
    if (!topicId) {
      console.log(`Warning: No topic ID found for Topic ${topicNum}`);
      continue;
    }
    
    topicsToClear.add(topicId);
    
    const lines = topicText.split('\n').map(l => l.trim()).filter(l => l && l !== 'Plaintext' && !l.startsWith('___'));
    let currentQuestion = null;
    let currentOptions = [];
    
    for (let j = 0; j < lines.length; j++) {
      const line = lines[j];
      
      const qMatch = line.match(/^(?:Question\s*\d+|Q\s*\d+|\d+)\.?\s*(.*)/i);
      
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
        currentQuestion = qMatch[1].trim(); 
        currentOptions = [];
      } else if (/^[a-d]\.\s*(.+)/i.test(line) || /^\*(?:\*|\\\*)*[a-d]\.\s*(.+)/i.test(line)) {
        currentOptions.push(line);
      } else if (currentQuestion !== null && currentOptions.length === 0) {
        if (line !== 'Medical biology with elements of ecology') {
          currentQuestion += (currentQuestion ? ' ' : '') + line;
        }
      }
    }
    
    // Add the last question
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
    
    // Strip a. b. etc.
    q.options = cleanOptions.map(opt => opt.replace(/^[a-d]\.\s*/i, '').trim());
  }
  
  console.log(`Found ${mcqsToInsert.length} test questions for Topics 13-23.`);
  
  // Delete existing test questions for these topics
  console.log('Cleaning existing test_question for these topics...');
  const topicIdsArr = Array.from(topicsToClear);
  if (topicIdsArr.length > 0) {
    await supabase.from('mcqs').delete().eq('task_type', 'test_question').in('topic_id', topicIdsArr);
  }
  
  // Insert new ones
  console.log(`Inserting ${mcqsToInsert.length} new test questions...`);
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
  
  console.log('\nDone updating test questions Topics 13-23!');
}

run().catch(console.error);
