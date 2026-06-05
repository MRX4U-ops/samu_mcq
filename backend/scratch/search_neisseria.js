const fs = require('fs');
const path = require('path');

const dirs = [
  'c:/samu_mcq/mobile-app/src',
  'c:/samu_mcq/backend/src'
];

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
        if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.json')) {
          results.push(fullPath);
        }
      }
    });
  } catch (e) {}
  return results;
}

console.log('Scanning directories...');
const allFiles = [];
dirs.forEach(d => {
  allFiles.push(...walk(d));
});

console.log(`Found ${allFiles.length} source files to check.`);

allFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('coli and Neisseria')) {
      console.log(`[MATCH EXACT] Found in: ${file}`);
    } else if (content.includes('meningitidis')) {
      console.log(`[MATCH WORD] Found 'meningitidis' in: ${file}`);
    }
  } catch (e) {}
});

console.log('Search finished.');
