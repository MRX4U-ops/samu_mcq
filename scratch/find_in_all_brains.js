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
        if (file.endsWith('.jsonl') || file.endsWith('.txt') || file.endsWith('.json') || file.endsWith('.js') || file.endsWith('.md')) {
          try {
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

console.log('Searching for Qaydnoma...');
const res1 = searchDir('C:/Users/mohd6/.gemini/antigravity/brain', 'Qaydnoma');
console.log('Results (Qaydnoma):', res1);

console.log('Searching for Tests in English...');
const res2 = searchDir('C:/Users/mohd6/.gemini/antigravity/brain', 'Tests in English');
console.log('Results (Tests in English):', res2);

console.log('Searching for ifa2024-01...');
const res3 = searchDir('C:/Users/mohd6/.gemini/antigravity/brain', 'ifa2024-01');
console.log('Results (ifa2024-01):', res3);
