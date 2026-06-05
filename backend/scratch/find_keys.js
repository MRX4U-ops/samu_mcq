const fs = require('fs');
const content = fs.readFileSync('../mobile-app/src/data/repository/course2/s-2-10.js', 'utf8');

// Simple regex match for keys
const keys = [];
const regex = /"t-s-2-10-\d+":/g;
let match;
while ((match = regex.exec(content)) !== null) {
  keys.push(match[0]);
}
console.log('Keys found in s-2-10.js:', keys);
