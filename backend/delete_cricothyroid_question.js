const fs = require('fs');
const path = require('path');
const { supabaseAdmin } = require('./src/config/supabase');

async function run() {
  console.log('Starting Cricothyroid MCQ deletion...');

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
        const initialLength = topicQuestions.length;
        data['t-s-2-2-5'] = topicQuestions.filter(q => !q.question || !q.question.includes('cricothyroid ligament'));
        const newLength = data['t-s-2-2-5'].length;

        if (newLength < initialLength) {
          const newContent = `export const s_2_2_situational = ${JSON.stringify(data, null, 2)};\n`;
          fs.writeFileSync(mobileFilePath, newContent, 'utf8');
          console.log(`✅ mobile-app file updated successfully. Removed ${initialLength - newLength} question(s).`);
        } else {
          console.warn('⚠️ Question not found in mobile-app file.');
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
      const initialLength = topic.situational.length;
      topic.situational = topic.situational.filter(q => !q.question || !q.question.includes('cricothyroid ligament'));
      const newLength = topic.situational.length;

      if (newLength < initialLength) {
        const newContent = `module.exports = ${JSON.stringify(data, null, 2)};\n`;
        fs.writeFileSync(backendFilePath, newContent, 'utf8');
        console.log(`✅ backend data file updated successfully. Removed ${initialLength - newLength} question(s).`);
      } else {
        console.warn('⚠️ Question not found in backend data file.');
      }
    } else {
      console.error('❌ s-2-2 -> t-s-2-2-6 -> situational not found in backend data.');
    }
  } else {
    console.error(`❌ Backend file not found at ${backendFilePath}`);
  }

  // 3. Delete from Supabase
  console.log('Connecting to Supabase...');
  const targetId = '1b73c2d0-6d3c-48db-a98e-3652f1a585f3';

  const { data: dbMcq, error: fetchError } = await supabaseAdmin
    .from('mcqs')
    .select('id, question')
    .eq('id', targetId)
    .single();

  if (fetchError) {
    console.error('❌ Error fetching from Supabase (or already deleted):', fetchError);
  } else if (dbMcq) {
    console.log(`Deleting DB MCQ ID: ${dbMcq.id} ("${dbMcq.question.substring(0, 60)}...")`);
    const { error: deleteError } = await supabaseAdmin
      .from('mcqs')
      .delete()
      .eq('id', targetId);

    if (deleteError) {
      console.error(`❌ Error deleting MCQ ID ${targetId}:`, deleteError);
    } else {
      console.log('✅ DB deletion complete.');
    }
  } else {
    console.warn(`⚠️ Warning: MCQ ID ${targetId} not found in DB.`);
  }
}

run().catch(err => {
  console.error('Unexpected error:', err);
});
