const fs = require('fs');
const readline = require('readline');

async function scanTranscript() {
  const logFile = 'C:\\Users\\mohd6\\.gemini\\antigravity\\brain\\c67a4971-16ee-4b4c-b42b-1b33319a309e\\.system_generated\\logs\\transcript.jsonl';
  const fileStream = fs.createReadStream(logFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const lines = [];
  for await (const line of rl) {
    lines.push(line);
  }

  console.log(`Total lines: ${lines.length}`);
  const lastN = lines.slice(-10);
  lastN.forEach((line, idx) => {
    try {
      const data = JSON.parse(line);
      console.log(`\n--- Line ${lines.length - 10 + idx} ---`);
      console.log(`Type: ${data.type}, Source: ${data.source}, Keys: ${Object.keys(data).join(', ')}`);
      if (data.content) {
        console.log(`Content (first 100): ${data.content.slice(0, 100)}`);
        console.log(`Content (length): ${data.content.length}`);
      }
      if (data.tool_calls) {
        console.log(`Tool Calls: ${data.tool_calls.map(tc => tc.name || tc.ToolName).join(', ')}`);
      }
    } catch (e) {
      console.log(`Error parsing line ${idx}: ${e.message}`);
    }
  });
}

scanTranscript();
