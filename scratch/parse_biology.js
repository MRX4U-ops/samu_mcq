const fs = require('fs');
const path = require('path');

const inputFile = process.argv[2];
const mode = process.argv[3] || 'test'; // 'test' or 'situational'

if (!inputFile) {
  console.error("Please provide input text file");
  process.exit(1);
}

const text = fs.readFileSync(inputFile, 'utf-8');
const targetFile = path.join(__dirname, '../mobile-app/src/data/repository/course1/s-1-8.js');

let s18Content = '';
let s18Obj = {};
let hasExisting = false;

if (fs.existsSync(targetFile)) {
  s18Content = fs.readFileSync(targetFile, 'utf-8');
  const jsonMatch = s18Content.match(/export const s_1_8 = (\{[\s\S]+\});/);
  if (jsonMatch) {
    try {
      s18Obj = JSON.parse(jsonMatch[1]);
      hasExisting = true;
    } catch (e) {
      console.error("Error parsing existing s-1-8.js JSON:", e.message);
    }
  }
}

const blocks = text.split(/\n\s*\n/);
let currentTopic = -1;
let parsedTopics = {};

for (const block of blocks) {
  const lines = block.split('\n').map(l => l.trim()).filter(l => l);
  if (lines.length === 0) continue;

  const topicMatch = lines[0].match(/Mavzu\s*(\d+)/i) || lines[0].match(/Topic\s*(\d+)/i);
  if (topicMatch) {
    currentTopic = parseInt(topicMatch[1], 10) - 1;
    if (!parsedTopics[`t-s-1-8-${currentTopic}`]) {
      parsedTopics[`t-s-1-8-${currentTopic}`] = [];
    }
    if (lines.length === 1) {
      continue;
    } else {
      // The first line is the topic, the rest is the question block.
      // Remove the topic line from lines
      lines.shift();
    }
  }

  if (currentTopic === -1) {
    currentTopic = 0;
    if (!parsedTopics[`t-s-1-8-${currentTopic}`]) {
      parsedTopics[`t-s-1-8-${currentTopic}`] = [];
    }
  }

  if (lines.length >= 5) {
    const options = lines.slice(-4);
    const question = lines.slice(0, -4).join(' ');
    
    parsedTopics[`t-s-1-8-${currentTopic}`].push({
      question: question,
      options: options // First option is correct
    });
  }
}

for (const topicKey of Object.keys(parsedTopics)) {
  const newQs = parsedTopics[topicKey];
  if (!s18Obj[topicKey]) {
    s18Obj[topicKey] = {
      test: mode === 'test' ? newQs : [],
      situational: mode === 'situational' ? newQs : []
    };
  } else {
    if (mode === 'test') {
      s18Obj[topicKey].test = newQs;
    } else if (mode === 'situational') {
      s18Obj[topicKey].situational = newQs;
    }
  }
}

const objStr = JSON.stringify(s18Obj, null, 2);
if (hasExisting) {
  s18Content = s18Content.replace(/export const s_1_8 = \{[\s\S]+\};/, `export const s_1_8 = ${objStr};`);
} else {
  s18Content = `export const s_1_8 = ${objStr};\n`;
}

fs.writeFileSync(targetFile, s18Content, 'utf-8');

console.log(`Updated ${mode} questions for: ${Object.keys(parsedTopics).join(', ')}`);
