const fs = require('fs');
const path = require('path');

const targetDir = 'C:\\Users\\mohd6\\.gemini\\antigravity\\brain\\2e6b0925-7274-4954-91b2-9b2771031cde';

function walk(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(walk(fullPath));
      } else {
        results.push(fullPath);
      }
    });
  } catch (e) {
    // Ignore
  }
  return results;
}

const files = walk(targetDir);
console.log(`Found ${files.length} files in the conversation folder:`);
files.forEach(f => console.log(f));
