const fs = require('fs');

const raw = fs.readFileSync('c:/samu_mcq/scratch/topic8_raw.txt', 'utf8');

const questions = [];
let currentQuestion = null;

const lines = raw.split('\n');
for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    if (line === '---') continue;

    // match "## Question X" or "**11. What is..." or "How are chelates..."
    if (line.match(/^## Question \d+/) || line.match(/^\*\*\d+\./) || (line.match(/^[A-Z]/) && !line.match(/^[a-d]\./) && !line.match(/^\*\*[a-d]\./))) {
        // If it starts with ## Question X, we just skip it, the next line is the question text
        if (line.match(/^## Question \d+/)) {
            continue;
        }

        let qText = line.replace(/^\*\*\d+\.\s*/, '').replace(/\*\*$/, '');
        
        currentQuestion = {
            question: qText,
            options: [],
            correctIndex: -1,
            explanation: ""
        };
        questions.push(currentQuestion);
    } else if (line.match(/^[a-d]\.\s/) || line.match(/^\*\*[a-d]\.\s/)) {
        let isCorrect = line.startsWith('**');
        let optText = line.replace(/^\*\*[a-d]\.\s*/, '').replace(/^[a-d]\.\s*/, '').replace(/\*\*$/, '').trim();
        
        if (currentQuestion) {
            currentQuestion.options.push(optText);
            if (isCorrect) {
                currentQuestion.correctIndex = currentQuestion.options.length - 1;
            }
        }
    }
}

// Ensure explanations
for (let q of questions) {
    if (q.correctIndex !== -1 && q.options[q.correctIndex]) {
        q.explanation = "The correct answer is '" + q.options[q.correctIndex] + "'. This choice aligns with the established clinical curriculum.";
    }
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

const newContent = 'export const s_1_10 = ' + JSON.stringify(s_1_10, null, 2) + ';';
fs.writeFileSync(filePath, newContent, 'utf8');

console.log('Successfully updated s-1-10.js with ' + questions.length + ' questions for t-s-1-10-7');
