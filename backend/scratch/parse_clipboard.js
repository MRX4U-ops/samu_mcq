const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('c:/samu_mcq/backend/scratch/current_clipboard.txt', 'utf8');
const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);

console.log(`Total non-empty lines: ${lines.length}`);

const starIndices = [];
lines.forEach((line, index) => {
  if (line.startsWith('*') || line.match(/^[A-D]\*/i)) {
    starIndices.push(index);
  }
});

console.log(`Total '*' lines found: ${starIndices.length}`);

function getScore(startOpt, lines, starIdx, lastOptEnd) {
  let score = 0;
  
  const optLines = lines.slice(startOpt, startOpt + 4);
  if (optLines.length < 4) return -1000;
  
  // 1. ABCD prefix pattern
  const prefixes = ['A', 'B', 'C', 'D'];
  let abcdMatchCount = 0;
  for (let idx = 0; idx < 4; idx++) {
    const text = optLines[idx];
    const expectedLetter = prefixes[idx];
    const regex = new RegExp(`^${expectedLetter}\\*?(?:[\\.\\)\\s]|(?=[A-Z]))`, 'i');
    if (text.match(regex)) {
      abcdMatchCount++;
    }
  }
  
  if (abcdMatchCount === 4) {
    score += 50;
  } else if (abcdMatchCount > 0) {
    score += abcdMatchCount * 5;
  }
  
  // 2. Options length penalties
  let totalLength = 0;
  let hasLongOption = false;
  let hasQuestionMark = false;
  let hasQuestionStart = false;
  let hasClassicOption = false;
  
  optLines.forEach(line => {
    totalLength += line.length;
    if (line.length > 70) {
      hasLongOption = true;
    }
    if (line.includes('?')) {
      hasQuestionMark = true;
    }
    // Check for clinical question starters or typical question words in options
    if (line.match(/^(Which|What|How|Why|At what|Name|The|After|A patient|A young man|A man|A child|A woman|Patients|Members of a family)\b/i)) {
      hasQuestionStart = true;
    }
    if (line.match(/(all of the above|none of these|both a and b|both \(a\) and \(b\))/i)) {
      hasClassicOption = true;
    }
  });
  
  const avgLength = totalLength / 4;
  if (avgLength > 80) score -= 30;
  else if (avgLength > 50) score -= 10;
  
  if (hasLongOption) score -= 20;
  if (hasQuestionMark) score -= 40;
  if (hasQuestionStart) score -= 40;
  if (hasClassicOption) score += 10;
  
  // 3. Question text checks
  const qLines = lines.slice(lastOptEnd + 1, startOpt);
  if (qLines.length > 0) {
    const lastQLine = qLines[qLines.length - 1];
    if (lastQLine.endsWith('?') || lastQLine.includes('?')) {
      score += 15;
    }
  } else {
    score -= 100; // empty question text is highly penalized
  }
  
  if (startOpt === starIdx) {
    score += 5;
  }
  
  return score;
}

// Backtracking solver
function solve(j, lastOptEnd) {
  if (j === starIndices.length) {
    return [];
  }
  const starIdx = starIndices[j];
  
  const candidates = [];
  for (let startOpt = starIdx - 3; startOpt <= starIdx; startOpt++) {
    if (startOpt <= lastOptEnd) continue;
    if (startOpt + 3 >= lines.length) continue;
    
    let starCount = 0;
    for (let k = startOpt; k <= startOpt + 3; k++) {
      if (lines[k].startsWith('*') || lines[k].match(/^[A-D]\*/i)) {
        starCount++;
      }
    }
    if (starCount !== 1) continue;
    
    if (startOpt - 1 < lastOptEnd + 1) continue;
    
    const score = getScore(startOpt, lines, starIdx, lastOptEnd);
    candidates.push({ startOpt, score });
  }
  
  candidates.sort((a, b) => b.score - a.score);
  
  for (const cand of candidates) {
    const nextResult = solve(j + 1, cand.startOpt + 3);
    if (nextResult !== null) {
      return [{
        questionLines: lines.slice(lastOptEnd + 1, cand.startOpt),
        optionLines: lines.slice(cand.startOpt, cand.startOpt + 4),
        starIdx: starIdx
      }, ...nextResult];
    }
  }
  return null;
}

