const fs = require('fs');
const path = require('path');

const dataFile = 'C:/Users/mohd6/Downloads/medical_chemistry_mcqs_topic_wise.cjs';
const data = require(dataFile);

const result = {
  "s-1-10": {},
  "s-1-11": {}
};

// Shuffle function
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function parseContent(content) {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let i = 0;
  
  if (lines[i] && lines[i].toUpperCase().startsWith('TOPIC')) {
    i++;
  }

  const hasLetterMarkers = lines.some(l => /^[a-dA-D][\)\.]\s/.test(l) || /^\([a-d]\)\s/.test(l));
  
  const questions = [];
  while (i < lines.length) {
    let questionText = "";
    
    if (hasLetterMarkers) {
      while (i < lines.length && !(/^[a-dA-D][\)\.]\s/.test(lines[i]) || /^\([a-d]\)\s/.test(lines[i]))) {
        questionText += (questionText ? " " : "") + lines[i];
        i++;
      }
    } else {
      questionText = lines[i];
      i++;
      while (i < lines.length && 
             !lines[i-1].endsWith('?') && 
             !lines[i-1].endsWith(':') && 
             !/^\d+[\)\.]\s/.test(lines[i]) &&
             lines.length - i > 4) {
        questionText += " " + lines[i];
        i++;
      }
    }

    const options = [];
    while (i < lines.length && options.length < 4) {
      let opt = lines[i];
      if (hasLetterMarkers) {
        opt = opt.replace(/^\(?[a-dA-D][\)\.]\s*/, '').trim();
      }
      options.push(opt);
      i++;
    }

    if (options.length > 0) {
      const cleanedQuestion = questionText.replace(/^\d+[\)\.]\s*/, '').trim();
      
      // SHUFFLE LOGIC
      const originalAnswer = options[0]; // First option is the answer
      const shuffledOptions = shuffleArray([...options]);
      const newCorrectIndex = shuffledOptions.indexOf(originalAnswer);

      questions.push({
        question: cleanedQuestion,
        options: shuffledOptions,
        correctIndex: newCorrectIndex,
        explanation: "The correct answer is '" + originalAnswer + "'. This choice aligns with the established clinical curriculum."
      });
    }
  }
  return questions;
}

if (data.module1) {
  data.module1.forEach(topic => {
    result["s-1-10"][`t-s-1-10-${topic.topicNo}`] = parseContent(topic.content);
  });
}

if (data.module2) {
  data.module2.forEach(topic => {
    result["s-1-11"][`t-s-1-11-${topic.topicNo}`] = parseContent(topic.content);
  });
}

const outputPath = 'c:/samu_mcq/backend/src/data/chemistryData.js';
const fileContent = `const MEDICAL_CHEMISTRY_MCQS = ${JSON.stringify(result, null, 2)};\n\nmodule.exports = MEDICAL_CHEMISTRY_MCQS;`;
fs.writeFileSync(outputPath, fileContent);

console.log('--- RE-PARSING (WITH SHUFFLING) COMPLETE ---');
console.log(`Saved to: ${outputPath}`);
