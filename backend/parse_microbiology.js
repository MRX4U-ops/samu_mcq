const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('full_clipboard_history.txt', 'utf8');

// We will scan the file and extract topics.
// Since the clipboard dump has multiple items (some duplicate or partial), 
// we will parse all items and keep the most complete version of each topic.

const topics = {}; // topicNum -> array of question objects

// Split by ITEM blocks
const items = content.split(/=== ITEM \d+ ===/);

items.forEach(item => {
  if (!item.trim()) return;

  // Let's find if this item has any TOPIC block
  const lines = item.split('\n');
  let currentTopicNum = null;
  let currentQuestion = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check for Topic Header: e.g. "# TOPIC : 01" or "TOPIC : 01"
    const topicMatch = line.match(/(?:#\s*)?TOPIC\s*:\s*(\d+)/i);
    if (topicMatch) {
      currentTopicNum = parseInt(topicMatch[1]);
      if (!topics[currentTopicNum]) {
        topics[currentTopicNum] = [];
      }
      currentQuestion = null;
      continue;
    }

    if (currentTopicNum === null) continue;

    // Check for Question Header: e.g. "## Question 1" or "Question 1"
    const qMatch = line.match(/(?:##\s*)?Question\s*(\d+)/i);
    if (qMatch) {
      if (currentQuestion) {
        // Save previous question
        addQuestion(currentTopicNum, currentQuestion);
      }
      currentQuestion = {
        questionText: '',
        options: [],
        correctValue: null
      };
      continue;
    }

    if (!currentQuestion) continue;

    // Check for options: e.g. "a. text", "b. text", "c. text", "d. text", or bolded: "**a. text**"
    // Option regex should match bold or non-bold option prefixes like a., b., c., d.
    const optMatch = line.match(/^(\*\*?[a-d]\..*?\*\*?|[a-d]\..*)$/i);
    if (optMatch) {
      let optText = line;
      let isCorrect = false;
      if (optText.startsWith('**') || optText.includes('**')) {
        isCorrect = true;
        optText = optText.replace(/\*\*/g, '');
      }
      // Remove prefix like "a.", "b.", "c.", "d."
      optText = optText.replace(/^[a-d]\.\s*/i, '').trim();

      currentQuestion.options.push(optText);
      if (isCorrect) {
        currentQuestion.correctValue = optText;
      }
    } else {
      // It's part of the question text
      if (currentQuestion.options.length === 0) {
        if (currentQuestion.questionText) {
          currentQuestion.questionText += ' ' + line;
        } else {
          currentQuestion.questionText = line;
        }
      }
    }
  }

  // Add the last question of the item
  if (currentQuestion) {
    addQuestion(currentTopicNum, currentQuestion);
  }
});

function addQuestion(topicNum, q) {
  if (!q.questionText || q.options.length < 2) return;
  // If correctValue is not set, default to first option
  if (!q.correctValue) {
    q.correctValue = q.options[0];
  }
  
  // Clean options: we need exactly 4 options usually, or whatever is there.
  // The contract states: mcqs.options[0] is ALWAYS the correct answer in storage.
  // So we put correctValue as the first option in options array!
  const correct = q.correctValue;
  const incorrects = q.options.filter(o => o !== correct);
  const finalOptions = [correct, ...incorrects];

  // We want to avoid duplicates for the same topic.
  const existing = topics[topicNum];
  const isDuplicate = existing.some(ext => ext.question.toLowerCase() === q.questionText.toLowerCase());
  
  if (!isDuplicate) {
    existing.push({
      question: q.questionText,
      options: finalOptions,
      correctIndex: 0,
      explanation: `${correct} is correct. This aligns with standard microbiology and immunology curriculum.`
    });
  }
}

// Print results summary
console.log('Parsed Topics and Question Counts:');
Object.keys(topics).sort((a, b) => a - b).forEach(tNum => {
  console.log(`Topic ${tNum}: ${topics[tNum].length} questions`);
});

// Save to structured json file
fs.writeFileSync('parsed_microbiology.json', JSON.stringify(topics, null, 2), 'utf8');
console.log('Successfully saved parsed questions to parsed_microbiology.json');
