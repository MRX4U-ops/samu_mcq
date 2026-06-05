const fs = require('fs');
const content = fs.readFileSync('c:/samu_mcq/scratch/user_input_content.txt', 'utf8');

const lines = content.split(/\r?\n/);
const results = [];

// Regular expression to match student records
// Example: ifa2024-01 AARZOO SIPAI MANJURHUSHEN XXX 19.05.2026 09:07 19.05.2026 09:17 10 min. 27 sek. 78,0
// Another: ifa2024-07 MOHD AARISH XXX 19.05.2026 09:30 19.05.2026 09:45 15 min. 98,0
const recordRegex = /^(ifa\d{4}-\d{2})\s+(.+?)\s+(\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2})\s+(\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2})\s+(.+?)\s+(\d+(?:[.,]\d+)?)$/;

for (let line of lines) {
  line = line.trim();
  if (!line.startsWith('ifa')) continue;
  
  // Clean up multiple spaces and XXX placeholders
  // Let's first match against regex or parse by scanning
  // Let's try regex matching
  const match = line.match(recordRegex);
  if (match) {
    const group = match[1];
    let name = match[2].replace(/\s*XXX\s*/g, ' ').trim();
    const startTime = match[3];
    const endTime = match[4];
    const duration = match[5].trim();
    const score = parseFloat(match[6].replace(',', '.'));
    
    results.push({
      group,
      name,
      startTime,
      endTime,
      duration,
      score
    });
  } else {
    // Fallback parser if regex fails due to different duration formats or name structure
    // Let's split by space, but names can have spaces
    // Let's find dates (e.g. 19.05.2026)
    const dateIndices = [];
    const dateRegex = /\d{2}\.\d{2}\.\d{4}/g;
    let m;
    while ((m = dateRegex.exec(line)) !== null) {
      dateIndices.push(m.index);
    }
    
    if (dateIndices.length >= 2) {
      const groupAndNamePart = line.substring(0, dateIndices[0]).trim();
      const parts = groupAndNamePart.split(/\s+/);
      const group = parts[0];
      const name = parts.slice(1).join(' ').replace(/\s*XXX\s*/g, ' ').trim();
      
      const rest = line.substring(dateIndices[0]);
      // rest looks like: 19.05.2026 09:07 19.05.2026 09:17 10 min. 27 sek. 78,0
      const restParts = rest.trim().split(/\s+/);
      if (restParts.length >= 5) {
        const startTime = restParts[0] + ' ' + restParts[1];
        const endTime = restParts[2] + ' ' + restParts[3];
        
        // Find score (it's the last part)
        const scoreStr = restParts[restParts.length - 1];
        const score = parseFloat(scoreStr.replace(',', '.'));
        
        // Duration is everything in between
        const duration = restParts.slice(4, restParts.length - 1).join(' ');
        
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
}

console.log("Total records parsed:", results.length);
fs.writeFileSync('c:/samu_mcq/scratch/parsed_results.json', JSON.stringify(results, null, 2));
