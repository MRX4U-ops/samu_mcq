const fs = require('fs');
const readline = require('readline');

async function readLastUserMessage() {
  const logFile = 'C:\\Users\\mohd6\\.gemini\\antigravity\\brain\\c67a4971-16ee-4b4c-b42b-1b33319a309e\\.system_generated\\logs\\transcript.jsonl';
  const fileStream = fs.createReadStream(logFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lastLine = '';
  for await (const line of rl) {
    if (line.includes('USER_INPUT') && line.includes('its not showing all users result')) {
      lastLine = line;
    }
  }

  if (lastLine) {
    console.log('Found line matching. Writing to output...');
    fs.writeFileSync('c:\\samu_mcq\\scratch\\last_user_message.json', lastLine);
    console.log('Done!');
  } else {
    console.log('Line not found');
  }
}

readLastUserMessage();
