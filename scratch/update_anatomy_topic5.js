const fs = require('fs');

// Read the mobile app repository data
const mobileRepo = require('../mobile-app/src/data/repository/course2/s-2-2.js');
const topic5Questions = mobileRepo.s_2_2['t-s-2-2-4'];

// Check that we got 20 questions
if (!topic5Questions || topic5Questions.length !== 20) {
  console.error('Failed to load topic 5 questions from mobile repository. Length:', topic5Questions ? topic5Questions.length : 0);
  process.exit(1);
}

// Format questions for backend
const formattedQuestions = topic5Questions.map(q => {
  return {
    question: q.question,
    options: q.options,
    correctIndex: 0,
    explanation: `Correct answer: ${q.options[0]}`
  };
});

// Read the backend file
const backendFilePath = 'backend/src/data/anatomyData.js';
let backendContent = fs.readFileSync(backendFilePath, 'utf8');

// Find the target block start and end using index
const targetKey = '"t-s-2-2-5"';
const keyPos = backendContent.indexOf(targetKey);
if (keyPos === -1) {
  console.error('Could not find target key in backend file');
  process.exit(1);
}

const sub = backendContent.substring(keyPos);
const testPos = sub.indexOf('"test"');
if (testPos === -1) {
  console.error('Could not find test key under t-s-2-2-5');
  process.exit(1);
}

const absoluteTestPos = keyPos + testPos;
const testSub = backendContent.substring(absoluteTestPos);
let bracketCount = 0;
let endIdx = -1;
for (let i = 0; i < testSub.length; i++) {
  if (testSub[i] === '[') bracketCount++;
  else if (testSub[i] === ']') {
    bracketCount--;
    if (bracketCount === 0) {
      endIdx = i;
      break;
    }
  }
}

if (endIdx === -1) {
  console.error('Could not find end of test array');
  process.exit(1);
}

const originalBlock = backendContent.substring(absoluteTestPos, absoluteTestPos + endIdx + 1);

// Generate formatted string
const formattedJson = JSON.stringify(formattedQuestions, null, 2);
// Indent the JSON by 8 spaces
const indentedJson = formattedJson.split('\n').map((line, idx) => {
  if (idx === 0) return '"test": [';
  return '      ' + line;
}).join('\n');

const newContent = backendContent.replace(originalBlock, indentedJson);
fs.writeFileSync(backendFilePath, newContent, 'utf8');
console.log('Successfully updated backend/src/data/anatomyData.js for topic t-s-2-2-5');
