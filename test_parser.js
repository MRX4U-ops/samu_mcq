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
    
    // Extract formatted first
    let qs = [];
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
    
    let unformattedQs = [];
    unformattedBlocks.forEach(block => {
        const lines = block.split('\n').map(l => l.trim()).filter(l => l);
        let currentQ = "";
        
        for(let i=0; i<lines.length; i++) {
            let line = lines[i];
            line = line.replace(/^\d+\.\s*/, '');
            
            // Skip headers that slipped through
            if (line === 'SITUATIONAL TOPIC' || line.startsWith('t.v')) continue;

            currentQ += (currentQ ? " " : "") + line;
            
            // Is it the end of a question?
            if (line.endsWith('?') || line.endsWith(':') || line.endsWith(') Costocervical trunk') || (line.endsWith('that') && currentQ.includes('explains to them that'))) {
                
                let opts = [];
                let j = i + 1;
                
                if (line.endsWith(') Costocervical trunk')) {
                    currentQ = currentQ.replace(') Costocervical trunk', ')');
                    opts.push('Costocervical trunk');
                }
                
                while (j < lines.length && opts.length < 5) {
                    let nextLine = lines[j];
                    // special cases for option continuations
                    if (opts.length > 0 && (!nextLine.match(/^[A-Z0-9]/) || nextLine.match(/^(interossei|by portal hypertension|of its numerous valves|is severed|to the stability)/))) {
                        opts[opts.length - 1] += " " + nextLine;
                    } else {
                        opts.push(nextLine);
                    }
                    j++;
                }
                
                // Sometimes the last option continues
                while (j < lines.length && opts.length > 0 && (!lines[j].match(/^[A-Z0-9]/) || lines[j].match(/^(interossei|by portal hypertension|of its numerous valves|is severed|to the stability)/))) {
                    opts[opts.length - 1] += " " + lines[j];
                    j++;
                }

                unformattedQs.push({ question: currentQ, options: opts });
                currentQ = "";
                i = j - 1;
            }
        }
    });
    
    return [...unformattedQs, ...qs];
}

let resultObj = {};
let badCount = 0;

for (let i = 1; i <= 15; i++) {
    if (topicsText[i]) {
        const parsed = parseTopicText(topicsText[i]);
        
        const cleaned = parsed.map(q => {
             if (q.options.length !== 5) {
                 console.log(`Topic ${i} bad options length: ${q.options.length}`);
                 console.log(`Q: ${q.question}`);
                 console.log(`Opts: ${JSON.stringify(q.options)}`);
                 badCount++;
             }
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

console.log(`Total bad questions: ${badCount}`);

if (badCount === 0) {
    const fileContent = `export const s_2_2_situational = ${JSON.stringify(resultObj, null, 2)};\n`;
    fs.writeFileSync('c:\\samu_mcq\\mobile-app\\src\\data\\repository\\course2\\s-2-2-situational.js', fileContent);
    console.log('Successfully wrote s-2-2-situational.js with ' + Object.keys(resultObj).length + ' topics.');
}
