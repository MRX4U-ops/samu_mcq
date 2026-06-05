const fs = require('fs');

const logPath = 'C:\\Users\\mohd6\\.gemini\\antigravity\\brain\\2e6b0925-7274-4954-91b2-9b2771031cde\\.system_generated\\logs\\overview.txt';

if (!fs.existsSync(logPath)) {
  console.log('Log file does not exist');
  process.exit(1);
}

const content = fs.readFileSync(logPath, 'utf8');
const lines = content.split('\n');

console.log('Total lines in log:', lines.length);

lines.forEach((line, idx) => {
  if (line.includes('TOPIC :')) {
    console.log(`Line ${idx + 1}: length=${line.length}`);
    try {
      const parsed = JSON.parse(line);
      console.log('  Parsed content length:', parsed.content ? parsed.content.length : 0);
      if (parsed.content) {
        console.log('  Content starts with:', JSON.stringify(parsed.content.substring(0, 200)));
        console.log('  Content ends with:', JSON.stringify(parsed.content.substring(parsed.content.length - 200)));
      }
    } catch (e) {
      console.log('  Failed to parse JSON line:', line.substring(0, 200) + '...');
    }
  }
});
