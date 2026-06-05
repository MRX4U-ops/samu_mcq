const fs = require('fs');

const raw = fs.readFileSync('c:/samu_mcq/scratch/topic9_raw.txt', 'utf8');

const questions = [];
let currentQuestion = null;

const lines = raw.split('\n');
for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    if (line === '---') continue;
    if (line.match(/^\*\*Answer:/i)) continue;

    // Identifying a question: Starts with "**NUMBER. "
    if (line.match(/^\*\*\d+\.\s/)) {
        let qText = line.replace(/^\*\*/, '').replace(/\*\*$/, '').trim();
        
        currentQuestion = {
            question: qText,
            options: [],
            correctIndex: -1,
            explanation: ""
        };
        questions.push(currentQuestion);
    } 
    // Identifying options: "a. ", "b. ", "c. ", "d. " or "**a. "
    else if (line.match(/^[a-d]\.\s/) || line.match(/^\*\*[a-d]\.\s/)) {
        let isCorrect = line.startsWith('**') || line.includes('✅');
        let optText = line.replace(/^\*\*[a-d]\.\s*/, '').replace(/^[a-d]\.\s*/, '').replace(/\*\*$/, '').replace(/✅/g, '').trim();
        
        if (currentQuestion) {
            currentQuestion.options.push(optText);
            if (isCorrect) {
                currentQuestion.correctIndex = currentQuestion.options.length - 1;
            }
        }
    }
}

// Now replace in s-1-10.js for Topic 9 (t-s-1-10-8)
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

s_1_10['t-s-1-10-8'] = questions;

const newContent = 'export const s_1_10 = ' + JSON.stringify(s_1_10, null, 2) + ';\n';
fs.writeFileSync(filePath, newContent, 'utf8');

console.log('Successfully updated s-1-10.js with exact text for t-s-1-10-8');
