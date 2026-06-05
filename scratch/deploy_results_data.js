const fs = require('fs');
const path = require('path');

const sourcePath = 'c:/samu_mcq/scratch/parsed_full_results.json';
const adminDest = 'c:/samu_mcq/admin-panel/src/data/biochemistry_results.json';
const mobileDest = 'c:/samu_mcq/mobile-app/src/data/biochemistry_results.json';

// Read parsed data
const data = fs.readFileSync(sourcePath, 'utf8');

// Ensure destination directories exist
fs.mkdirSync(path.dirname(adminDest), { recursive: true });
fs.mkdirSync(path.dirname(mobileDest), { recursive: true });

// Write files
fs.writeFileSync(adminDest, data);
fs.writeFileSync(mobileDest, data);

console.log('Successfully copied results JSON to:');
console.log(' -', adminDest);
console.log(' -', mobileDest);
