const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in environment variables.");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
const SUBJECT_ID = '5a962027-bc0a-43dd-87c0-a32611229cc6'; // Medical chemistry

async function run() {
  console.log('Reading s-1-9.js from mobile app...');
  const mobileFilePath = path.join(__dirname, '../mobile-app/src/data/repository/course1/s-1-9.js');
  
  if (!fs.existsSync(mobileFilePath)) {
    console.error(`Mobile file not found at ${mobileFilePath}`);
    return;
  }
  
  const fileContent = fs.readFileSync(mobileFilePath, 'utf8');
  const startIdx = fileContent.indexOf('{');
  const endIdx = fileContent.lastIndexOf('}');
  
  if (startIdx === -1 || endIdx === -1) {
    console.error('Failed to parse JSON structure in mobile file.');
    return;
  }
  
  const jsonStr = fileContent.substring(startIdx, endIdx + 1);
  const data = JSON.parse(jsonStr);
  const topicsCount = Object.keys(data).length;
  console.log(`Parsed ${topicsCount} topics from local repository.`);

  // 1. Delete existing topics (this will cascade delete MCQs in Supabase)
  console.log(`Deleting existing topics for subject ${SUBJECT_ID}...`);
  const { error: deleteError } = await supabaseAdmin
    .from('topics')
    .delete()
    .eq('subject_id', SUBJECT_ID);

  if (deleteError) {
    console.error('Error deleting existing topics:', deleteError);
    return;
  }
  console.log('Successfully deleted existing topics (and cascaded MCQs).');

  // 2. Insert new topics and MCQs
  for (let i = 0; i < topicsCount; i++) {
    const localTopicKey = `t-s-1-9-${i}`;
    const topicData = data[localTopicKey];
    
    if (!topicData) {
      console.warn(`Local topic ${localTopicKey} not found in data!`);
      continue;
    }

    const topicTitle = `Topic ${i + 1}`;
    console.log(`Inserting ${topicTitle}...`);

    const { data: insertedTopic, error: insertTopicError } = await supabaseAdmin
      .from('topics')
      .insert({
        subject_id: SUBJECT_ID,
        title: topicTitle
      })
      .select('id')
      .single();

    if (insertTopicError) {
      console.error(`Error inserting ${topicTitle}:`, insertTopicError);
      continue;
    }

    const newTopicUuid = insertedTopic.id;
    console.log(`  -> Created topic with UUID: ${newTopicUuid}`);

    let allLocalMcqs = [];
    if (Array.isArray(topicData)) {
      allLocalMcqs = topicData.map(q => ({...q, taskType: 'test_question'}));
    } else {
      if (topicData.test) {
        allLocalMcqs.push(...topicData.test.map(q => ({...q, taskType: 'test_question'})));
      }
      if (topicData.situational) {
        allLocalMcqs.push(...topicData.situational.map(q => ({...q, taskType: 'situational_task'})));
      }
      if (topicData.test_question) {
        allLocalMcqs.push(...topicData.test_question.map(q => ({...q, taskType: 'test_question'})));
      }
      if (topicData.situational_task) {
        allLocalMcqs.push(...topicData.situational_task.map(q => ({...q, taskType: 'situational_task'})));
      }
    }

    // Insert MCQs for this topic
    const mcqsToInsert = allLocalMcqs.map((q) => {
      let correctIdx = q.correctIndex !== undefined ? q.correctIndex : 0;
      let explanation = q.explanation || '';
      
      return {
        topic_id: newTopicUuid,
        question: q.question,
        options: q.options,
        correct_index: correctIdx,
        task_type: q.taskType,
        explanation: explanation
      };
    });

    if (mcqsToInsert.length > 0) {
      const { error: mcqInsertError } = await supabaseAdmin
        .from('mcqs')
        .insert(mcqsToInsert);

      if (mcqInsertError) {
        console.error(`  -> Error inserting MCQs for ${topicTitle}:`, mcqInsertError);
      } else {
        console.log(`  -> Successfully inserted ${mcqsToInsert.length} MCQs for ${topicTitle}.`);
      }
    } else {
      console.log(`  -> No MCQs to insert for ${topicTitle}.`);
    }
  }

  console.log('Sync complete!');
}

run().catch(console.error);
