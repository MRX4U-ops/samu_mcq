const fs = require('fs');

const rawText = fs.readFileSync('c:/samu_mcq/clipboard_anatomy.txt', 'utf8');
const lines = rawText.split('\n');

const results = [];

for (let line of lines) {
  line = line.trim();
  if (line.startsWith('ifa2024-')) {
    const parts = line.split(/\s+/);
    const group = parts[0];
    
    let dateStartIndex = -1;
    for (let i = 1; i < parts.length; i++) {
      if (/^\d{2}\.\d{2}\.\d{4}$/.test(parts[i])) {
        dateStartIndex = i;
        break;
      }
    }
    
    if (dateStartIndex !== -1) {
      let name = parts.slice(1, dateStartIndex).join(' ').replace(/ XXX$/, '').replace(/ XXX /, ' ');
      
      const startTime = parts[dateStartIndex] + ' ' + parts[dateStartIndex + 1];
      const endTime = parts[dateStartIndex + 2] + ' ' + parts[dateStartIndex + 3];
      
      let durationParts = [];
      let i = dateStartIndex + 4;
      while (i < parts.length - 1) { 
        durationParts.push(parts[i]);
        i++;
      }
      const duration = durationParts.join(' ');
      
      const scoreRaw = parts[parts.length - 1];
      const score = parseFloat(scoreRaw.replace(',', '.'));
      
      results.push({
        group,
        name,
        startTime,
        endTime,
        duration,
        score
      });
    }
  }
}

fs.writeFileSync('c:/samu_mcq/mobile-app/src/data/clinical_anatomy_results.json', JSON.stringify(results, null, 2));
console.log('Parsed ' + results.length + ' results from clipboard.');
