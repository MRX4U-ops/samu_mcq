const fs = require('fs');
const path = require('path');

const dirsToSearch = [
  'c:\\samu_mcq',
  'C:\\Users\\mohd6\\.gemini\\antigravity',
  'C:\\Users\\mohd6\\AppData\\Local\\Temp'
];

const now = Date.now();
const oneDayMs = 24 * 60 * 60 * 1000;
const targetAge = 3 * oneDayMs; // last 3 days

function searchRecent(dir, depth = 0) {
  if (depth > 4) return; // avoid deep recursion into node_modules or system folders
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      if (file === 'node_modules' || file === '.git' || file === 'dist' || file === '.expo' || file === 'web-build') return;
      
      let stat;
      try {
        stat = fs.statSync(fullPath);
      } catch (e) {
        return;
      }
      
      if (stat.isDirectory()) {
        searchRecent(fullPath, depth + 1);
      } else {
        const age = now - stat.mtimeMs;
        if (age < targetAge && stat.size > 100) {
          const ext = path.extname(file).toLowerCase();
          if (ext === '.txt' || ext === '.json' || ext === '.md' || ext === '.js') {
            console.log(`[RECENT] ${fullPath} - Modified: ${stat.mtime} - Size: ${stat.size} bytes`);
          }
        }
      }
    });
  } catch (e) {
    // Ignore
  }
}

dirsToSearch.forEach(d => {
  console.log(`Searching directory: ${d}`);
  searchRecent(d);
});
console.log('Search finished.');
