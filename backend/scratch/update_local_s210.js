const fs = require('fs');
const path = require('path');

function parseQuestions() {
  const content = fs.readFileSync('scratch/raw_new_questions.txt', 'utf8');
  const lines = content.split('\n').map(l => l.trim()).filter(l => l !== '');

  const questions = [];
  let i = 0;
  while (i < lines.length) {
    const questionText = lines[i];
    const options = [];
    let correctIndex = -1;

    for (let j = 1; j <= 4; j++) {
      let optionText = lines[i + j];
      if (optionText.startsWith('*')) {
        correctIndex = j - 1;
        optionText = optionText.substring(1).trim();
      }
      options.push(optionText);
    }

    // Rearrange options so that correct option is at index 0
    const rearrangedOptions = [...options];
    if (correctIndex !== 0 && correctIndex !== -1) {
      const correctText = rearrangedOptions[correctIndex];
      rearrangedOptions.splice(correctIndex, 1);
      rearrangedOptions.unshift(correctText);
    }

    questions.push({
      question: questionText,
      options: rearrangedOptions,
      correctIndex: 0,
      explanation: `${rearrangedOptions[0]} is correct. This aligns with standard microbiology and immunology curriculum.`
    });

    i += 5;
  }
  return questions;
}

function main() {
  const repoPath = path.resolve(__dirname, '../../mobile-app/src/data/repository/course2/s-2-10.js');
  
  if (!fs.existsSync(repoPath)) {
    console.error(`❌ Repo file not found: ${repoPath}`);
    process.exit(1);
  }

  // 1. Read and parse questions
  console.log('📖 Parsing raw questions...');
  const questions = parseQuestions();
  console.log(`Parsed ${questions.length} questions.`);

  if (questions.length !== 120) {
    console.error(`❌ Expected exactly 120 questions, but parsed ${questions.length}`);
    process.exit(1);
  }

  // Divide questions
  const group1 = questions.slice(0, 40);
  const group2 = questions.slice(40, 80);
  const group3 = questions.slice(80);

  // 2. Load existing s-2-10.js content
  const content = fs.readFileSync(repoPath, 'utf8');
  
  // Convert ESM to CommonJS to load
  const tempPath = path.resolve(__dirname, 'temp_s210.js');
  const cjsContent = content.replace('export const s_2_10 =', 'module.exports =');
  fs.writeFileSync(tempPath, cjsContent, 'utf8');
  
  const s_2_10 = require(tempPath);
  fs.unlinkSync(tempPath);

  console.log('Successfully loaded existing repository keys:', Object.keys(s_2_10));

  // 3. Clear keys >= 21
  for (let key in s_2_10) {
    const match = key.match(/^t-s-2-10-(\d+)$/);
    if (match && parseInt(match[1]) >= 21) {
      console.log(`Deleting old key: ${key}`);
      delete s_2_10[key];
    }
  }

  // 4. Set new keys
  s_2_10['t-s-2-10-21'] = group1;
  s_2_10['t-s-2-10-22'] = group2;
  s_2_10['t-s-2-10-23'] = group3;

  console.log('New repository keys:', Object.keys(s_2_10));

  // 5. Save back to repo file as ESM
  const updatedContent = `// Course 2 - Subject 10 - Microbiology, Virology, Parasitology and Immunology-2\nexport const s_2_10 = ${JSON.stringify(s_2_10, null, 2)};\n`;
  fs.writeFileSync(repoPath, updatedContent, 'utf8');
  console.log(`✅ Successfully updated local repository file: ${repoPath}`);
}

main();
