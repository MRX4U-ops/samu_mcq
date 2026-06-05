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
        // Skip node_modules, .git, .expo, etc.
        if (file === 'node_modules' || file === '.git' || file === '.expo' || file === '.system_generated' || file === 'brain') {
          continue;
        }
        searchDir(fullPath, pattern, results);
      } else {
        if (file.endsWith('.txt') || file.endsWith('.json') || file.endsWith('.js') || file.endsWith('.sql') || file.endsWith('.csv')) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes(pattern)) {
              results.push(fullPath);
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

console.log('Searching in c:/samu_mcq...');
const res1 = searchDir('c:/samu_mcq', 'Qaydnoma');
console.log('Results in c:/samu_mcq:', res1);

console.log('Searching in C:/Users/mohd6/.gemini/antigravity...');
const res2 = searchDir('C:/Users/mohd6/.gemini/antigravity', 'Qaydnoma');
console.log('Results in appData:', res2);
