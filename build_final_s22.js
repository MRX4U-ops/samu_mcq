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
        // Find const topic[i] = `...`;
        // Since backticks can contain any characters, we match non-greedy until \`;
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

function parseFormatted(text) {
    const blocks = text.split('}').filter(t => t.trim());
    let qs = [];
    blocks.forEach(block => {
        const parts = block.split('{');
        if(parts.length < 2) return;
        const qText = parts[0].trim().replace(/\n/g, ' ');
        const opts = parts[1].trim().split('\n').filter(l => l.trim()).map(l => l.trim().substring(1).trim());
        qs.push({ question: qText, options: opts });
    });
    return qs;
}

function parseUnformatted(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    let qs = [];
    let currentQ = "";
    let currentOpts = [];
    
    for(let i=0; i<lines.length; i++) {
        let line = lines[i];
        if (line.includes('TOPIC') || line.includes('t.v') || line.includes('SITUATIONAL')) {
            if (line.includes('The bronchogram')) {
                currentQ += (currentQ ? " " : "") + line;
            } else {
                continue;
            }
        } else {
            if (line.includes('{')) {
                break; 
            }
            line = line.replace(/^\d+\.\s*/, '');
            currentQ += (currentQ ? " " : "") + line;
        }

        if(line.endsWith('?') || line.endsWith(':') || line.endsWith(') Costocervical trunk') || (line.endsWith('that') && currentQ.includes('explains to them that'))) {
            
            if (line.endsWith(') Costocervical trunk')) {
                currentQ = currentQ.replace(') Costocervical trunk', ')');
                currentOpts.push('Costocervical trunk');
                let numOpts = 4;
                for(let j=0; j<numOpts; j++) {
                    if(i+1+j < lines.length && !lines[i+1+j].includes('{')) {
                        currentOpts.push(lines[i+1+j]);
                    }
                }
                i += currentOpts.length - 1;
            } else {
                let tempOpts = [];
                let j = i + 1;
                while (j < lines.length && !lines[j].includes('{') && !lines[j].endsWith('?') && !lines[j].endsWith(':') && !lines[j].endsWith('that') && !lines[j].endsWith('trunk') && !lines[j].match(/^\d+\.\s/)) {
                    tempOpts.push(lines[j]);
                    j++;
                }
                i = j - 1;
                currentOpts = tempOpts;
            }
            
            qs.push({ question: currentQ, options: currentOpts });
            currentQ = "";
            currentOpts = [];
        }
    }
    return qs;
}

function parseTopic(text) {
    let unformatted = parseUnformatted(text);
    let formattedMatch = text.match(/[\s\S]*?(\{[\s\S]*)/);
    let formatted = [];
    if (formattedMatch && formattedMatch[1]) {
        formatted = parseFormatted(formattedMatch[1]);
    } else if (text.includes('{')) {
        formatted = parseFormatted(text);
    }
    return unformatted.concat(formatted);
}

let resultObj = {};

for (let i = 1; i <= 15; i++) {
    if (topicsText[i]) {
        const parsed = parseTopic(topicsText[i]);
        
        // Clean up empty questions/options
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
