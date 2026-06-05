const fs = require('fs');

function parseQuestions() {
  const content = fs.readFileSync('scratch/raw_new_questions.txt', 'utf8');
  const lines = content.split('\n').map(l => l.trim()).filter(l => l !== '');

  const questions = [];
  let i = 0;
  while (i < lines.length) {
    const questionText = lines[i];
    const options = [];
    let correctIndex = -1;

    // The next 4 lines should be the options
    for (let j = 1; j <= 4; j++) {
      if (i + j >= lines.length) {
        console.error(`Error: reached end of file while parsing options for question: "${questionText}"`);
        break;
      }
      let optionText = lines[i + j];
      if (optionText.startsWith('*')) {
        correctIndex = j - 1;
        optionText = optionText.substring(1).trim();
      }
      options.push(optionText);
    }

    if (correctIndex === -1) {
      console.warn(`Warning: No correct option marked with '*' for question: "${questionText}"`);
    }

    questions.push({
      question: questionText,
      options: options,
      correctIndex: correctIndex
    });

    i += 5; // Move to next question (1 question line + 4 options lines)
  }

  console.log(`Parsed ${questions.length} questions in total.`);
  return questions;
}

const parsed = parseQuestions();
// Verify counts: 120 total, first 20, next 20, remaining 80
console.log('Block 1 count:', parsed.slice(0, 20).length);
console.log('Block 2 count:', parsed.slice(20, 40).length);
console.log('Block 3 count:', parsed.slice(40).length);

// Let's check a few samples
console.log('Sample 1 (Q1):', JSON.stringify(parsed[0], null, 2));
console.log('Sample 2 (Q21):', JSON.stringify(parsed[20], null, 2));
console.log('Sample 3 (Q41):', JSON.stringify(parsed[40], null, 2));
console.log('Sample 4 (Q120):', JSON.stringify(parsed[119], null, 2));
