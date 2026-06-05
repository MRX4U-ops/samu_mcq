const fs = require('fs');
const path = require('path');

const inputFile = process.argv[2];
if (!inputFile) {
  console.error("Please provide input text file");
  process.exit(1);
}

const text = fs.readFileSync(inputFile, 'utf-8');
const targetFile = path.join(__dirname, '../mobile-app/src/data/repository/course1/s-1-9.js');

// We will parse the text and replace the arrays in s-1-9.js.
// Since it's a huge JS file, we'll extract the JSON from it, update it, and write it back.

// Actually, reading and parsing s-1-9.js might be tricky if it's an export const.
// Let's do it using regex to find the object.
let s19Content = fs.readFileSync(targetFile, 'utf-8');
const jsonMatch = s19Content.match(/export const s_1_9 = ({[\s\S]+});/);
if (!jsonMatch) {
  console.error("Could not find s_1_9 object in file");
  process.exit(1);
}

let s19Obj;
try {
  // Use eval to parse since it's standard JS object (it might have unquoted keys if we are not careful, but JSON parse works if it's strictly JSON).
  // Looking at s-1-9.js, the keys are quoted.
  s19Obj = JSON.parse(jsonMatch[1]);
} catch (e) {
  console.error("Error parsing s-1-9.js JSON:", e.message);
  process.exit(1);
}

const lines = text.split('\n');
let currentTopic = -1;
let currentQuestion = null;
const parsedTopics = {};

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line || line.startsWith('___')) continue;

  const topicMatch = line.match(/^\*?Topic[-\s]*(\d+)/i);
  if (topicMatch) {
    currentTopic = parseInt(topicMatch[1], 10) - 1; // 0-indexed
    if (!parsedTopics[`t-s-1-9-${currentTopic}`]) {
      parsedTopics[`t-s-1-9-${currentTopic}`] = [];
    }
    continue;
  }

  const qMatch = line.match(/^\*?Question\s*\d+/i);
  if (qMatch) {
    // Next line is the question text
    let qText = lines[++i].trim();
    // Sometimes question is multiple lines? Assuming single line for now
    while (i + 1 < lines.length && !lines[i + 1].trim().match(/^(?:•\s*|\-\s*)?[a-z]\./i) && !lines[i + 1].trim().match(/^(?:•\s*|\-\s*)?\*[a-z]\./i)) {
      qText += ' ' + lines[++i].trim();
    }
    currentQuestion = {
      question: qText,
      options: [],
      correctOption: null
    };
    parsedTopics[`t-s-1-9-${currentTopic}`].push(currentQuestion);
    continue;
  }

  const optMatch = line.match(/^(?:•\s*|\-\s*)?(\*?)[a-z]\.\s*(.+)/i);
  if (optMatch) {
    const isCorrect = optMatch[1] === '*';
    const optText = optMatch[2].trim();
    if (isCorrect) {
      currentQuestion.correctOption = optText;
    } else {
      currentQuestion.options.push(optText);
    }
  }
}

// Now assemble them
for (const topicKey of Object.keys(parsedTopics)) {
  const qs = parsedTopics[topicKey];
  const finalQs = qs.map(q => {
    // Correct option MUST be at index 0
    let opts = [];
    if (q.correctOption) {
      opts.push(q.correctOption);
    } else {
      console.warn(`WARNING: No correct option found for question: ${q.question}`);
    }
    opts = opts.concat(q.options);
    
    // Some questions might have less than 4 options if parsing failed, but we assume it's fine
    return {
      question: q.question,
      options: opts
    };
  });
  
  s19Obj[topicKey] = finalQs;
}

// Write back to the file
const newContent = s19Content.replace(jsonMatch[1], JSON.stringify(s19Obj, null, 2));
fs.writeFileSync(targetFile, newContent, 'utf-8');
console.log(`Updated topics: ${Object.keys(parsedTopics).join(', ')}`);
