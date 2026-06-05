const fs = require('fs');
const content = fs.readFileSync('c:/samu_mcq/scratch/clipboard_results.txt', 'utf8');

const lines = content.split(/\r?\n/);
const results = [];
const failedLines = [];

// Clean up BOM character if present
const cleanContent = content.replace(/^\uFEFF/, '');
const cleanLines = cleanContent.split(/\r?\n/);

const recordRegex = /^(ifa\d{4}-\d{2})\s+(.+?)\s+(\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2})\s+(\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2})\s+(.+?)\s+(\d+(?:[.,]\d+)?)$/;

for (let i = 0; i < cleanLines.length; i++) {
  let line = cleanLines[i].trim();
  if (!line.startsWith('ifa')) {
    continue;
  }

  // Sometimes a record is split onto two lines in raw output due to long names, e.g.
  // ifa2024-55 KANNANTHODI MANNENGAL MUHAMMED MURSHID
  // XXX 19.05.2026 14:05 19.05.2026 14:17 12 min. 15 sek. 88,0
  // Let's check if the next line should be joined to this one.
  if (line.match(/^ifa\d{4}-\d{2}$/) || (!line.includes('.') && i + 1 < cleanLines.length && cleanLines[i + 1].trim().includes('19.05.2026'))) {
    // If the line is short or doesn't have dates, let's peek at the next line
    const nextLine = cleanLines[i + 1].trim();
    if (nextLine.includes('19.05.2026') || nextLine.match(/^\d{2}\.\d{2}\.\d{4}/) || nextLine.startsWith('XXX')) {
      line = line + ' ' + nextLine;
      i++; // skip next line
    }
  }

  // Let's clean multiple spaces
  line = line.replace(/\s+/g, ' ');

  const match = line.match(recordRegex);
  if (match) {
    const group = match[1];
    let name = match[2].replace(/\bXXX\b/g, ' ').replace(/\s+/g, ' ').trim();
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
    // Fallback parser if regex fails
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
      const name = parts.slice(1).join(' ').replace(/\bXXX\b/g, ' ').replace(/\s+/g, ' ').trim();

      const rest = line.substring(dateIndices[0]);
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
      } else {
        failedLines.push({ index: i, text: line, reason: 'Rest parts count < 5' });
      }
    } else {
      failedLines.push({ index: i, text: line, reason: 'Date indices count < 2' });
    }
  }
}

console.log("Total records parsed:", results.length);
console.log("Failed records count:", failedLines.length);
if (failedLines.length > 0) {
  console.log("Failed lines sample:", failedLines.slice(0, 10));
}

fs.writeFileSync('c:/samu_mcq/scratch/parsed_full_results.json', JSON.stringify(results, null, 2));
