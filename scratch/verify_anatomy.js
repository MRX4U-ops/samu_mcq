const fs = require('fs');
const mobileRepo = require('../mobile-app/src/data/repository/course2/s-2-2.js');
const mobileQuestions = mobileRepo.s_2_2['t-s-2-2-4'];

const file = fs.readFileSync('backend/src/data/anatomyData.js', 'utf8');
const startIdx = file.indexOf('"t-s-2-2-5"');
if (startIdx === -1) {
  console.log('Key t-s-2-2-5 not found');
} else {
  const sub = file.substring(startIdx);
  const testIdx = sub.indexOf('"test"');
  const testSub = sub.substring(testIdx);
  
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
  
  const testContent = testSub.substring(testSub.indexOf('['), endIdx + 1);
  console.log('testContent snippet end:', testContent.substring(testContent.length - 200));
  
  // Use eval to parse since it is JS, not strict JSON
  let backendQuestions;
  try {
    backendQuestions = eval(testContent);
  } catch (e) {
    console.error('Eval error:', e.message);
  }
  
  if (backendQuestions) {
    console.log('Backend questions count:', backendQuestions.length);
    
    let allMatch = true;
    mobileQuestions.forEach((q, i) => {
      const match = backendQuestions.find(bq => bq.question === q.question);
      if (!match) {
        console.log('Mismatch at index', i, q.question);
        allMatch = false;
      } else if (match.options[0] !== q.options[0]) {
        console.log('Option 0 mismatch for', q.question, '\nMobile:', q.options[0], '\nBackend:', match.options[0]);
        allMatch = false;
      }
    });
    if (allMatch) {
      console.log('All questions and correct answers match perfectly!');
    }
  }
}
