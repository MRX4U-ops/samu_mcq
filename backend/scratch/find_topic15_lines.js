const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../mobile-app/src/data/repository/course2/s-2-10.js');
const fileContent = fs.readFileSync(filePath, 'utf8');
const lines = fileContent.split('\n');

let start = -1;
let end = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('"t-s-2-10-15": [')) {
    start = i;
  }
  if (start !== -1 && end === -1) {
    if (lines[i].trim() === '],' && (lines[i+1] && lines[i+1].includes('"t-s-2-10-16": ['))) {
      end = i;
    }
  }
}

console.log('Start index (0-indexed):', start);
console.log('End index (0-indexed):', end);
console.log('Start line (1-indexed):', start + 1);
console.log('End line (1-indexed):', end + 1);
console.log('--- Lines content preview ---');
if (start !== -1 && end !== -1) {
  console.log(lines.slice(start, start + 5).join('\n'));
  console.log('...');
  console.log(lines.slice(end - 2, end + 2).join('\n'));
}
