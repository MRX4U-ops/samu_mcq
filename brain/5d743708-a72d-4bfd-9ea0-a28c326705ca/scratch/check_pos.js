const fs = require('fs');
const content = fs.readFileSync('c:/samu_mcq/mobile-app/src/data/mcqRepository.js', 'utf8');
const pos = 746967;
console.log("Char at pos:", content[pos]);
console.log("Context around pos:");
console.log(content.substring(pos - 20, pos + 20));
