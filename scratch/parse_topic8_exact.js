const fs = require('fs');

const raw = fs.readFileSync('c:/samu_mcq/scratch/topic8_raw.txt', 'utf8');

const questions = [];
let currentQuestion = null;

const lines = raw.split('\n');
for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    if (line === '---') continue;

    if (line.match(/^## Question \d+/)) {
        continue;
    }

    if (line.match(/^[a-d]\.\s/) || line.match(/^\*\*[a-d]\.\s/)) {
        let isCorrect = line.startsWith('**');
        let optText = line.replace(/^\*\*[a-d]\.\s*/, '').replace(/^[a-d]\.\s*/, '').replace(/\*\*$/, '').trim();
        
        if (currentQuestion) {
            currentQuestion.options.push(optText);
            if (isCorrect) {
                currentQuestion.correctIndex = currentQuestion.options.length - 1;
            }
        }
    } else {
        // This is a question line
        // Keep it EXACTLY as the user shared, but remove the ** markdown if they bolded it
        let qText = line.replace(/^\*\*/, '').replace(/\*\*$/, '').trim();
        
        currentQuestion = {
            question: qText,
            options: [],
            correctIndex: -1
        };
        questions.push(currentQuestion);
    }
}

// Ensure explanations are EMPTY (no changes added)
for (let q of questions) {
    q.explanation = "";
}

// Now replace in s-1-10.js
const filePath = 'c:/samu_mcq/mobile-app/src/data/repository/course1/s-1-10.js';
const content = fs.readFileSync(filePath, 'utf8');
const objStr = content.replace('export const s_1_10 = ', '');
let s_1_10;
try {
    eval('s_1_10 = ' + objStr);
} catch(e) {
    console.error('Eval error', e);
    process.exit(1);
}

s_1_10['t-s-1-10-7'] = questions;

const newContent = 'export const s_1_10 = ' + JSON.stringify(s_1_10, null, 2) + ';\n';
fs.writeFileSync(filePath, newContent, 'utf8');

console.log('Successfully updated s-1-10.js with exact text for t-s-1-10-7');
