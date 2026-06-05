const fs = require('fs');
const content = fs.readFileSync('c:/samu_mcq/backend/scratch/current_clipboard.txt', 'utf8');
const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);

for (let idx = 1385; idx <= 1415; idx++) {
  if (idx < lines.length) {
    console.log(`${idx}: ${lines[idx]}`);
  }
}
