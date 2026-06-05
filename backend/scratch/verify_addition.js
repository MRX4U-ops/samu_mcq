const fs = require('fs');
const { supabaseAdmin } = require('../src/config/supabase');

async function main() {
  console.log('--- STARTING VERIFICATION ---');

  const subjectId = 'f83d725b-9deb-468f-98d3-19a46cb51306'; // Microbiology-2
  const repoPath = 'c:/samu_mcq/mobile-app/src/data/repository/course2/s-2-10.js';

  // 1. Verify Supabase topics & MCQs
  console.log('Fetching topics from Supabase...');
  const { data: topics, error: tErr } = await supabaseAdmin
    .from('topics')
    .select('id, title')
    .eq('subject_id', subjectId)
    .like('title', 'Additional Topic%');

  if (tErr) {
    console.error('❌ Error fetching topics from Supabase:', tErr);
    process.exit(1);
  }

  console.log(`Found ${topics.length} additional topics in Supabase.`);
  if (topics.length !== 8) {
    console.error('❌ Expected exactly 8 additional topics in Supabase!');
    process.exit(1);
  }

  // Count MCQs per topic
  let totalDbMcqs = 0;
  for (const topic of topics.sort((a,b) => a.title.localeCompare(b.title, undefined, {numeric: true}))) {
    const { count, error: countErr } = await supabaseAdmin
      .from('mcqs')
      .select('*', { count: 'exact', head: true })
      .eq('topic_id', topic.id);

    if (countErr) {
      console.error(`❌ Error counting MCQs for topic "${topic.title}":`, countErr);
      process.exit(1);
    }

    console.log(`- Topic "${topic.title}" has ${count} MCQs in Supabase.`);
    totalDbMcqs += count;
  }
  console.log(`Total MCQs in Supabase under additional topics: ${totalDbMcqs}`);
  if (totalDbMcqs !== 429) {
    console.error(`❌ Expected exactly 429 MCQs in Supabase, but got ${totalDbMcqs}!`);
    process.exit(1);
  }

  // 2. Verify Local Repository file
  console.log('\nChecking local repository file...');
  if (!fs.existsSync(repoPath)) {
    console.error(`❌ Local repository file not found at ${repoPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(repoPath, 'utf8');
  const tempPath = 'c:/samu_mcq/backend/scratch/temp_verify_s210.js';
  const cjsContent = content.replace('export const s_2_10 =', 'module.exports =');
  fs.writeFileSync(tempPath, cjsContent, 'utf8');
  
  const s_2_10 = require(tempPath);
  fs.unlinkSync(tempPath);

  let totalLocalMcqs = 0;
  for (let i = 1; i <= 8; i++) {
    const key = `t-s-2-10-${20 + i}`;
    const list = s_2_10[key];
    if (!list) {
      console.error(`❌ Key "${key}" is missing from local repository!`);
      process.exit(1);
    }
    console.log(`- Local key "${key}" has ${list.length} MCQs.`);
    totalLocalMcqs += list.length;
  }
  console.log(`Total MCQs in local repository under keys: ${totalLocalMcqs}`);
  if (totalLocalMcqs !== 429) {
    console.error(`❌ Expected exactly 429 MCQs in local repository, but got ${totalLocalMcqs}!`);
    process.exit(1);
  }

  console.log('✅ ALL VERIFICATIONS PASSED SUCCESSFULLY!');
}

main();
