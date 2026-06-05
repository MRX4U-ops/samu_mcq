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
    let text = rawText.replace(/SITUATIONAL TOPIC \d+/g, '')
                      .replace(/TOPIC \d+/g, '')
                      .replace(/t\.v\.\/\s*Topic \d+/g, '')
                      .replace(/t\.v\/\s*Topic \d+/g, '')
                      .replace(/t\.v,\/Topic \d+/g, '')
                      .replace(/t\.v\.\/13/g, '')
                      .trim();
    
    let lines = text.split('\n').map(l => l.trim()).filter(l => l);
    let questions = [];
    let currentQ = "";

    for(let i=0; i<lines.length; i++) {
        let line = lines[i];
        
        if (line === 'SITUATIONAL TOPIC' || line.startsWith('t.v')) continue;
        // numbering removal
        line = line.replace(/^\d+\.\s*/, '');

        if (line.includes('{')) {
            // Formatted block
            let qTextPart = line.substring(0, line.indexOf('{')).trim();
            currentQ += (currentQ ? " " : "") + qTextPart;
            
            let blockOpts = line.substring(line.indexOf('{') + 1);
            let j = i + 1;
            while(j < lines.length && !lines[j].includes('}')) {
                blockOpts += "\n" + lines[j];
                j++;
            }
            if (j < lines.length) {
                blockOpts += "\n" + lines[j].substring(0, lines[j].indexOf('}'));
                i = j;
            } else {
                i = j;
            }
            
            let opts = blockOpts.split('\n').map(l => l.trim()).filter(l => l).map(l => {
                let o = l;
                if (o.startsWith('=') || o.startsWith('~')) o = o.substring(1).trim();
                return o;
            });
            
            questions.push({ question: currentQ, options: opts });
            currentQ = "";
        } else if (line.endsWith('?') || line.endsWith(':') || line.endsWith(') Costocervical trunk') || (line.endsWith('that') && currentQ.includes('explains to them that'))) {
            // Unformatted question end detected
            currentQ += (currentQ ? " " : "") + line;
            
            let opts = [];
            let j = i + 1;
            
            if (currentQ.endsWith(') Costocervical trunk')) {
                currentQ = currentQ.replace(') Costocervical trunk', ')');
                opts.push('Costocervical trunk');
            }

            // Collect everything until the next question starts or formatted block starts
            while (j < lines.length) {
                let nextLine = lines[j];
                if (nextLine.includes('{')) break;
                
                // Heuristic for next question start:
                // If the line starts with "A ", "An ", "The ", "During ", "If "... 
                // AND it's not a short phrase (more than 4 words)
                // OR it ends with ? or : itself (though that would be caught later)
                const questionStarts = /^(A |An |The |During |In |If |While |After |When |What |Which |On |The |During |An |A \d+)/;
                if (nextLine.match(questionStarts) && nextLine.split(' ').length > 4) {
                    // Check if there is a ? or : in the next few lines to confirm it's a question
                    let isQ = false;
                    for (let k = j; k < j + 5 && k < lines.length; k++) {
                        if (lines[k].endsWith('?') || lines[k].endsWith(':') || lines[k].includes('{')) {
                            isQ = true; break;
                        }
                    }
                    if (isQ) break; 
                }

                // If it doesn't look like a question start, it's an option (or part of one)
                if (opts.length > 0 && (!nextLine.match(/^[A-Z0-9]/) || nextLine.match(/^(interossei|by portal hypertension|of its numerous valves|is severed|to the stability)/))) {
                    opts[opts.length - 1] += " " + nextLine;
                } else {
                    opts.push(nextLine);
                }
                j++;
            }

            questions.push({ question: currentQ, options: opts });
            currentQ = "";
            i = j - 1;
        } else {
            currentQ += (currentQ ? " " : "") + line;
        }
    }
    
    return questions;
}

let resultObj = {};

for (let i = 1; i <= 15; i++) {
    if (topicsText[i]) {
        const parsed = parseTopicText(topicsText[i]);
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

const fileContent = `export const s_2_2_situational = ${JSON.stringify(resultObj, null, 2)};\n`;
fs.writeFileSync('c:\\samu_mcq\\mobile-app\\src\\data\\repository\\course2\\s-2-2-situational.js', fileContent);
console.log('Successfully wrote s-2-2-situational.js with ' + Object.keys(resultObj).length + ' topics.');
