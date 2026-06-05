const fs = require('fs');
const data = JSON.parse(fs.readFileSync('c:\\samu_mcq\\scratch\\parsed_full_results.json', 'utf8'));

console.log('Total parsed elements:', data.length);
console.log('First 5 elements:');
console.log(data.slice(0, 5));
console.log('Middle 5 elements:');
console.log(data.slice(Math.floor(data.length / 2), Math.floor(data.length / 2) + 5));
console.log('Last 5 elements:');
console.log(data.slice(-5));

// Check duplicates or anomalies
const groups = {};
data.forEach(item => {
  groups[item.group] = (groups[item.group] || 0) + 1;
});
console.log('Group counts:', groups);
