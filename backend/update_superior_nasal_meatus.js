const fs = require('fs');
const path = require('path');
const { supabaseAdmin } = require('./src/config/supabase');

async function run() {
  console.log('Starting Superior Nasal Meatus MCQ update...');

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

      const topicQuestions = data['t-s-2-2-5'];
      if (Array.isArray(topicQuestions)) {
        let found = false;
        for (const q of topicQuestions) {
          if (q.question && q.question.includes('superior nasal meatus')) {
            console.log(`Found question in mobile-app repository: "${q.question}"`);
            q.options = [
              "Posterior ethmoidal sinus",
              "Middle ethmoidal sinus",
              "Maxillary sinus",
              "Anterior ethmoidal sinus",
              "Frontal sinus"
            ];
            q.correctIndex = 0;
            q.explanation = "The correct answer is Posterior ethmoidal sinus.";
            found = true;
            break;
          }
        }

        if (found) {
          const newContent = `export const s_2_2_situational = ${JSON.stringify(data, null, 2)};\n`;
          fs.writeFileSync(mobileFilePath, newContent, 'utf8');
          console.log('✅ mobile-app file updated successfully.');
        } else {
          console.error('❌ Question not found in mobile-app file.');
        }
      } else {
        console.error('❌ t-s-2-2-5 not found or not an array in mobile file.');
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
    if (topic && Array.isArray(topic.situational)) {
      let found = false;
      for (const q of topic.situational) {
        if (q.question && q.question.includes('superior nasal meatus')) {
          console.log(`Found question in backend anatomyData: "${q.question}"`);
          q.options = [
            "Posterior ethmoidal sinus",
            "Middle ethmoidal sinus",
            "Maxillary sinus",
            "Anterior ethmoidal sinus",
            "Frontal sinus"
          ];
          q.correctIndex = 0;
          q.correctAnswer = 0;
          q.explanation = "Correct answer: Posterior ethmoidal sinus";
          found = true;
          break;
        }
      }

      if (found) {
        const newContent = `module.exports = ${JSON.stringify(data, null, 2)};\n`;
        fs.writeFileSync(backendFilePath, newContent, 'utf8');
        console.log('✅ backend data file updated successfully.');
      } else {
        console.error('❌ Question not found in backend data file.');
      }
    } else {
      console.error('❌ s-2-2 -> t-s-2-2-6 -> situational not found in backend data.');
    }
  } else {
    console.error(`❌ Backend file not found at ${backendFilePath}`);
  }

  // 3. Update Supabase
  console.log('Connecting to Supabase...');
  const targetId = '909ab67a-0ffd-41a7-8d82-a9d13f8f22da';

  const { data: dbMcq, error: fetchError } = await supabaseAdmin
    .from('mcqs')
    .select('id, question')
    .eq('id', targetId)
    .single();

  if (fetchError) {
    console.error('❌ Error fetching from Supabase:', fetchError);
  } else if (dbMcq) {
    console.log(`Updating DB MCQ ID: ${dbMcq.id}`);
    const { error: updateError } = await supabaseAdmin
      .from('mcqs')
      .update({
        options: [
          "Posterior ethmoidal sinus",
          "Middle ethmoidal sinus",
          "Maxillary sinus",
          "Anterior ethmoidal sinus",
          "Frontal sinus"
        ],
        correct_index: 0,
        explanation: "Correct answer: Posterior ethmoidal sinus"
      })
      .eq('id', targetId);

    if (updateError) {
      console.error(`❌ Error updating MCQ ID ${targetId}:`, updateError);
    } else {
      console.log('✅ DB update complete.');
    }
  } else {
    console.warn(`⚠️ Warning: MCQ ID ${targetId} not found in DB.`);
  }
}

run().catch(err => {
  console.error('Unexpected error:', err);
});
