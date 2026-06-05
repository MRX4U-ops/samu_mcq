const fs = require('fs');
const path = require('path');

function searchDir(dir, pattern, results = []) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      let stat;
      try {
        stat = fs.statSync(fullPath);
      } catch (e) {
        continue;
      }
      if (stat.isDirectory()) {
        searchDir(fullPath, pattern, results);
      } else {
        if (file.endsWith('.jsonl') || file.endsWith('.txt') || file.endsWith('.json') || file.endsWith('.js')) {
          try {
            // Check size first, skip files > 20MB to prevent heap issues
            if (stat.size > 20 * 1024 * 1024) continue;
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes(pattern)) {
              results.push({ path: fullPath, size: stat.size });
            }
          } catch (e) {
            // ignore read errors
          }
        }
      }
    }
  } catch (e) {
    // ignore dir errors
  }
  return results;
}

console.log('Searching in C:/Users/mohd6/.gemini/antigravity/brain...');
const res = searchDir('C:/Users/mohd6/.gemini/antigravity/brain', 'Qaydnoma');
console.log('Results in brain:', res);
