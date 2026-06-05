const fs = require('fs');
const content = fs.readFileSync('c:/samu_mcq/backend/scratch/current_clipboard.txt', 'utf8');
const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);

const starIndices = [];
lines.forEach((line, index) => {
  if (line.startsWith('*') || line.match(/^[A-D]\*/i)) {
    starIndices.push({ index, line });
  }
});

console.log('Star Indices around 1390-1440:');
starIndices.forEach(item => {
  if (item.index >= 1380 && item.index <= 1445) {
    console.log(`  [Index ${item.index}]: "${item.line}"`);
  }
});
