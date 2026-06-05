const fs = require('fs');
const content = fs.readFileSync('c:\\samu_mcq\\scratch\\user_input_content.txt', 'utf8');
console.log('--- FIRST 200 CHARACTERS ---');
console.log(content.slice(0, 200));
console.log('--- LAST 200 CHARACTERS ---');
console.log(content.slice(-200));
