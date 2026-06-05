const fs = require('fs');
const path = require('path');
const { supabaseAdmin } = require('./src/config/supabase');

const targetQuestionSnippet = "rotates it laterally";

async function run() {
  console.log('Starting Gluteus Maximus MCQ update...');

  // 1. Update mobile-app/src/data/repository/course2/s-2-2-situational.js
  const mobileFilePath = path.join(__dirname, '../mobile-app/src/data/repository/course2/s-2-2-situational.js');
  if (fs.existsSync(mobileFilePath)) {
    console.log(`Updating ${mobileFilePath}...`);
    const fileContent = fs.readFileSync(mobileFilePath, 'utf8');
    const startIdx = fileContent.indexOf('{');
    const endIdx = fileContent.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      const jsonStr = fileContent.substring(startIdx, endIdx + 1);
      const data = JSON.parse(jsonStr);

      let found = false;
      for (const topicKey in data) {
        const questions = data[topicKey];
        if (Array.isArray(questions)) {
          for (const q of questions) {
            if (q.question && q.question.includes(targetQuestionSnippet)) {
              console.log(`Found question in mobile-app repository: "${q.question}"`);
              q.options = [
                "Gluteus maximus",
                "Sartorius",
                "Tensor fasciae latae",
                "Obturator externus",
                "Semitendinosus"
              ];
              q.correctIndex = 0;
              q.explanation = "The correct answer is Gluteus maximus.";
              found = true;
              break;
            }
          }
        }
        if (found) break;
      }

      if (found) {
        const newContent = `export const s_2_2_situational = ${JSON.stringify(data, null, 2)};\n`;
        fs.writeFileSync(mobileFilePath, newContent, 'utf8');
        console.log('✅ mobile-app situational file updated successfully.');
      } else {
        console.error('❌ Question not found in mobile-app situational file.');
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
    
    let found = false;
    for (const subKey in data) {
      for (const topicKey in data[subKey]) {
        const topic = data[subKey][topicKey];
        if (topic.situational && Array.isArray(topic.situational)) {
          for (const q of topic.situational) {
            if (q.question && q.question.includes(targetQuestionSnippet)) {
              console.log(`Found question in backend anatomyData: "${q.question}"`);
              q.options = [
                "Gluteus maximus",
                "Sartorius",
                "Tensor fasciae latae",
                "Obturator externus",
                "Semitendinosus"
              ];
              q.correctIndex = 0;
              q.correctAnswer = 0;
              q.explanation = "Correct answer: Gluteus maximus";
              found = true;
              break;
            }
          }
        }
        if (found) break;
      }
      if (found) break;
    }

    if (found) {
      const newContent = `module.exports = ${JSON.stringify(data, null, 2)};\n`;
      fs.writeFileSync(backendFilePath, newContent, 'utf8');
      console.log('✅ backend data file updated successfully.');
    } else {
      console.error('❌ Question not found in backend data file.');
    }
  } else {
    console.error(`❌ Backend file not found at ${backendFilePath}`);
  }

  // 3. Update Supabase
  console.log('Connecting to Supabase...');
  const targetId = '9db83662-5469-4e06-b3b6-5e273b684230';
  
  const { data: dbMcq, error: fetchError } = await supabaseAdmin
    .from('mcqs')
    .select('id, question, options, correct_index')
    .eq('id', targetId)
    .single();

  if (fetchError) {
    console.error('❌ Error fetching from Supabase:', fetchError);
    return;
  }

  if (dbMcq) {
    console.log(`Updating DB MCQ ID: ${dbMcq.id} for "${dbMcq.question}"`);
    const { error: updateError } = await supabaseAdmin
      .from('mcqs')
      .update({
        options: [
          "Gluteus maximus",
          "Sartorius",
          "Tensor fasciae latae",
          "Obturator externus",
          "Semitendinosus"
        ],
        correct_index: 0,
        explanation: "Correct answer: Gluteus maximus"
      })
      .eq('id', targetId);

    if (updateError) {
      console.error(`❌ Error updating MCQ ID ${targetId}:`, updateError);
    } else {
      console.log('✅ DB Update complete.');
    }
  } else {
    console.warn(`⚠️ Warning: MCQ ID ${targetId} not found in DB.`);
  }
}

run().catch(err => {
  console.error('Unexpected error:', err);
});
