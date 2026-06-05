const fs = require('fs');
const path = require('path');

// 1. Read raw submitted text
const rawText = fs.readFileSync('c:\\samu_mcq\\scratch\\raw_topics_submitted.txt', 'utf8');

// 2. Separate into lines and group by Topic 1-15
const lines = rawText.split('\n');
const topicsLines = {};
for (let i = 1; i <= 15; i++) {
    topicsLines[i] = [];
}

let currentTopicNum = 0;
for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    const match1 = trimmed.match(/SITUATIONAL TOPIC\s+(\d+)/i);
    const match2 = trimmed.match(/t\.v[\.\/,\s]+Topic\s+(\d+)/i);
    const match3 = trimmed.match(/^TOPIC\s+(\d+)/i);
    const match4 = trimmed.match(/t\.v\/13/i);
    
    let topicNum = null;
    if (match1) topicNum = parseInt(match1[1]);
    else if (match2) topicNum = parseInt(match2[1]);
    else if (match3) topicNum = parseInt(match3[1]);
    else if (match4) topicNum = 13;
    
    if (topicNum >= 1 && topicNum <= 15) {
        currentTopicNum = topicNum;
    } else {
        if (currentTopicNum >= 1 && currentTopicNum <= 15) {
            topicsLines[currentTopicNum].push(line);
        }
    }
}

// 3. Helper to parse a single topic's lines
function parseTopic(lines, topicNum) {
    const text = lines.join('\n').trim();
    const questionBlocks = [];
    const splitRegex = /(?:^|\n)\s*(\d+)\.\s+/g;
    let match;
    let lastIdx = 0;
    
    while ((match = splitRegex.exec(text)) !== null) {
        if (match.index > lastIdx) {
            const block = text.substring(lastIdx, match.index).trim();
            if (block) questionBlocks.push(block);
        }
        lastIdx = splitRegex.lastIndex;
    }
    const finalBlock = text.substring(lastIdx).trim();
    if (finalBlock) questionBlocks.push(finalBlock);
    
    const questions = [];
    for (let block of questionBlocks) {
        if (block.includes('{') && block.includes('}')) {
            // GIFT format
            const openBrace = block.indexOf('{');
            const closeBrace = block.indexOf('}');
            const qText = block.substring(0, openBrace).trim().replace(/\s+/g, ' ');
            const optionsText = block.substring(openBrace + 1, closeBrace).trim();
            const optionLines = optionsText.split('\n').map(l => l.trim()).filter(l => l);
            
            let options = [];
            let correctOptionIdx = 0;
            optionLines.forEach((l, idx) => {
                let clean = l;
                if (l.startsWith('=') || l.startsWith('~')) {
                    clean = l.substring(1).trim();
                }
                if (l.startsWith('=')) {
                    correctOptionIdx = idx;
                }
                options.push(clean);
            });
            const correctOpt = options[correctOptionIdx];
            const others = options.filter((_, idx) => idx !== correctOptionIdx);
            const rearranged = [correctOpt, ...others];
            questions.push({ question: qText, options: rearranged });
        } else {
            // Plain text format
            const blockLines = block.split('\n').map(l => l.trim()).filter(l => l);
            const mergedLines = [];
            blockLines.forEach(l => {
                if (mergedLines.length === 0) {
                    mergedLines.push(l);
                } else {
                    const isContinuation = !l.match(/^[A-Z\(\d]/) || 
                                           l.match(/^(interossei|by portal hypertension|of its numerous valves|is severed|to the stability)/) ||
                                           l.match(/^[a-z]/);
                    if (isContinuation) {
                        mergedLines[mergedLines.length - 1] += " " + l;
                    } else {
                        mergedLines.push(l);
                    }
                }
            });
            if (mergedLines.length >= 6) {
                const options = mergedLines.slice(-5);
                const qParts = mergedLines.slice(0, -5);
                const qText = qParts.join(' ').trim().replace(/\s+/g, ' ');
                questions.push({ question: qText, options: options });
            } else {
                const qText = mergedLines[0] || "";
                const options = mergedLines.slice(1);
                questions.push({ question: qText, options: options });
            }
        }
    }
    return questions;
}

// 4. Parse all topics
const parsedTopics = {};
for (let i = 1; i <= 15; i++) {
    parsedTopics[i] = parseTopic(topicsLines[i], i);
    console.log(`Topic ${i}: Parsed ${parsedTopics[i].length} questions`);
}

// 5. Generate mobile repository s-2-2-situational.js
const mobileObj = {};
for (let i = 1; i <= 15; i++) {
    const key = `t-s-2-2-${i - 1}`; // 0-indexed
    mobileObj[key] = parsedTopics[i].map(q => {
        // Clean explanation format: "The correct answer is [Answer]."
        // Make sure it matches standard mobile format and ends with a period if it doesn't already.
        let ansText = q.options[0];
        if (ansText.endsWith('.')) {
            ansText = ansText.substring(0, ansText.length - 1);
        }
        return {
            question: q.question,
            options: q.options,
            correctIndex: 0,
            explanation: `The correct answer is ${ansText}.`
        };
    });
}
const mobileFileContent = "export const s_2_2_situational = " + JSON.stringify(mobileObj, null, 2) + ";\n";
fs.writeFileSync('c:\\samu_mcq\\mobile-app\\src\\data\\repository\\course2\\s-2-2-situational.js', mobileFileContent, 'utf8');
console.log('Mobile repository updated successfully!');

// 6. Update backend anatomyData.js (Only the situational array under s-2-2)
const backendData = require('../backend/src/data/anatomyData.js');
if (!backendData['s-2-2']) {
    throw new Error('s-2-2 not found in anatomyData.js!');
}

for (let i = 1; i <= 15; i++) {
    const key = `t-s-2-2-${i}`; // 1-indexed
    if (!backendData['s-2-2'][key]) {
        throw new Error(`${key} not found in s-2-2 of anatomyData.js!`);
    }
    
    // Replace only situational array
    backendData['s-2-2'][key].situational = parsedTopics[i].map(q => {
        return {
            question: q.question,
            options: q.options,
            correctIndex: 0,
            correctAnswer: 0,
            explanation: `Correct answer: ${q.options[0]}`
        };
    });
}

const backendFileContent = "module.exports = " + JSON.stringify(backendData, null, 2) + ";\n";
fs.writeFileSync('c:\\samu_mcq\\backend\\src\\data\\anatomyData.js', backendFileContent, 'utf8');
console.log('Backend repository updated successfully!');
