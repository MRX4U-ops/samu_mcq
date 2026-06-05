const fs = require('fs');
let buffer = fs.readFileSync('c:/samu_mcq/scratch/user_input.json');
// Check for UTF-16 LE BOM (0xFF, 0xFE)
let data;
if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
  data = buffer.toString('utf16le');
} else if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
  data = buffer.toString('utf8').substring(1);
} else {
  data = buffer.toString('utf8');
}
// Remove possible BOM or extra characters
data = data.replace(/^\uFEFF/, '').trim();
const obj = JSON.parse(data);
console.log("Length of content:", obj.content.length);
fs.writeFileSync('c:/samu_mcq/scratch/user_input_content.txt', obj.content);
console.log("Written successfully!");
