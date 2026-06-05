const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const SUBJECT_ID_1 = 'b3454f82-8aa2-49c0-b8c5-bb25bcaf9c10'; // Module 1 -> Will become "MEDICAL BIOLOGY WITH ELEMENTS OF ECOLOGY"
const SUBJECT_ID_2 = '2f8611d6-c4b2-4401-8a6d-66d37490ec54'; // Module 2 -> Will be deleted

async function run() {
  console.log('1. Renaming Module 1...');
  await supabase.from('subjects').update({ title: 'MEDICAL BIOLOGY WITH ELEMENTS OF ECOLOGY' }).eq('id', SUBJECT_ID_1);

  console.log('2. Deleting topics for Module 2...');
  await supabase.from('topics').delete().eq('subject_id', SUBJECT_ID_2);

  console.log('3. Deleting Module 2 subject...');
  await supabase.from('subjects').delete().eq('id', SUBJECT_ID_2);

  console.log('4. Deleting existing topics for Module 1...');
  await supabase.from('topics').delete().eq('subject_id', SUBJECT_ID_1);

  // Parse MCQs
  console.log('5. Parsing MCQs from text files...');
  const mcqsToInsert = [];
  
  for (let topicNum = 1; topicNum <= 24; topicNum++) {
    const filename = `biology_topic_${topicNum}.txt`;
    // Some files are named like biology_topics_22_23.txt - we will handle the ones that exist.
    let filePath = path.join(__dirname, '../scratch', filename);
    let altFilePath = null;
    
    // Check alternative names if file doesn't exist
    if (!fs.existsSync(filePath)) {
      if (topicNum === 2 || topicNum === 3) {
        altFilePath = path.join(__dirname, '../scratch', 'biology_topics_2_3.txt');
      } else if (topicNum === 8 || topicNum === 9) {
        altFilePath = path.join(__dirname, '../scratch', 'biology_topics_8_9.txt');
      } else if (topicNum === 22 || topicNum === 23) {
        altFilePath = path.join(__dirname, '../scratch', 'biology_topics_22_23.txt');
      }
      
      if (altFilePath && fs.existsSync(altFilePath)) {
        filePath = altFilePath;
      } else {
        console.log(`Topic ${topicNum} file not found. Skipping.`);
        continue;
      }
    }

    console.log(`Processing Topic ${topicNum} from ${path.basename(filePath)}`);
    
    // Create topic in Supabase
    const { data: topicData, error: topicError } = await supabase
      .from('topics')
      .insert({ title: `Topic ${topicNum}`, subject_id: SUBJECT_ID_1 })
      .select('id')
      .single();
      
    if (topicError) {
      console.error(`Error creating topic ${topicNum}:`, topicError);
      continue;
    }
    const topicId = topicData.id;

    // We only want to parse the corresponding topic if it's a combined file
    const text = fs.readFileSync(filePath, 'utf-8');
    const blocks = text.split(/\n\s*\n/);
    
    let currentParsedTopic = -1;
    let questionsForThisTopic = 0;

    for (const block of blocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length === 0) continue;

      const topicMatch = lines[0].match(/Mavzu\s*(\d+)/i) || lines[0].match(/Topic\s*(\d+)/i) || lines[0].match(/t\.s\.\/Mavzu\s*(\d+)/i) || lines[0].match(/№\s*(\d+)/);
      if (topicMatch) {
        currentParsedTopic = parseInt(topicMatch[1], 10);
        if (lines.length === 1) {
          continue;
        } else {
          lines.shift();
        }
      }

      if (currentParsedTopic === -1) {
        currentParsedTopic = topicNum; // Default to current topic if not specified
      }

      // If this file contains multiple topics (like 2 and 3), only insert the ones for the current loop topicNum
      if (currentParsedTopic === topicNum && lines.length >= 5) {
        const options = lines.slice(-4);
        const question = lines.slice(0, -4).join(' ');
        
        mcqsToInsert.push({
          topic_id: topicId,
          task_type: 'test_question',
          question: question,
          options: options,
          correct_index: 0,
          explanation: ''
        });
        questionsForThisTopic++;
      }
    }
    console.log(`  Found ${questionsForThisTopic} questions for Topic ${topicNum}`);
  }

  console.log(`6. Inserting ${mcqsToInsert.length} MCQs into Supabase...`);
  
  // Chunk insert to avoid payload too large
  const chunkSize = 100;
  for (let i = 0; i < mcqsToInsert.length; i += chunkSize) {
    const chunk = mcqsToInsert.slice(i, i + chunkSize);
    const { error } = await supabase.from('mcqs').insert(chunk);
    if (error) {
      console.error(`Error inserting chunk ${i}:`, error);
    } else {
      process.stdout.write('.');
    }
  }
  
  console.log('\nDone!');
}

run().catch(console.error);
