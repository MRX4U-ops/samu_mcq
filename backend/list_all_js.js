const fs = require('fs');
const path = require('path');

const root = 'c:\\samu_mcq';

function walk(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.join(dir, file);
      if (file === 'node_modules' || file === '.git' || file === '.expo' || file === 'web-build') return;
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        results = results.concat(walk(fullPath));
      } else {
        results.push({ path: fullPath, size: stat.size, mtime: stat.mtime });
      }
    });
  } catch (e) {
    // Ignore
  }
  return results;
}

const files = walk(root);
console.log(`Total non-node_modules files: ${files.length}`);
files.sort((a, b) => b.mtime - a.mtime); // Newest first
files.slice(0, 50).forEach(f => {
  console.log(`- ${f.path} (Size: ${f.size} bytes, Modified: ${f.mtime})`);
});
