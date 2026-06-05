const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\Users\\mohd6\\.gemini\\antigravity';

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

console.log('Scanning all files in App Data...');
const files = walk(rootDir);
console.log(`Found ${files.length} files.`);

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    if (content.toLowerCase().includes('lophotrichous') || content.toLowerCase().includes('nocardia')) {
      console.log(`[MATCH] Found in: ${file} (Size: ${content.length} bytes)`);
    }
  } catch (e) {
    // Ignore
  }
});

console.log('Scan completed.');
