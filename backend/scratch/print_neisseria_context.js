const fs = require('fs');

const files = [
  'c:/samu_mcq/mobile-app/src/data/repository/course2/s-2-10.js',
  'c:/samu_mcq/mobile-app/src/data/repository/course2/s-2-9-situational.js',
  'c:/samu_mcq/mobile-app/src/data/repository/course2/s-2-10-situational.js'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
  console.log(`\n=== FILE: ${file} ===`);
  
  if (file.endsWith('.js')) {
    // We can evaluate it or search it
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('coli and Neisseria')) {
        console.log(`L${index + 1}: ${line.trim()}`);
        
        // Find which topic block this line belongs to
        // We can search backwards for key names like "t-s-2-10-X"
        let topicKey = 'Unknown';
        for (let i = index; i >= 0; i--) {
          if (lines[i].includes('"t-s-2-10-') || lines[i].includes('"t-s-2-9-') || lines[i].includes('t-s-2-10-') || lines[i].includes('t-s-2-9-')) {
            topicKey = lines[i].trim();
            break;
          }
        }
        console.log(`Associated Topic Key: ${topicKey}`);
        
        // Print surrounding context
        const start = Math.max(0, index - 5);
        const end = Math.min(lines.length, index + 10);
        for (let i = start; i < end; i++) {
          console.log(`   ${i + 1}: ${lines[i]}`);
        }
      }
    });
  }
});
