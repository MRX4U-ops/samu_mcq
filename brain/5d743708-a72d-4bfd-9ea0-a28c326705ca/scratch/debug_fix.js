const fs = require('fs');

const recovered = JSON.parse(fs.readFileSync('c:/samu_mcq/mobile-app/src/data/recovered_topics.json', 'utf8'));

function applyFix(filePath, isRepo) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    const id = "t-s-2-2-2";
    const topicStart = `"${id}": {`;
    const startIdx = content.indexOf(topicStart);
    console.log(`Topic ${id} found at ${startIdx}`);
    
    if (startIdx !== -1) {
        console.log("Snippet:", content.substring(startIdx, startIdx + 100));
    }
}

applyFix('c:/samu_mcq/mobile-app/src/data/mcqRepository.js', true);
