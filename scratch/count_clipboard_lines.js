const fs = require('fs');
const content = fs.readFileSync('c:\\samu_mcq\\scratch\\clipboard_results.txt', 'utf8');
const lines = content.split(/\r?\n/);
console.log('Total lines in clipboard_results.txt:', lines.length);
console.log('First 20 lines:');
console.log(lines.slice(0, 20).join('\n'));
