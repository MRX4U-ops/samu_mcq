const fs = require('fs');
const readline = require('readline');

async function printLine1202() {
  const logFile = 'C:\\Users\\mohd6\\.gemini\\antigravity\\brain\\c67a4971-16ee-4b4c-b42b-1b33319a309e\\.system_generated\\logs\\transcript.jsonl';
  const fileStream = fs.createReadStream(logFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineCount = 0;
  for await (const line of rl) {
    lineCount++;
    if (lineCount === 1202) {
      const data = JSON.parse(line);
      fs.writeFileSync('c:\\samu_mcq\\scratch\\user_input_content.txt', data.content || '');
      console.log('Successfully wrote content of length:', data.content ? data.content.length : 0);
      break;
    }
  }
}

printLine1202();
