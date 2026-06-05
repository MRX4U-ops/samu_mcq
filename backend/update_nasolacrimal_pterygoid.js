const fs = require('fs');
const path = require('path');
const { supabaseAdmin } = require('./src/config/supabase');

async function run() {
  console.log('Starting Nasolacrimal & Pterygoid MCQ update...');

  // 1. Update mobile-app/src/data/repository/course2/s-2-2.js
  const mobileFilePath = path.join(__dirname, '../mobile-app/src/data/repository/course2/s-2-2.js');
  if (fs.existsSync(mobileFilePath)) {
    console.log(`Updating ${mobileFilePath}...`);
    const fileContent = fs.readFileSync(mobileFilePath, 'utf8');
    const startIdx = fileContent.indexOf('{');
    const endIdx = fileContent.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      const jsonStr = fileContent.substring(startIdx, endIdx + 1);
      const data = JSON.parse(jsonStr);

      const topicQuestions = data['t-s-2-2-5'];
      if (Array.isArray(topicQuestions)) {
        let q13Found = false;
        let q20Found = false;

        for (const q of topicQuestions) {
          if (q.question && q.question.includes('inner surface')) {
            console.log(`Found Q13 in mobile-app repository: "${q.question}"`);
            q.question = "The inner surface is covered with mucous membrane.";
            q.options = [
              "The lateral pterygoid",
              "The medial pterygoid D. The masseter",
              "Impaired function of which of the following muscles produce difficulty in protruding the jaw?",
              "The anterior belly of the digastric muscle",
              "The temporalis"
            ];
            q.correctIndex = 0;
            q.explanation = "The correct answer is The lateral pterygoid.";
            q13Found = true;
          }
          if (q.question && q.question.includes('nasolacrimal duct')) {
            console.log(`Found Q20 in mobile-app repository: "${q.question}"`);
            q.options = [
              "inferior meatus of the nose.",
              "lacrimal sac.",
              "superior meatus of the nose.",
              "middle meatus of the nose.",
              "sphenoethmoidal recess"
            ];
            q.correctIndex = 0;
            q.explanation = "The correct answer is inferior meatus of the nose.";
            q20Found = true;
          }
        }

        if (q13Found && q20Found) {
          const newContent = `export const s_2_2 = ${JSON.stringify(data, null, 2)};\n`;
          fs.writeFileSync(mobileFilePath, newContent, 'utf8');
          console.log('✅ mobile-app file updated successfully.');
        } else {
          console.error(`❌ Missing questions in mobile-app file. Q13: ${q13Found}, Q20: ${q20Found}`);
        }
      } else {
        console.error('❌ t-s-2-2-5 not found or is not an array in mobile file.');
      }
    } else {
      console.error('❌ Failed to parse JSON structure in mobile file.');
    }
  } else {
    console.error(`❌ Mobile file not found at ${mobileFilePath}`);
  }

  // 2. Update backend/src/data/anatomyData.js
  const backendFilePath = path.join(__dirname, 'src/data/anatomyData.js');
  if (fs.existsSync(backendFilePath)) {
    console.log(`Updating ${backendFilePath}...`);
    const data = require(backendFilePath);
    
    const topic = data['s-2-2'] && data['s-2-2']['t-s-2-2-6'];
    if (topic && Array.isArray(topic.test)) {
      let q13Found = false;
      let q20Found = false;

      for (const q of topic.test) {
        if (q.question && q.question.includes('inner surface')) {
          console.log(`Found Q13 in backend anatomyData: "${q.question}"`);
          q.question = "The inner surface is covered with mucous membrane.";
          q.options = [
            "The lateral pterygoid",
            "The medial pterygoid D. The masseter",
            "Impaired function of which of the following muscles produce difficulty in protruding the jaw?",
            "The anterior belly of the digastric muscle",
            "The temporalis"
          ];
          q.correctIndex = 0;
          q.correctAnswer = 0;
          q.explanation = "Correct answer: The lateral pterygoid";
          q13Found = true;
        }
        if (q.question && q.question.includes('nasolacrimal duct')) {
          console.log(`Found Q20 in backend anatomyData: "${q.question}"`);
          q.options = [
            "inferior meatus of the nose.",
            "lacrimal sac.",
            "superior meatus of the nose.",
            "middle meatus of the nose.",
            "sphenoethmoidal recess"
          ];
          q.correctIndex = 0;
          q.correctAnswer = 0;
          q.explanation = "Correct answer: inferior meatus of the nose.";
          q20Found = true;
        }
      }

      if (q13Found && q20Found) {
        const newContent = `module.exports = ${JSON.stringify(data, null, 2)};\n`;
        fs.writeFileSync(backendFilePath, newContent, 'utf8');
        console.log('✅ backend data file updated successfully.');
      } else {
        console.error(`❌ Missing questions in backend data. Q13: ${q13Found}, Q20: ${q20Found}`);
      }
    } else {
      console.error('❌ s-2-2 -> t-s-2-2-6 -> test not found in backend data.');
    }
  } else {
    console.error(`❌ Backend file not found at ${backendFilePath}`);
  }

  // 3. Update Supabase
  console.log('Connecting to Supabase...');
  const q13Id = 'ddb1435e-9a88-43ad-b26e-8ae7b56985f0';
  const q20Id = '99e97698-6de9-4218-9ad8-50a17eed58fd';

  // Update Q13
  console.log(`Updating DB MCQ ID: ${q13Id} (Q13)`);
  const { error: error13 } = await supabaseAdmin
    .from('mcqs')
    .update({
      question: "The inner surface is covered with mucous membrane.",
      options: [
        "The lateral pterygoid",
        "The medial pterygoid D. The masseter",
        "Impaired function of which of the following muscles produce difficulty in protruding the jaw?",
        "The anterior belly of the digastric muscle",
        "The temporalis"
      ],
      correct_index: 0,
      explanation: "Correct answer: The lateral pterygoid"
    })
    .eq('id', q13Id);

  if (error13) {
    console.error(`❌ Error updating Q13 in DB:`, error13);
  } else {
    console.log('✅ Q13 updated successfully in DB.');
  }

  // Update Q20
  console.log(`Updating DB MCQ ID: ${q20Id} (Q20)`);
  const { error: error20 } = await supabaseAdmin
    .from('mcqs')
    .update({
      options: [
        "inferior meatus of the nose.",
        "lacrimal sac.",
        "superior meatus of the nose.",
        "middle meatus of the nose.",
        "sphenoethmoidal recess"
      ],
      correct_index: 0,
      explanation: "Correct answer: inferior meatus of the nose."
    })
    .eq('id', q20Id);

  if (error20) {
    console.error(`❌ Error updating Q20 in DB:`, error20);
  } else {
    console.log('✅ Q20 updated successfully in DB.');
  }
}

run().catch(err => {
  console.error('Unexpected error:', err);
});
