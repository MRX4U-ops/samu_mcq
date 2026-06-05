const fs = require('fs');
const readline = require('readline');

async function findPrevInputs() {
  const logFile = 'C:\\Users\\mohd6\\.gemini\\antigravity\\brain\\c67a4971-16ee-4b4c-b42b-1b33319a309e\\.system_generated\\logs\\transcript.jsonl';
  const fileStream = fs.createReadStream(logFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineCount = 0;
  for await (const line of rl) {
    lineCount++;
    if (line.includes('Biochemistry') && line.includes('7059')) {
      try {
        const data = JSON.parse(line);
        console.log(`Line ${lineCount}: Type=${data.type}, Source=${data.source}, Keys=${Object.keys(data).join(',')}`);
        if (data.content) {
          console.log(`  Content length: ${data.content.length}`);
          console.log(`  Content snippet: ${data.content.slice(0, 200)}`);
          console.log(`  Content end: ${data.content.slice(-200)}`);
        }
      } catch (e) {
        console.log(`Line ${lineCount} parse error: ${e.message}`);
      }
    }
  }
}

findPrevInputs();
