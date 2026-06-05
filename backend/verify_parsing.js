const fs = require('fs');

const data = JSON.parse(fs.readFileSync('parsed_microbiology.json', 'utf8'));

console.log('--- VERIFICATION ---');
Object.keys(data).sort((a, b) => a - b).forEach(topicNum => {
  const qs = data[topicNum];
  console.log(`Topic ${topicNum}: ${qs.length} questions`);
  
  // Check for any question without exactly 4 options
  const badOptions = qs.filter(q => q.options.length !== 4);
  if (badOptions.length > 0) {
    console.log(`  [WARNING] ${badOptions.length} questions do not have exactly 4 options!`);
    badOptions.forEach(q => {
      console.log(`    - Q: "${q.question}" has options:`, q.options);
    });
  }

  // Print a sample question
  if (qs.length > 0) {
    const q = qs[0];
    console.log(`  Sample Q: "${q.question}"`);
    console.log(`    Correct (storage index 0): "${q.options[0]}"`);
    console.log(`    Options:`, q.options);
  }
});
