const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const TOPIC_ID = '1f9d1ae2-1070-430f-ba80-36a2c12c6977'; // Topic 12 of Medical Biology

const targetQuestionText = "What is the formula for the karyotype of a patient with Edwards syndrome:";
const correctedOptions = [
  "*d. 47, XY , 18+",
  "a. 47, XY , 21+",
  "b. 47, XY , 13+",
  "c. 46, XX , 5p-"
];

async function run() {
  console.log('1. Updating Edwards Syndrome question in Supabase...');
  const { data: mcqs, error: fetchError } = await supabase
    .from('mcqs')
    .select('id, question')
    .eq('topic_id', TOPIC_ID)
    .eq('task_type', 'test_question');

  if (fetchError) {
    console.error('Error fetching MCQs:', fetchError);
    return;
  }

  const targetMcq = mcqs.find(m => m.question.trim() === targetQuestionText);
  if (targetMcq) {
    const { error: updateError } = await supabase
      .from('mcqs')
      .update({
        options: correctedOptions,
        correct_index: 0
      })
      .eq('id', targetMcq.id);

    if (updateError) {
      console.error('Error updating MCQ:', updateError);
      return;
    }
    console.log('Database MCQ updated successfully.');
  } else {
    console.log('Target MCQ not found in database!');
  }

  // Update local JS files
  const localPaths = [
    'c:/samu_mcq/mobile-app/src/data/repository/course1/s-1-8.js',
    'c:/samu_mcq/student-web/src/data/course1/s-1-8.js'
  ];

  localPaths.forEach(filePath => {
    console.log(`Updating local file: ${filePath}`);
    if (!fs.existsSync(filePath)) {
      console.log('File does not exist, skipping.');
      return;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/export const (\w+)\s*=\s*(\{[\s\S]+\});/);
    if (!match) {
      console.log('No export match found, skipping.');
      return;
    }
    
    const varName = match[1];
    const obj = eval('(' + match[2] + ')');

    if (obj['t-s-1-8-11'] && obj['t-s-1-8-11'].test) {
      const qObj = obj['t-s-1-8-11'].test.find(q => q.question.trim() === targetQuestionText);
      if (qObj) {
        qObj.options = correctedOptions;
        qObj.correctIndex = 0;
        
        const newContent = `export const ${varName} = ${JSON.stringify(obj, null, 2)};\n`;
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated local file successfully.`);
      } else {
        console.log('Question not found in local file!');
      }
    } else {
      console.log('Topic t-s-1-8-11 not found in local file!');
    }
  });

  console.log('All updates complete.');
}

run().catch(console.error);
