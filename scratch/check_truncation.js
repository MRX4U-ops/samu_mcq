const fs = require('fs');
const line = fs.readFileSync('c:\\samu_mcq\\scratch\\last_user_message.json', 'utf8');
const data = JSON.parse(line);
console.log('Keys:', Object.keys(data));
console.log('Type:', data.type);
console.log('Source:', data.source);
console.log('Content length:', data.content ? data.content.length : 0);
if (data.content) {
  console.log('Content preview (first 200 chars):', data.content.slice(0, 200));
  console.log('Content preview (last 200 chars):', data.content.slice(-200));
}
