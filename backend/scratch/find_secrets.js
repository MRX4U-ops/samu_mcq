const fs = require('fs');
const path = require('path');

const rootDir = 'c:/samu_mcq';

function walk(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      if (file === 'node_modules' || file === '.git' || file === '.expo' || file === '.idea') return;
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

console.log('Scanning all files for database connection strings...');
const files = walk(rootDir);
files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('postgres://') || content.includes('postgresql://') || content.includes('supabase.co')) {
      if (file.endsWith('.js') || file.endsWith('.env') || file.endsWith('.json') || file.endsWith('.sql')) {
        console.log(`[MATCH] Found in: ${file}`);
      }
    }
  } catch (e) {
    // Ignore
  }
});
console.log('Scan completed.');
