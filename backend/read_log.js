const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\mohd6\\.gemini\\antigravity\\brain\\2e6b0925-7274-4954-91b2-9b2771031cde\\.system_generated\\logs\\overview.txt';

if (!fs.existsSync(logPath)) {
  console.log('Log file does not exist');
  process.exit(1);
}

const content = fs.readFileSync(logPath, 'utf8');
console.log('Log file size:', content.length, 'bytes');

const lines = content.split('\n');
console.log('Number of lines:', lines.length);

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('Nocardia') || line.includes('lophotrichous')) {
    console.log(`Line ${i + 1} matches! Length: ${line.length}`);
    console.log(line.substring(0, 1000) + '...');
  }
}
