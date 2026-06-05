const fs = require('fs');
const path = require('path');

const targetDir = 'C:\\Users\\mohd6\\AppData\\Local\\Temp';
const now = Date.now();
const oneDayMs = 24 * 60 * 60 * 1000;
const maxAge = 2 * oneDayMs;

function walkAndSearch(dir, depth = 0) {
  if (depth > 3) return;
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      let stat;
      try {
        stat = fs.statSync(fullPath);
      } catch (e) {
        return;
      }
      
      if (stat.isDirectory()) {
        walkAndSearch(fullPath, depth + 1);
      } else {
        const age = now - stat.mtimeMs;
        if (age < maxAge && stat.size > 100 && stat.size < 5 * 1024 * 1024) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.toLowerCase().includes('lophotrichous') || content.toLowerCase().includes('nocardia')) {
              console.log(`[FOUND MATCH] ${fullPath} (Size: ${stat.size} bytes, Modified: ${stat.mtime})`);
            }
          } catch (e) {
            // Ignore binary or unreadable files
          }
        }
      }
    });
  } catch (e) {
    // Ignore
  }
}

console.log('Searching temp folder for micro keywords...');
walkAndSearch(targetDir);
console.log('Search finished.');
