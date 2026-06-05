const fs = require('fs');
const parsed = JSON.parse(fs.readFileSync('c:/samu_mcq/backend/scratch/parsed_clipboard.json', 'utf8'));

console.log('Printing parsed questions from ID 260 to 275:');
for (let id = 260; id <= 275; id++) {
  const q = parsed.find(item => item.id === id);
  if (q) {
    console.log(`\nID ${q.id}:`);
    console.log(`  Question: ${q.question.substring(0, 150)}...`);
    console.log(`  Options: ${JSON.stringify(q.options)}`);
  }
}
