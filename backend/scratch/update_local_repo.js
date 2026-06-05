const fs = require('fs');
const path = require('path');

function main() {
  const repoPath = 'c:/samu_mcq/mobile-app/src/data/repository/course2/s-2-10.js';
  const notMatchesPath = 'c:/samu_mcq/backend/scratch/not_matches.json';

  if (!fs.existsSync(repoPath)) {
    console.error(`❌ Repo file not found: ${repoPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(notMatchesPath)) {
    console.error(`❌ Not matches file not found: ${notMatchesPath}`);
    process.exit(1);
  }

  // 1. Read not matches questions
  const mcqs = JSON.parse(fs.readFileSync(notMatchesPath, 'utf8'));
  console.log(`Loaded ${mcqs.length} MCQs to distribute.`);

  // 2. Load existing s-2-10.js content
  const content = fs.readFileSync(repoPath, 'utf8');
  
  // Convert ESM to CommonJS to load
  const tempPath = 'c:/samu_mcq/backend/scratch/temp_s210.js';
  const cjsContent = content.replace('export const s_2_10 =', 'module.exports =');
  fs.writeFileSync(tempPath, cjsContent, 'utf8');
  
  const s_2_10 = require(tempPath);
  fs.unlinkSync(tempPath);

  console.log('Successfully loaded existing repository object keys:', Object.keys(s_2_10));

  // 3. Distribute the 429 MCQs
  // Topics 21-25: 54 questions each
  // Topics 26-28: 53 questions each
  const distribution = [54, 54, 54, 54, 54, 53, 53, 53];
  let mcqIndex = 0;

  for (let i = 0; i < 8; i++) {
    const topicId = `t-s-2-10-${21 + i}`;
    const count = distribution[i];
    s_2_10[topicId] = [];

    console.log(`Mapping ${count} questions to ${topicId}...`);
    for (let k = 0; k < count; k++) {
      if (mcqIndex >= mcqs.length) {
        console.error('❌ MCQ index out of bounds during local distribution!');
        process.exit(1);
      }

      const q = mcqs[mcqIndex++];
      const correctOptionText = q.options[0];
      const explanation = `${correctOptionText} is correct. This aligns with standard microbiology and immunology curriculum.`;

      s_2_10[topicId].push({
        question: q.question,
        options: q.options,
        correctIndex: 0,
        explanation: explanation
      });
    }
  }

  // 4. Save back to repo file as ESM
  const updatedContent = `export const s_2_10 = ${JSON.stringify(s_2_10, null, 2)};\n`;
  fs.writeFileSync(repoPath, updatedContent, 'utf8');
  console.log(`✅ Successfully updated local repository file: ${repoPath}`);
}

main();
