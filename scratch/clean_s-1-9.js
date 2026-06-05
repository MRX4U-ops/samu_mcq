const fs = require('fs');

const filePath = 'c:/samu_mcq/mobile-app/src/data/repository/course1/s-1-9.js';
let fileContent = fs.readFileSync(filePath, 'utf8');

const dataStr = fileContent.replace('export const s_1_9 = ', '').replace(/;\s*$/, '');
const data = JSON.parse(dataStr);

let cleanedCount = 0;

for (const topicId in data) {
  const questions = data[topicId];
  for (const q of questions) {
    if (q.options) {
      q.options = q.options.map(opt => {
        const cleaned = opt.replace(/^[A-D]\)\s*/i, '');
        if (cleaned !== opt) {
          cleanedCount++;
        }
        return cleaned;
      });
    }
  }
}

fs.writeFileSync(filePath, 'export const s_1_9 = ' + JSON.stringify(data, null, 2) + ';\n');
console.log('Cleaned ' + cleanedCount + ' options.');
