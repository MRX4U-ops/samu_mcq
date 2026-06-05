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
    // The files use: const topicN = `...`;
    // We match literally
    const regex = /const topic(\d+) = `([\s\S]*?)`;/g;
    let m;
    while(m = regex.exec(allContent)) {
        topics[parseInt(m[1])] = m[2];
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
        line = line.replace(/^\d+\.\s*/, '');

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

        if (line.endsWith('?') || line.endsWith(':')) {
            currentQ += (currentQ ? " " : "") + line;
            let opts = [];
            let j = i + 1;
            while (j < lines.length) {
                let nextLine = lines[j];
                if (nextLine.includes('{')) break;
                const questionStarts = /^(A |An |The |During |In |If |While |After |When |What |Which |On |The |During |An |A \d+)/;
                if (nextLine.match(questionStarts) && nextLine.split(' ').length > 4) {
                    let isQ = false;
                    for (let k = j; k < j + 5 && k < lines.length; k++) {
                        if (lines[k].endsWith('?') || lines[k].endsWith(':') || lines[k].includes('{')) {
                            isQ = true; break;
                        }
                    }
                    if (isQ) break; 
                }
                if (opts.length > 0 && (!nextLine.match(/^[A-Z0-9]/) || nextLine.match(/^(interossei|by portal hypertension|of its numerous valves|is severed|to the stability)/))) {
                    opts[opts.length - 1] += " " + nextLine;
                } else {
                    opts.push(nextLine);
                }
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
topicsText.forEach((tText, i) => {
    if (tText) {
        let parsed = parseTopic(tText);
        result[`t-s-2-2-${i-1}`] = parsed.map(q => ({
            question: q.question,
            options: q.options,
            correctIndex: 0,
            explanation: `The correct answer is ${q.options[0]}.`
        }));
    }
});

fs.writeFileSync('c:\\samu_mcq\\mobile-app\\src\\data\\repository\\course2\\s-2-2-situational.js', `export const s_2_2_situational = ${JSON.stringify(result, null, 2)};\n`);
console.log('Done');
