const fs = require('fs');

const rawText = fs.readFileSync('c:\\samu_mcq\\scratch\\raw_topics_submitted.txt', 'utf8');

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

let allValid = true;
for (let i = 1; i <= 15; i++) {
    const parsed = parseTopic(topicsLines[i], i);
    parsed.forEach((q, idx) => {
        const expectedOptionsCount = (i === 2 && idx === 9) || (i === 13 && idx === 3) ? 4 : 5;
        if (q.options.length !== expectedOptionsCount) {
            console.error(`ERROR: Topic ${i} Question ${idx + 1} has ${q.options.length} options instead of ${expectedOptionsCount}!`);
            console.error(`Question: "${q.question}"`);
            console.error(`Options:`, q.options);
            allValid = false;
        }
        q.options.forEach((opt, optIdx) => {
            if (!opt.trim()) {
                console.error(`ERROR: Topic ${i} Question ${idx + 1} Option ${optIdx + 1} is empty!`);
                allValid = false;
            }
        });
    });
}

if (allValid) {
    console.log('SUCCESS: All questions parsed perfectly! Every question has exactly the expected number of options (5, or 4 for specific cases) with non-empty content.');
} else {
    console.log('FAILED: Validation found some issues.');
}
