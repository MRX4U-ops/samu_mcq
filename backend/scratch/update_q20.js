const fs = require('fs');
const path = require('path');
const { supabaseAdmin } = require('../src/config/supabase');
require('dotenv').config();

const TOPIC_ID = '56d847c3-e627-4cb4-84a5-deac4b0c7d5d';
const qText = 'Which of the following serotypes of Salmonella can cause gastroenteritis?';

async function updateQ20() {
  try {
    // 1. Update Database
    console.log('🔍 Finding MCQ in database...');
    const { data: mcq, error: findError } = await supabaseAdmin
      .from('mcqs')
      .select('id, options')
      .eq('topic_id', TOPIC_ID)
      .eq('question', qText)
      .single();

    if (findError || !mcq) {
      console.error('❌ Could not find MCQ in DB:', findError ? findError.message : 'Not found');
      process.exit(1);
    }
    console.log('✅ Found MCQ:', mcq.id);

    const newOptions = ["S. cholerae suis.", "All are true", "S. Newport.", "S. Enteritidis."];
    const newExplanation = "S. cholerae suis. is correct. This aligns with standard microbiology and immunology curriculum.";

    console.log('🚀 Updating MCQ in database...');
    const { error: updateError } = await supabaseAdmin
      .from('mcqs')
      .update({
        options: newOptions,
        explanation: newExplanation
      })
      .eq('id', mcq.id);

    if (updateError) {
      console.error('❌ Error updating DB MCQ:', updateError.message);
      process.exit(1);
    }
    console.log('✅ Successfully updated MCQ in DB.');

    // 2. Update Local File
    console.log('📂 Loading local s-2-10.js...');
    const filePath = path.join(__dirname, '../../mobile-app/src/data/repository/course2/s-2-10.js');
    let fileContent = fs.readFileSync(filePath, 'utf8');

    // Locate the question block for Q20.
    // It looks like:
    // {
    //   "question": "Which of the following serotypes of Salmonella can cause gastroenteritis?",
    //   "options": [
    //     "All are true.",
    //     "S. cholerae suis",
    //     "S. Newport.",
    //     "S. Enteritidis."
    //   ],
    //   "correctIndex": 0,
    //   "explanation": "All are true. is correct. This aligns with standard microbiology and immunology curriculum."
    // }
    const targetBlock = `    {\n` +
      `      "question": "Which of the following serotypes of Salmonella can cause gastroenteritis?",\n` +
      `      "options": [\n` +
      `        "All are true.",\n` +
      `        "S. cholerae suis",\n` +
      `        "S. Newport.",\n` +
      `        "S. Enteritidis."\n` +
      `      ],\n` +
      `      "correctIndex": 0,\n` +
      `      "explanation": "All are true. is correct. This aligns with standard microbiology and immunology curriculum."\n` +
      `    }`;

    const replacementBlock = `    {\n` +
      `      "question": "Which of the following serotypes of Salmonella can cause gastroenteritis?",\n` +
      `      "options": [\n` +
      `        "S. cholerae suis.",\n` +
      `        "All are true",\n` +
      `        "S. Newport.",\n` +
      `        "S. Enteritidis."\n` +
      `      ],\n` +
      `      "correctIndex": 0,\n` +
      `      "explanation": "S. cholerae suis. is correct. This aligns with standard microbiology and immunology curriculum."\n` +
      `    }`;

    if (!fileContent.includes(targetBlock)) {
      // Let's check with standard windows carriage returns just in case
      const targetBlockCRLF = targetBlock.replace(/\n/g, '\r\n');
      const replacementBlockCRLF = replacementBlock.replace(/\n/g, '\r\n');
      if (fileContent.includes(targetBlockCRLF)) {
        fileContent = fileContent.replace(targetBlockCRLF, replacementBlockCRLF);
      } else {
        console.error('❌ Could not find exact Question 20 block in s-2-10.js for replacement.');
        process.exit(1);
      }
    } else {
      fileContent = fileContent.replace(targetBlock, replacementBlock);
    }

    fs.writeFileSync(filePath, fileContent, 'utf8');
    console.log('✅ Successfully updated local s-2-10.js file.');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

updateQ20();
