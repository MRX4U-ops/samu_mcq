const fs = require('fs');
const path = require('path');
const { supabaseAdmin } = require('../src/config/supabase');
require('dotenv').config();

const TOPIC_ID = '56d847c3-e627-4cb4-84a5-deac4b0c7d5d';
const qText = 'What is the primary cause of death from Salmonella typhi (Typhoid fever)?';

async function updateQ5() {
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

    const newOptions = ["Hemorrhaging necrosis", "Toxemia", "Vomiting", "High fever"];
    const newExplanation = "Hemorrhaging necrosis is correct. This aligns with standard microbiology and immunology curriculum.";

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

    // We can parse the file programmatically, or do a replacement of the specific JSON structure.
    // Let's locate the question block for Q5.
    // It looks like:
    // {
    //   "question": "What is the primary cause of death from Salmonella typhi (Typhoid fever)?",
    //   "options": [
    //     "Toxemia",
    //     "Hemorrhaging necrosis",
    //     "Vomiting",
    //     "High fever"
    //   ],
    //   "correctIndex": 0,
    //   "explanation": "Toxemia is correct. This aligns with standard microbiology and immunology curriculum."
    // }
    const targetBlock = `    {\n` +
      `      "question": "What is the primary cause of death from Salmonella typhi (Typhoid fever)?",\n` +
      `      "options": [\n` +
      `        "Toxemia",\n` +
      `        "Hemorrhaging necrosis",\n` +
      `        "Vomiting",\n` +
      `        "High fever"\n` +
      `      ],\n` +
      `      "correctIndex": 0,\n` +
      `      "explanation": "Toxemia is correct. This aligns with standard microbiology and immunology curriculum."\n` +
      `    }`;

    const replacementBlock = `    {\n` +
      `      "question": "What is the primary cause of death from Salmonella typhi (Typhoid fever)?",\n` +
      `      "options": [\n` +
      `        "Hemorrhaging necrosis",\n` +
      `        "Toxemia",\n` +
      `        "Vomiting",\n` +
      `        "High fever"\n` +
      `      ],\n` +
      `      "correctIndex": 0,\n` +
      `      "explanation": "Hemorrhaging necrosis is correct. This aligns with standard microbiology and immunology curriculum."\n` +
      `    }`;

    if (!fileContent.includes(targetBlock)) {
      // Let's check with standard windows carriage returns just in case
      const targetBlockCRLF = targetBlock.replace(/\n/g, '\r\n');
      const replacementBlockCRLF = replacementBlock.replace(/\n/g, '\r\n');
      if (fileContent.includes(targetBlockCRLF)) {
        fileContent = fileContent.replace(targetBlockCRLF, replacementBlockCRLF);
      } else {
        console.error('❌ Could not find exact Question 5 block in s-2-10.js for replacement.');
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

updateQ5();
