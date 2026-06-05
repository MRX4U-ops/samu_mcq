const fs = require('fs');

const path = 'full_clipboard_history.txt';
if (!fs.existsSync(path)) {
  console.log('full_clipboard_history.txt does not exist');
  process.exit(1);
}

const content = fs.readFileSync(path, 'utf8');
const regex = /#\s+TOPIC\s*:\s*(\d+)/gi;
let match;
const topicsFound = new Set();
while ((match = regex.exec(content)) !== null) {
  topicsFound.add(parseInt(match[1]));
}

console.log('Topics found in clipboard history:', Array.from(topicsFound).sort((a, b) => a - b));

// Let's also print the length of the file to see how much content we have
console.log('Total characters in clipboard dump:', content.length);
