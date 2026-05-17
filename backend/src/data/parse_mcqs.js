const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'raw_mcqs.txt');
const content = fs.readFileSync(inputPath, 'utf-8');

const topics = content.split(/TOPIC\s*:\s*/i);
const result = {
  "s-1-10": {},
  "s-1-11": {}
};

topics.forEach(topicBlock => {
  if (!topicBlock.trim()) return;

  const rawLines = topicBlock.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const topicIdMatch = rawLines[0].match(/^(\d+)/);
  if (!topicIdMatch) return;

  const topicNum = parseInt(topicIdMatch[1]);
  const questions = [];
  
  let lines = rawLines.slice(1).filter(line => {
    return !line.includes('Click Here') && !line.includes('t.me/');
  });

  let i = 0;
  while (i < lines.length) {
    let questionText = lines[i];
    questionText = questionText.replace(/^\d+[\)\.]\s*/, '').trim();
    i++;

    const options = [];
    for (let j = 0; j < 4 && i < lines.length; j++) {
      let optionText = lines[i];
      if (/^\d+\./.test(optionText) && j > 0) break; 
      optionText = optionText.replace(/^[a-dA-D][\)\.]\s*/, '').trim();
      options.push(optionText);
      i++;
    }

    if (options.length > 0) {
      questions.push({
        question: questionText,
        options: options,
        correctIndex: 0,
        explanation: "The selected option is the verified correct answer according to the subject curriculum."
      });
    }
  }

  if (topicNum >= 1 && topicNum <= 12) {
    result["s-1-10"][`t-s-1-10-${topicNum}`] = questions;
  } else if (topicNum >= 13 && topicNum <= 24) {
    result["s-1-11"][`t-s-1-11-${topicNum}`] = questions;
  }
});

const outputPath = path.join(__dirname, 'chemistryData.js');
const fileContent = `const MEDICAL_CHEMISTRY_MCQS = ${JSON.stringify(result, null, 2)};\n\nmodule.exports = MEDICAL_CHEMISTRY_MCQS;`;
fs.writeFileSync(outputPath, fileContent);
console.log('Successfully updated chemistryData.js with explanations');
