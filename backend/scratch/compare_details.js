const fs = require('fs');
const path = require('path');

const filePath = 'c:/samu_mcq/backend/scratch/comparison_report.json';
if (!fs.existsSync(filePath)) {
  console.error('File not found:', filePath);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const diffAnswers = data.modifiedQuestions.filter(q => {
  const c = (q.clipboard.correctOption || '').trim().toLowerCase();
  const d = (q.database.correctOption || '').trim().toLowerCase();
  return c !== d;
});

let output = `Number of questions with different correct answers: ${diffAnswers.length}\n\n`;
diffAnswers.forEach((q, idx) => {
  output += `${idx + 1}. Q: ${q.question}\n`;
  output += `   Clip: ${q.clipboard.correctOption}\n`;
  output += `   DB:   ${q.database.correctOption}\n`;
  output += '-'.repeat(40) + '\n';
});

fs.writeFileSync('c:/samu_mcq/backend/scratch/compare_details.txt', output, 'utf8');
console.log('Saved details to c:/samu_mcq/backend/scratch/compare_details.txt');
