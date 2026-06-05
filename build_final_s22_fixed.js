const fs = require('fs');

const extractTopics = () => {
    const files = [
        'format_s22_all.js',
        'append_topics.js',
        'append_topics_2.js',
        'append_topics_3.js'
    ];
    let allContent = '';
    files.forEach(f => {
        if (fs.existsSync(f)) {
            allContent += fs.readFileSync(f, 'utf8') + '\n\n';
        }
    });
    
    const topics = [];
    for (let i = 1; i <= 15; i++) {
        const regex = new RegExp(`const topic${i} = \\\`([\\s\\S]*?)\\\`;`);
        const match = allContent.match(regex);
        if (match) {
            topics[i] = match[1];
        } else {
            console.error(`Could not find topic${i}`);
        }
    }
    return topics;
};

const topicsText = extractTopics();

function parseTopicText(rawText) {
    // 1. Remove topic headers
    let text = rawText.replace(/SITUATIONAL TOPIC \d+/g, '')
                      .replace(/TOPIC \d+/g, '')
                      .replace(/t\.v\.\/\s*Topic \d+/g, '')
                      .replace(/t\.v\/\s*Topic \d+/g, '')
                      .replace(/t\.v,\/Topic \d+/g, '')
                      .replace(/t\.v\.\/13/g, '')
                      .trim();
    
    // Split into unformatted and formatted
    // Formatted part starts at the first occurrence of `{`
    let formattedStartIdx = text.indexOf('{');
    
    let unformattedText = "";
    let formattedText = "";
    
    if (formattedStartIdx !== -1) {
        // Backtrack to the start of the question that contains `{`
        let lastNewline = text.lastIndexOf('\n', formattedStartIdx);
        // Sometimes question is multiple lines. We need to backtrack until we hit the end of the previous options.
        // Actually, let's just split by `\n` and find the line containing `{` and backtrack to previous `?` or `:` or `}`
        // It's easier: replace all `{\n` with `{`
        
        // Let's use regex to extract all formatted blocks: 
        // A formatted block is something that has a question ending in { ... }
        // We can just extract them directly.
    }
    
    // Better strategy:
    // Formatted questions always end with `}`.
    // Unformatted questions don't have `{` or `}`.
    
    // Let's extract formatted questions first
    let qs = [];
    
    // Match anything followed by { ... }
    const formattedRegex = /([^}]+?)\{\s*([\s\S]*?)\}/g;
    let match;
    let unformattedBlocks = [];
    let lastIndex = 0;
    
    while ((match = formattedRegex.exec(text)) !== null) {
        unformattedBlocks.push(text.substring(lastIndex, match.index));
        
        const qText = match[1].trim().replace(/\n/g, ' ').replace(/^\d+\.\s*/, '');
        const opts = match[2].trim().split('\n').filter(l => l.trim()).map(l => {
            let o = l.trim();
            if (o.startsWith('=') || o.startsWith('~')) o = o.substring(1).trim();
            return o;
        });
        if (qText) {
            qs.push({ question: qText, options: opts, isFormatted: true });
        }
        lastIndex = formattedRegex.lastIndex;
    }
    unformattedBlocks.push(text.substring(lastIndex));
    
    // Now parse unformatted text from unformattedBlocks
    let unformattedQs = [];
    unformattedBlocks.forEach(block => {
        const lines = block.split('\n').map(l => l.trim()).filter(l => l);
        let currentQ = "";
        
        for(let i=0; i<lines.length; i++) {
            let line = lines[i];
            line = line.replace(/^\d+\.\s*/, '');
            
            currentQ += (currentQ ? " " : "") + line;
            
            // Check if question ends
            if(line.endsWith('?') || line.endsWith(':') || line.endsWith(') Costocervical trunk') || (line.endsWith('that') && currentQ.includes('explains to them that'))) {
                
                let currentOpts = [];
                let nextQuestionIdx = i + 1;
                
                // Find next question start
                // A new question usually ends with ? or : eventually
                // We'll peek ahead to find the next line that ends with ? or :
                let foundNext = false;
                let j = i + 1;
                for (; j < lines.length; j++) {
                    if (lines[j].endsWith('?') || lines[j].endsWith(':') || lines[j].endsWith(') Costocervical trunk') || lines[j].endsWith('that')) {
                        // Found the end of the NEXT question.
                        // We need to backtrack to where the NEXT question started.
                        // The next question starts immediately after the previous options.
                        foundNext = true;
                        break;
                    }
                }
                
                if (foundNext) {
                    // The lines from i+1 to j belong to (options for current) + (question text for next)
                    // Options are exactly 5 logical items. However, some might be split on newlines.
                    // Instead of counting lines, we know the next question starts with a capital letter and is a sentence.
                    // Common starts: "A ", "An ", "The ", "During ", "If ", "An "
                    
                    // Let's just collect all lines from i+1 to lines.length, until we hit a line that looks like a question start
                    let optsRaw = [];
                    let k = i + 1;
                    
                    if (line.endsWith(') Costocervical trunk')) {
                        currentQ = currentQ.replace(') Costocervical trunk', ')');
                        optsRaw.push('Costocervical trunk');
                    }
                    
                    while (k < lines.length) {
                        let l = lines[k];
                        // If it's the start of a new question
                        if (k > i+1 && (l.match(/^(A |An |The |During |If |An |While |An elderly |A \d+-year-old|A patient|A young)/))) {
                            // Check if this line actually belongs to a question that ends with ?
                            // By scanning forward
                            let isQ = false;
                            for (let scan = k; scan <= k+5 && scan < lines.length; scan++) {
                                if (lines[scan].endsWith('?') || lines[scan].endsWith(':')) {
                                    isQ = true; break;
                                }
                            }
                            if (isQ) break;
                        }
                        optsRaw.push(l);
                        k++;
                    }
                    
                    i = k - 1; // Update outer loop
                    
                    // Re-combine split options (simple heuristic: if a line doesn't start with a capital letter, it's part of the previous line)
                    let mergedOpts = [];
                    optsRaw.forEach(o => {
                        if (mergedOpts.length === 0) {
                            mergedOpts.push(o);
                        } else {
                            if (!o.match(/^[A-Z0-9]/) || o.match(/^(interossei|by portal hypertension|of its numerous valves|is severed|to the stability)/)) {
                                mergedOpts[mergedOpts.length-1] += " " + o;
                            } else {
                                mergedOpts.push(o);
                            }
                        }
                    });
                    
                    unformattedQs.push({ question: currentQ, options: mergedOpts });
                    currentQ = "";
                } else {
                    // No next question, so all remaining lines are options
                    let optsRaw = [];
                    let k = i + 1;
                    if (line.endsWith(') Costocervical trunk')) {
                        currentQ = currentQ.replace(') Costocervical trunk', ')');
                        optsRaw.push('Costocervical trunk');
                    }
                    while(k < lines.length) {
                        optsRaw.push(lines[k]);
                        k++;
                    }
                    i = k;
                    
                    let mergedOpts = [];
                    optsRaw.forEach(o => {
                        if (mergedOpts.length === 0) {
                            mergedOpts.push(o);
                        } else {
                            if (!o.match(/^[A-Z0-9]/)) {
                                mergedOpts[mergedOpts.length-1] += " " + o;
                            } else {
                                mergedOpts.push(o);
                            }
                        }
                    });
                    
                    unformattedQs.push({ question: currentQ, options: mergedOpts });
                    currentQ = "";
                }
            }
        }
    });
    
    return [...unformattedQs, ...qs];
}

let resultObj = {};

for (let i = 1; i <= 15; i++) {
    if (topicsText[i]) {
        const parsed = parseTopicText(topicsText[i]);
        
        // Clean up
        const cleaned = parsed.map(q => {
             return {
                 question: q.question,
                 options: q.options,
                 correctIndex: 0,
                 explanation: "The correct answer is " + (q.options[0] || "") + "."
             };
        });
        
        resultObj[`t-s-2-2-${i-1}`] = cleaned;
    }
}

// Write the file
const fileContent = `export const s_2_2_situational = ${JSON.stringify(resultObj, null, 2)};\n`;
fs.writeFileSync('c:\\samu_mcq\\mobile-app\\src\\data\\repository\\course2\\s-2-2-situational.js', fileContent);
console.log('Successfully wrote s-2-2-situational.js with ' + Object.keys(resultObj).length + ' topics.');
