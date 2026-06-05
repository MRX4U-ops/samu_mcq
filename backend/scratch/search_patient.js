const fs = require('fs');
const parsed = JSON.parse(fs.readFileSync('c:/samu_mcq/backend/scratch/parsed_clipboard.json', 'utf8'));

const found = parsed.filter(q => q.question.toLowerCase().includes('patient'));
console.log(`Found ${found.length} matches:`);
found.forEach(f => {
  console.log(`[ID ${f.id}]: ${f.question.substring(0, 100)}...`);
});
