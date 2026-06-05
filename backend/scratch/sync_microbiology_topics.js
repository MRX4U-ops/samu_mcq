const fs = require('fs');
const { supabaseAdmin } = require('../src/config/supabase');
require('dotenv').config();

function parseQuestions() {
  const content = fs.readFileSync('scratch/raw_new_questions.txt', 'utf8');
  const lines = content.split('\n').map(l => l.trim()).filter(l => l !== '');

  const questions = [];
  let i = 0;
  while (i < lines.length) {
    const questionText = lines[i];
    const options = [];
    let correctIndex = -1;

    for (let j = 1; j <= 4; j++) {
      let optionText = lines[i + j];
      if (optionText.startsWith('*')) {
        correctIndex = j - 1;
        optionText = optionText.substring(1).trim();
      }
      options.push(optionText);
    }

    // Rearrange options so that correct option is at index 0 (MCQs delivery contract)
    const rearrangedOptions = [...options];
    if (correctIndex !== 0 && correctIndex !== -1) {
      const correctText = rearrangedOptions[correctIndex];
      rearrangedOptions.splice(correctIndex, 1);
      rearrangedOptions.unshift(correctText);
    }

    questions.push({
      question: questionText,
      options: rearrangedOptions,
      correct_index: 0,
      explanation: `${rearrangedOptions[0]} is correct. This aligns with standard microbiology and immunology curriculum.`,
      task_type: 'test_question'
    });

    i += 5;
  }
  return questions;
}

async function main() {
  const subjectId = 'f83d725b-9deb-468f-98d3-19a46cb51306'; // Microbiology-2

  // 1. Parse questions
  console.log('📖 Parsing raw questions...');
  const questions = parseQuestions();
  console.log(`Parsed ${questions.length} questions.`);

  if (questions.length !== 120) {
    console.error(`❌ Expected exactly 120 questions, but parsed ${questions.length}`);
    process.exit(1);
  }

  // 2. Delete old topics
  console.log('🧹 Deleting old additional topics in database...');
  const { data: deletedTopics, error: delError } = await supabaseAdmin
    .from('topics')
    .delete()
    .eq('subject_id', subjectId)
    .ilike('title', 'Additional Topic %')
    .select('id, title');

  if (delError) {
    console.error('❌ Failed to delete old topics:', delError.message);
    process.exit(1);
  }
  console.log(`Successfully deleted ${deletedTopics ? deletedTopics.length : 0} topics.`);

  // 3. Create the 3 new topics
  console.log('🆕 Creating new topics...');
  const newTopicData = [
    { subject_id: subjectId, title: 'Added Question 1' },
    { subject_id: subjectId, title: 'Added Question 2' },
    { subject_id: subjectId, title: 'Added Question 3' }
  ];

  const { data: insertedTopics, error: insError } = await supabaseAdmin
    .from('topics')
    .insert(newTopicData)
    .select('id, title');

  if (insError || !insertedTopics || insertedTopics.length !== 3) {
    console.error('❌ Failed to insert new topics:', insError ? insError.message : 'Inserted count !== 3');
    process.exit(1);
  }

  console.log('Inserted new topics:');
  insertedTopics.forEach(t => console.log(`- "${t.title}" (ID: ${t.id})`));

  // Map topic titles to IDs
  const topicMap = {};
  insertedTopics.forEach(t => {
    topicMap[t.title] = t.id;
  });

  // 4. Distribute and prepare MCQ records to insert
  const records = [];
  questions.forEach((q, idx) => {
    let topicId;
    if (idx < 20) {
      topicId = topicMap['Added Question 1'];
    } else if (idx < 40) {
      topicId = topicMap['Added Question 2'];
    } else {
      topicId = topicMap['Added Question 3'];
    }

    records.push({
      topic_id: topicId,
      question: q.question,
      options: q.options,
      correct_index: q.correct_index,
      explanation: q.explanation,
      task_type: q.task_type
    });
  });

  console.log(`Prepared ${records.length} MCQ records. Inserting in chunks...`);

  // 5. Insert MCQ records in chunks
  const chunkSize = 40;
  for (let i = 0; i < records.length; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    const { error: chunkErr } = await supabaseAdmin
      .from('mcqs')
      .insert(chunk);

    if (chunkErr) {
      console.error(`❌ Error inserting MCQ chunk starting at index ${i}:`, chunkErr.message);
      process.exit(1);
    }
    console.log(`Inserted chunk of MCQs: indices ${i} to ${Math.min(i + chunkSize, records.length) - 1}`);
  }

  console.log('🎉 Database sync completed successfully!');
}

main().catch(err => {
  console.error('Unhandled error in script:', err);
  process.exit(1);
});
