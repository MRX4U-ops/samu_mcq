const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\mohd6\\.gemini\\antigravity\\brain\\c67a4971-16ee-4b4c-b42b-1b33319a309e\\.system_generated\\logs\\transcript.jsonl';
if (fs.existsSync(logPath)) {
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  let matchCount = 0;
  lines.forEach((line) => {
    if (line.includes('autoterminated') || line.includes('auto-terminated') || line.includes('terminated') || line.includes('terminate')) {
      matchCount++;
      try {
        const obj = JSON.parse(line);
        console.log(`Match ${matchCount}: [${obj.type}] Source: ${obj.source}`);
        console.log(obj.content ? obj.content.substring(0, 500) : 'No content');
      } catch (e) {
        console.log(`Match ${matchCount} (raw):`, line.substring(0, 500));
      }
    }
  });
} else {
  console.log('No transcript log found at:', logPath);
}
