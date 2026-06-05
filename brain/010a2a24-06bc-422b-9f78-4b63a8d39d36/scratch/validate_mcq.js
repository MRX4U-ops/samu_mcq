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

function validate() {
    let errors = [];
    let subjectCount = 0;
    let topicCount = 0;
    let questionCount = 0;

    for (const subjectId in MCQ_REPOSITORY) {
        subjectCount++;
        const topics = MCQ_REPOSITORY[subjectId];
        
        if (typeof topics !== 'object' || topics === null) {
            errors.push(`Subject ${subjectId} has invalid topics object.`);
            continue;
        }

        for (const topicId in topics) {
            topicCount++;
            const questions = topics[topicId];

            if (!Array.isArray(questions)) {
                errors.push(`Topic ${topicId} in subject ${subjectId} is not an array.`);
                continue;
            }

            questions.forEach((q, index) => {
                questionCount++;
                if (!q.question) errors.push(`Question missing in ${subjectId} -> ${topicId} at index ${index}`);
                if (!Array.isArray(q.options)) {
                    errors.push(`Options missing or not an array in ${subjectId} -> ${topicId} at index ${index}`);
                } else {
                    if (q.options.length === 0) errors.push(`Zero options in ${subjectId} -> ${topicId} at index ${index}`);
                    if (q.correctIndex === undefined || q.correctIndex === null) {
                        errors.push(`correctIndex missing in ${subjectId} -> ${topicId} at index ${index}`);
                    } else if (q.correctIndex < 0 || q.correctIndex >= q.options.length) {
                        errors.push(`correctIndex out of bounds in ${subjectId} -> ${topicId} at index ${index} (Index: ${q.correctIndex}, Options: ${q.options.length})`);
                    }
                }
                if (!q.explanation || q.explanation.trim() === "") errors.push(`Explanation missing or empty in ${subjectId} -> ${topicId} at index ${index}`);
            });
        }
    }

    console.log(`Validation Complete.`);
    console.log(`Subjects: ${subjectCount}`);
    console.log(`Topics: ${topicCount}`);
    console.log(`Questions: ${questionCount}`);
    
    if (errors.length > 0) {
        console.log(`\nErrors found (${errors.length}):`);
        // Limit error output to 20
        errors.slice(0, 20).forEach(err => console.log(`- ${err}`));
        if (errors.length > 20) console.log(`... and ${errors.length - 20} more errors.`);
    } else {
        console.log(`\nNo structural or data errors found!`);
    }
}

validate();
