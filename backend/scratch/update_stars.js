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

  const subjectId = 'f83d725b-9deb-468f-98d3-19a46cb51306'; // Microbiology-2

  // 1. Fetch the 8 topics
  const topicTitles = Array.from({ length: 8 }, (_, i) => `Additional Topic ${i + 1}`);
  const topicMap = {}; // Title -> ID

  for (const title of topicTitles) {
    const { data: existing, error: fError } = await supabaseAdmin
      .from('topics')
      .select('id')
      .eq('subject_id', subjectId)
      .eq('title', title)
      .maybeSingle();

    if (fError || !existing) {
      console.error(`❌ Failed to find topic "${title}":`, fError);
      process.exit(1);
    }
    topicMap[title] = existing.id;
  }

  // 2. Clear existing MCQs from these 8 topics in Supabase
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

  // 3. Prepare records to insert with '*' prefixed correct options
  const distribution = [54, 54, 54, 54, 54, 53, 53, 53];
  let mcqIndex = 0;
  const recordsToInsert = [];

  for (let tIdx = 0; tIdx < 8; tIdx++) {
    const title = topicTitles[tIdx];
    const topicId = topicMap[title];
    const count = distribution[tIdx];

    for (let k = 0; k < count; k++) {
      const q = mcqs[mcqIndex++];
      
      // Update correct option to have star
      let options = [...q.options];
      if (!options[0].startsWith('*')) {
        options[0] = '*' + options[0];
      }
      
      const correctOptionText = options[0];
      const explanation = `${correctOptionText} is correct. This aligns with standard microbiology and immunology curriculum.`;

      recordsToInsert.push({
        topic_id: topicId,
        question: q.question,
        options: options,
        correct_index: 0,
        explanation: explanation,
        task_type: 'test_question'
      });
    }
  }

  console.log(`Inserting ${recordsToInsert.length} records into Supabase...`);
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
  console.log('✅ Supabase database updated successfully!');

  // 4. Update local repository file s-2-10.js
  const repoPath = 'c:/samu_mcq/mobile-app/src/data/repository/course2/s-2-10.js';
  if (!fs.existsSync(repoPath)) {
    console.error(`❌ Repo file not found: ${repoPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(repoPath, 'utf8');
  const tempPath = 'c:/samu_mcq/backend/scratch/temp_s210.js';
  const cjsContent = content.replace('export const s_2_10 =', 'module.exports =');
  fs.writeFileSync(tempPath, cjsContent, 'utf8');
  
  const s_2_10 = require(tempPath);
  fs.unlinkSync(tempPath);

  // Distribute updated MCQs locally
  mcqIndex = 0;
  for (let i = 0; i < 8; i++) {
    const localTopicId = `t-s-2-10-${21 + i}`;
    const count = distribution[i];
    s_2_10[localTopicId] = [];

    for (let k = 0; k < count; k++) {
      const q = mcqs[mcqIndex++];
      let options = [...q.options];
      if (!options[0].startsWith('*')) {
        options[0] = '*' + options[0];
      }
      const correctOptionText = options[0];
      const explanation = `${correctOptionText} is correct. This aligns with standard microbiology and immunology curriculum.`;

      s_2_10[localTopicId].push({
        question: q.question,
        options: options,
        correctIndex: 0,
        explanation: explanation
      });
    }
  }

  const updatedContent = `export const s_2_10 = ${JSON.stringify(s_2_10, null, 2)};\n`;
  fs.writeFileSync(repoPath, updatedContent, 'utf8');
  console.log(`✅ Local repository file updated successfully: ${repoPath}`);
}

main();
