const fs = require('fs');
const content = fs.readFileSync('c:/samu_mcq/mobile-app/src/data/mcqRepository.js', 'utf8');

const subjectStart = content.indexOf('"s-2-2": {');
let braceCount = 0;
let subjectEnd = -1;
for (let i = subjectStart + 9; i < content.length; i++) {
    if (content[i] === '{') braceCount++;
    if (content[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
            subjectEnd = i + 1;
            break;
        }
    }
}

const subjectStr = "{" + content.substring(subjectStart, subjectEnd) + "}";
try {
    const obj = JSON.parse(subjectStr);
    console.log("Subject s-2-2 is valid JSON!");
} catch (e) {
    console.log("Subject s-2-2 has error:", e.message);
    const match = e.message.match(/at position (\d+)/);
    if (match) {
        const pos = parseInt(match[1]);
        console.log("Error at relative position:", pos);
        console.log("Context:");
        console.log(subjectStr.substring(pos - 30, pos + 30));
    }
}
