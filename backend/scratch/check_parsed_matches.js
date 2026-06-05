const fs = require('fs');
const parsed = JSON.parse(fs.readFileSync('c:/samu_mcq/backend/scratch/parsed_clipboard.json', 'utf8'));

const found = parsed.filter(q => q.question.toLowerCase().includes('osteomyelitis') || q.question.toLowerCase().includes('back pain'));
console.log(`Found ${found.length} matches:`);
console.log(JSON.stringify(found, null, 2));