function parseOptionBlock(optionLines) {
  const cleanLines = optionLines.map(line => line.trim());
  
  const prefixes = ['A', 'B', 'C', 'D'];
  let hasABCDPrefix = true;
  for (let idx = 0; idx < 4; idx++) {
    const text = cleanLines[idx];
    const expectedLetter = prefixes[idx];
    const regex = new RegExp(`^${expectedLetter}\\*?(?:[\\.\\)\\s]|(?=[A-Z]))`, 'i');
    if (!text.match(regex)) {
      hasABCDPrefix = false;
      break;
    }
  }
  
  let isCorrectFound = false;
  let correctIndex = -1;
  
  let finalOptions = cleanLines.map((line, idx) => {
    let text = line;
    let correct = false;
    
    if (text.startsWith('*')) {
      correct = true;
      text = text.substring(1).trim();
    }
    
    if (hasABCDPrefix) {
      const expectedLetter = prefixes[idx];
      const regex = new RegExp(`^${expectedLetter}(\\*?)(?:[\\.\\)\\s]|(?=[A-Z]))\\s*`, 'i');
      const match = text.match(regex);
      if (match) {
        if (match[1] === '*') {
          correct = true;
        }
        text = text.replace(regex, '').trim();
      }
    } else {
      const starMatch = text.match(/^([A-D])\*(.*)/i);
      if (starMatch) {
        correct = true;
        text = starMatch[2].trim();
      }
      
      const standardPrefixRegex = /^([A-D])[\.\)]\s*/i;
      text = text.replace(standardPrefixRegex, '').trim();
    }
    
    if (text.startsWith('*')) {
      correct = true;
      text = text.substring(1).trim();
    }
    
    if (correct) {
      isCorrectFound = true;
      correctIndex = idx;
    }
    
    return text;
  });
  
  if (correctIndex === -1) {
    optionLines.forEach((line, idx) => {
      if (line.includes('*')) {
        correctIndex = idx;
      }
    });
  }
  
  if (correctIndex === -1) {
    correctIndex = 0;
  }
  
  const correctOptionText = finalOptions[correctIndex];
  const incorrectOptions = finalOptions.filter((_, idx) => idx !== correctIndex);
  
  return {
    options: [correctOptionText, ...incorrectOptions],
    correctIndex: 0
  };
}

console.log('Running backtracking solver...');
const result = solve(0, -1);

if (result) {
  console.log(`✅ Success! Successfully parsed ${result.length} questions.`);
  
  const parsedMCQs = result.map((q, idx) => {
    const questionText = q.questionLines.join(' ');
    const { options, correctIndex } = parseOptionBlock(q.optionLines);
    return {
      id: idx + 1,
      question: questionText,
      options: options,
      correctIndex: correctIndex
    };
  });
  
  fs.writeFileSync('c:/samu_mcq/backend/scratch/parsed_clipboard.json', JSON.stringify(parsedMCQs, null, 2), 'utf8');
  console.log('Saved parsed clipboard to parsed_clipboard.json');

  const backPainQ = parsedMCQs.find(q => q.question.toLowerCase().includes('back pain') || q.question.toLowerCase().includes('osteomyelitis'));
  if (backPainQ) {
    console.log('\nFound Back Pain Question:');
    console.log(JSON.stringify(backPainQ, null, 2));
  } else {
    console.log('\n❌ Back Pain Question NOT found in parsed output.');
  }
} else {
  console.log('❌ Backtracking solver failed to find a valid partition.');
}
