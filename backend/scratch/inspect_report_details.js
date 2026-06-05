const fs = require('fs');
const report = JSON.parse(fs.readFileSync('c:/samu_mcq/backend/scratch/comparison_report.json', 'utf8'));

console.log('--- SAMPLE MODIFIED QUESTIONS ---');
report.modifiedQuestions.slice(0, 3).forEach((m, idx) => {
  console.log(`\nModified Question ${idx + 1}:`);
  console.log(`  Question: "${m.question}"`);
  console.log(`  Reason: ${m.reason}`);
  console.log(`  Clipboard Correct: "${m.clipboard.correctOption}"`);
  console.log(`  Database Correct:  "${m.database.correctOption}"`);
  console.log(`  Clipboard Options: ${JSON.stringify(m.clipboard.options)}`);
  console.log(`  Database Options:  ${JSON.stringify(m.database.options)}`);
});

console.log('\n--- SAMPLE NEW QUESTIONS ---');
report.newQuestions.slice(0, 3).forEach((n, idx) => {
  console.log(`\nNew Question ${idx + 1}:`);
  console.log(`  Question: "${n.question}"`);
  console.log(`  Correct: "${n.correctOption}"`);
  console.log(`  Options: ${JSON.stringify(n.options)}`);
});
