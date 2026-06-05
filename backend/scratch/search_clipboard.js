const fs = require('fs');
const content = fs.readFileSync('c:/samu_mcq/backend/scratch/current_clipboard.txt', 'utf8');
const lines = content.split('\n');

lines.forEach((line, index) => {
  if (line.includes('back pain') || line.includes('A*Staphylococcus') || line.includes('BStaphylococcus')) {
    console.log(`${index}: ${line.trim()}`);
  }
});
