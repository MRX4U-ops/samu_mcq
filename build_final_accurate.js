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
        }
    }
    return topics;
};

const topicsText = extractTopics();

function parseTopic(rawText) {
    let text = rawText.replace(/SITUATIONAL TOPIC \d+/g, '')
                      .replace(/TOPIC \d+/g, '')
                      .replace(/t\.v\.\/\s*Topic \d+/g, '')
                      .replace(/t\.v\/\s*Topic \d+/g, '')
                      .replace(/t\.v,\/Topic \d+/g, '')
                      .trim();
    
    let lines = text.split('\n').map(l => l.trim()).filter(l => l);
    let qs = [];
    let currentQ = "";

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Formatted question
        if (line.includes('{')) {
            let qText = line.substring(0, line.indexOf('{')).trim();
            currentQ += (currentQ ? " " : "") + qText;
            let j = i + 1;
            let blockOpts = line.substring(line.indexOf('{') + 1);
            while (j < lines.length && !lines[j].includes('}')) {
                blockOpts += "\n" + lines[j];
                j++;
            }
            if (j < lines.length) {
                blockOpts += "\n" + lines[j].substring(0, lines[j].indexOf('}'));
                i = j;
            }
            let opts = blockOpts.split('\n').map(o => o.trim()).filter(o => o).map(o => {
                if (o.startsWith('=') || o.startsWith('~')) return o.substring(1).trim();
                return o;
            });
            qs.push({ question: currentQ.trim(), options: opts });
            currentQ = "";
            continue;
        }

        // Unformatted question detection
        if (line.endsWith('?') || line.endsWith(':') || line.endsWith('that')) {
            currentQ += (currentQ ? " " : "") + line;
            // Now we take exactly 5 options
            let opts = [];
            let j = i + 1;
            while (j < lines.length && opts.length < 5) {
                let nextLine = lines[j];
                if (nextLine.includes('{') || nextLine.endsWith('?') || nextLine.endsWith(':')) {
                    // Oops, we hit another question too early? 
                    // This happens if options were missing or question was split.
                    // But usually it means the current "question" was actually part of a previous question?
                    // No, let's just break and take what we have.
                    break;
                }
                // Check if nextLine is a continuation
                if (opts.length > 0 && (!nextLine.match(/^[A-Z0-9]/) || nextLine.match(/^(interossei|by portal hypertension|of its numerous valves|is severed|to the stability)/))) {
                    opts[opts.length - 1] += " " + nextLine;
                } else {
                    opts.push(nextLine);
                }
                j++;
            }
            // Check for last option continuation
            while (j < lines.length && opts.length > 0 && !lines[j].includes('{') && !lines[j].endsWith('?') && !lines[j].endsWith(':') && (!lines[j].match(/^[A-Z0-9]/) || lines[j].match(/^(interossei|by portal hypertension|of its numerous valves|is severed|to the stability)/))) {
                 opts[opts.length - 1] += " " + lines[j];
                 j++;
            }

            if (opts.length > 0) {
                qs.push({ question: currentQ.trim(), options: opts });
                currentQ = "";
                i = j - 1;
            }
        } else {
            currentQ += (currentQ ? " " : "") + line;
        }
    }
    return qs;
}

let result = {};
for (let i = 1; i <= 15; i++) {
    if (topicsText[i]) {
        let parsed = parseTopic(topicsText[i]);
        result[`t-s-2-2-${i-1}`] = parsed.map(q => ({
            question: q.question,
            options: q.options,
            correctIndex: 0,
            explanation: `The correct answer is ${q.options[0]}.`
        }));
    }
}

fs.writeFileSync('c:\\samu_mcq\\mobile-app\\src\\data\\repository\\course2\\s-2-2-situational.js', `export const s_2_2_situational = ${JSON.stringify(result, null, 2)};\n`);
console.log('Done');
