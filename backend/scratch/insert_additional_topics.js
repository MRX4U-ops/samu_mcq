const fs = require('fs');
const path = require('path');
const { supabaseAdmin } = require('../src/config/supabase');

async function main() {
  const notMatchesPath = 'c:/samu_mcq/backend/scratch/not_matches.json';
  if (!fs.existsSync(notMatchesPath)) {
    console.error(`❌ File not found: ${notMatchesPath}`);
    process.exit(1);
  }

  const mcqs = JSON.parse(fs.readFileSync(notMatchesPath, 'utf8'));
  console.log(`Loaded ${mcqs.length} MCQs from ${notMatchesPath}`);

  if (mcqs.length !== 429) {
    console.error(`❌ Expected exactly 429 MCQs, but found ${mcqs.length}.`);
    process.exit(1);
  }

  const subjectId = 'f83d725b-9deb-468f-98d3-19a46cb51306'; // Microbiology-2

  // 1. Verify subject exists
  const { data: subject, error: sError } = await supabaseAdmin
    .from('subjects')
    .select('id, title')
    .eq('id', subjectId)
    .single();

  if (sError || !subject) {
    console.error('❌ Failed to fetch subject or subject does not exist:', sError);
    process.exit(1);
  }
  console.log(`Verified subject: ${subject.title} (${subject.id})`);

  // 2. Fetch or create the 8 topics
  const topicTitles = Array.from({ length: 8 }, (_, i) => `Additional Topic ${i + 1}`);
  const topicMap = {}; // Title -> ID

  for (const title of topicTitles) {
    // Try to find
    const { data: existing, error: fError } = await supabaseAdmin
      .from('topics')
      .select('id')
      .eq('subject_id', subjectId)
      .eq('title', title)
      .maybeSingle();

    if (fError) {
      console.error(`Error checking topic "${title}":`, fError);
      process.exit(1);
    }

    if (existing) {
      console.log(`Topic "${title}" already exists with ID: ${existing.id}`);
      topicMap[title] = existing.id;
    } else {
      // Create
      const { data: created, error: cError } = await supabaseAdmin
        .from('topics')
        .insert({ subject_id: subjectId, title: title })
        .select('id')
        .single();

      if (cError || !created) {
        console.error(`❌ Failed to create topic "${title}":`, cError);
        process.exit(1);
      }
      console.log(`Created topic "${title}" with ID: ${created.id}`);
      topicMap[title] = created.id;
    }
  }

  // 3. Clear existing MCQs from these 8 topics to prevent duplicates
  const topicIds = Object.values(topicMap);
  console.log('Clearing existing MCQs for these topics to ensure clean insert...');
  const { error: dError } = await supabaseAdmin
    .from('mcqs')
    .delete()
    .in('topic_id', topicIds);

  if (dError) {
    console.error('❌ Failed to clear existing MCQs:', dError);
    process.exit(1);
  }
  console.log('Cleared existing MCQs successfully.');

  // 4. Distribute the 429 MCQs
  // Topics 1-5: 54 questions each
  // Topics 6-8: 53 questions each
  const distribution = [54, 54, 54, 54, 54, 53, 53, 53];
  let mcqIndex = 0;

  const recordsToInsert = [];

  for (let tIdx = 0; tIdx < 8; tIdx++) {
    const title = topicTitles[tIdx];
    const topicId = topicMap[title];
    const count = distribution[tIdx];

    console.log(`Mapping ${count} questions to "${title}"...`);

    for (let k = 0; k < count; k++) {
      if (mcqIndex >= mcqs.length) {
        console.error('❌ MCQ index out of range during distribution!');
        process.exit(1);
      }

      const q = mcqs[mcqIndex++];
      // options[0] is the correct answer
      const correctOptionText = q.options[0];
      const explanation = `${correctOptionText} is correct. This aligns with standard microbiology and immunology curriculum.`;

      recordsToInsert.push({
        topic_id: topicId,
        question: q.question,
        options: q.options,
        correct_index: 0,
        explanation: explanation,
        task_type: 'test_question'
      });
    }
  }

  console.log(`Total records prepared to insert: ${recordsToInsert.length}`);

  // 5. Insert records in chunks of 50 to be safe and robust
  const chunkSize = 50;
  for (let i = 0; i < recordsToInsert.length; i += chunkSize) {
    const chunk = recordsToInsert.slice(i, i + chunkSize);
    const { error: iError } = await supabaseAdmin
      .from('mcqs')
      .insert(chunk);

    if (iError) {
      console.error(`❌ Failed to insert MCQ chunk starting at index ${i}:`, iError);
      process.exit(1);
    }
    console.log(`Inserted MCQs chunk ${i} to ${Math.min(i + chunkSize, recordsToInsert.length)}`);
  }

  console.log('✅ All 429 MCQs inserted successfully into Supabase!');
}

main();
