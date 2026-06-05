const fs = require('fs');
const path = require('path');

function listFiles(dir, allFiles = []) {
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
        if (file === 'node_modules' || file === '.git' || file === '.expo' || file === 'dist' || file === 'build') {
          continue;
        }
        listFiles(fullPath, allFiles);
      } else {
        allFiles.push({ path: fullPath, size: stat.size });
      }
    }
  } catch (e) {
    // ignore
  }
  return allFiles;
}

const list = listFiles('c:/samu_mcq');
list.sort((a, b) => b.size - a.size);
console.log('Top 50 largest files in c:/samu_mcq:');
list.slice(0, 50).forEach(f => {
  console.log(`${f.path} (${f.size} bytes)`);
});
