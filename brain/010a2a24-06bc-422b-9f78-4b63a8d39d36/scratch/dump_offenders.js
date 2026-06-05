const fs = require('fs');
const path = require('path');

const filePath = 'c:\\samu_mcq\\mobile-app\\src\\data\\mcqRepository.js';
const content = fs.readFileSync(filePath, 'utf8');

const start = content.indexOf('{');
const end = content.lastIndexOf('}');
const jsonStr = content.substring(start, end + 1);

let MCQ_REPOSITORY;
try {
    eval('MCQ_REPOSITORY = ' + jsonStr);
} catch (e) {
    console.error('Failed to parse MCQ_REPOSITORY object:', e.message);
    process.exit(1);
}

function dumpOffenders() {
    for (const subjectId in MCQ_REPOSITORY) {
        const topics = MCQ_REPOSITORY[subjectId];
        for (const topicId in topics) {
            const questions = topics[topicId];
            if (Array.isArray(questions)) {
                questions.forEach((q, index) => {
                    if (!q.question) {
                        console.log(`Offender at ${subjectId} -> ${topicId} [${index}]:`, JSON.stringify(q));
                    }
                });
            }
        }
    }
}

dumpOffenders();
