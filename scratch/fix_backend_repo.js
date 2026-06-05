const fs = require('fs');
const path = require('path');

const repoPath = path.join(__dirname, '../backend/src/data/mcqRepository.js');
const content = fs.readFileSync(repoPath, 'utf8');
const lines = content.split('\n');

console.log('Original total lines:', lines.length);

// The structure:
// Line 2535 (idx 2534): },   <-- closing s-2-8 subject block
// Lines 2536-3213 (idx 2535-3212): ORPHANED s-1-8 junk to remove
// Line 3214 (idx 3213): "s-1-10": {   <-- valid next subject starts here

// We keep lines 0..2534 (i.e., lines 1-2535), then skip 2535-3212, 
// then keep from 3213 onwards (line 3214+)

const keepBefore = lines.slice(0, 2534); // lines 1 to 2534
const keepAfter = lines.slice(3213);     // from line 3214 onwards (the valid "s-1-10" block)

// We need a comma between s-2-8 close and s-1-10 start
// Line 2534 (idx 2533) should be: },  -- that's the close of s-2-8 with comma
// Actually looking at the structure, line 2535 is `},` which closes s-2-8 properly
// but let's check by including it:
const keepBeforeFinal = lines.slice(0, 2535); // lines 1-2535 inclusive (has the `},`)
const fixedLines = [...keepBeforeFinal, ...keepAfter];

console.log('Fixed total lines:', fixedLines.length);

// Write fixed file
const fixed = fixedLines.join('\n');
fs.writeFileSync(repoPath, fixed, 'utf8');
console.log('Written successfully!');

// Verify it parses
try {
  // Clear the require cache first
  delete require.cache[require.resolve(repoPath)];
  const repo = require(repoPath);
  console.log('SUCCESS! Repository loads correctly.');
  console.log('Subject keys:', Object.keys(repo));
} catch (e) {
  console.error('STILL BROKEN:', e.message, 'at line', e.lineNumber);
}
