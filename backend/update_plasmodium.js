const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const SUBJECT_ID = 'b3454f82-8aa2-49c0-b8c5-bb25bcaf9c10';

async function run() {
  console.log('1. Updating Supabase MCQ with ID d4a8f599-2769-4a71-afa5-c6e8c4225c87...');
  const updatedOptionsDb = [
    "Blood",
    "Colon",
    "Small intestine",
    "Genitourinary tract"
  ];

  const { error: updateError } = await supabase
    .from('mcqs')
    .update({
      options: updatedOptionsDb,
      correct_index: 0
    })
    .eq('id', 'd4a8f599-2769-4a71-afa5-c6e8c4225c87');

  if (updateError) {
    console.error('Error updating Supabase:', updateError);
    return;
  }
  console.log('Supabase database updated successfully.');

  // Update local JS files
  const localPaths = [
    'c:/samu_mcq/mobile-app/src/data/repository/course1/s-1-8.js',
    'c:/samu_mcq/student-web/src/data/course1/s-1-8.js'
  ];

  const updatedOptionsLocal = [
    "*d. Blood",
    "a. Colon",
    "b. Small intestine",
    "c. Genitourinary tract"
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

    if (obj['t-s-1-8-15']) {
      const testQs = obj['t-s-1-8-15'].test || [];
      let found = false;
      testQs.forEach(q => {
        if (q.question.toLowerCase().includes('plasmodium falciparum') && q.question.toLowerCase().includes('organ ')) {
          q.options = updatedOptionsLocal;
          q.correctIndex = 0;
          found = true;
        }
      });

      if (found) {
        const newContent = `export const ${varName} = ${JSON.stringify(obj, null, 2)};\n`;
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated local file successfully.`);
      } else {
        console.log('Target question not found in local file!');
      }
    } else {
      console.log('Topic t-s-1-8-15 not found in local file!');
    }
  });

  console.log('All updates complete.');
}

run().catch(console.error);
