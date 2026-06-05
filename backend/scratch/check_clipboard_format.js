const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('c:/samu_mcq/backend/scratch/current_clipboard.txt', 'utf8');
const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);

console.log(`Total non-empty lines: ${lines.length}`);

const starIndices = [];
lines.forEach((line, index) => {
  if (line.startsWith('*')) {
    starIndices.push(index);
  }
});

console.log(`Total '*' lines found: ${starIndices.length}`);

// Let's print the distance between consecutive '*' lines
const distances = {};
for (let i = 1; i < starIndices.length; i++) {
  const dist = starIndices[i] - starIndices[i - 1];
  distances[dist] = (distances[dist] || 0) + 1;
}

console.log('Distances between consecutive "*" lines:', distances);

// Print a few lines around the first 5 '*' occurrences
starIndices.slice(0, 5).forEach((starIdx, i) => {
  console.log(`\n--- Occurrence ${i + 1} at index ${starIdx} ---`);
  const start = Math.max(0, starIdx - 5);
  const end = Math.min(lines.length - 1, starIdx + 5);
  for (let j = start; j <= end; j++) {
    const prefix = j === starIdx ? '=> ' : '   ';
    console.log(`${prefix}${j}: ${lines[j]}`);
  }
});
