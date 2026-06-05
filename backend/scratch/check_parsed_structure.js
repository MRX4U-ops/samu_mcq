const fs = require('fs');
const parsed = JSON.parse(fs.readFileSync('c:/samu_mcq/backend/scratch/parsed_clipboard.json', 'utf8'));

console.log(`Total questions in parsed_clipboard.json: ${parsed.length}`);
console.log('First 5 questions:');
console.log(JSON.stringify(parsed.slice(0, 5), null, 2));
