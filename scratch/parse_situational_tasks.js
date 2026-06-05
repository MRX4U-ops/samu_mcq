const fs = require('fs');
const path = require('path');

const inputFile = process.argv[2];
if (!inputFile) {
  console.error("Please provide input text file");
  process.exit(1);
}

const text = fs.readFileSync(inputFile, 'utf-8');
const targetFile = path.join(__dirname, '../mobile-app/src/data/repository/course1/s-1-9.js');

let s19Content = fs.readFileSync(targetFile, 'utf-8');
const jsonMatch = s19Content.match(/export const s_1_9 = (\{[\s\S]+\});/);
if (!jsonMatch) {
  console.error("Could not find s_1_9 object in file");
  process.exit(1);
}

let s19Obj;
try {
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
    let qText = lines[++i].trim();
    // Use [•\-] to match bullets or hyphens
    while (i + 1 < lines.length && !lines[i + 1].trim().match(/^(?:[•\-]\s*)?[a-z]\./i) && !lines[i + 1].trim().match(/^(?:[•\-]\s*)?\*[a-z]\./i) && !lines[i + 1].trim().match(/^Select one( answer)?:/i)) {
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

  const optMatch = line.match(/^(?:[•\-]\s*)?(\*?)[a-z]\.\s*(.+)/i);
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

// Merge into existing topics
for (const topicKey of Object.keys(parsedTopics)) {
  const qs = parsedTopics[topicKey];
  const finalQs = qs.map(q => {
    let opts = [];
    if (q.correctOption) {
      opts.push(q.correctOption);
    } else {
      console.warn(`WARNING: No correct option found for question: ${q.question}`);
    }
    opts = opts.concat(q.options);
    
    return {
      question: q.question,
      options: opts
    };
  });
  
  if (s19Obj[topicKey]) {
    // If it's an array, convert to { test: [...], situational: [] }
    if (Array.isArray(s19Obj[topicKey])) {
      s19Obj[topicKey] = {
        test: s19Obj[topicKey],
        situational: finalQs
      };
    } else {
      s19Obj[topicKey].situational = finalQs;
    }
  } else {
    // If topic doesn't exist at all, add it as situational only
    s19Obj[topicKey] = {
      test: [],
      situational: finalQs
    };
  }
}

// Convert any remaining array topics to the object structure just to be consistent
for (const key of Object.keys(s19Obj)) {
  if (Array.isArray(s19Obj[key])) {
    s19Obj[key] = {
      test: s19Obj[key],
      situational: []
    };
  }
}

const newContent = s19Content.replace(jsonMatch[1], JSON.stringify(s19Obj, null, 2));
fs.writeFileSync(targetFile, newContent, 'utf-8');
console.log(`Updated topics with situational tasks: ${Object.keys(parsedTopics).join(', ')}`);
