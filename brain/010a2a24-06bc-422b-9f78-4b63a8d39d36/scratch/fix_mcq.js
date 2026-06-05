const fs = require('fs');

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

function fix() {
    let fixCount = 0;

    for (const subjectId in MCQ_REPOSITORY) {
        const topics = MCQ_REPOSITORY[subjectId];
        
        for (const topicId in topics) {
            let questions = topics[topicId];

            if (Array.isArray(questions)) {
                let pendingQuestion = null;

                for (let i = 0; i < questions.length; i++) {
                    const q = questions[i];

                    // 1. If we have a pending question from the previous item, assign it
                    if ((!q.question || q.question.trim() === "") && pendingQuestion) {
                        q.question = pendingQuestion;
                        pendingQuestion = null;
                        fixCount++;
                    }

                    // 2. Check if this item has a question hidden in its options
                    let questionInOptionsIndex = -1;
                    q.options.forEach((opt, optIndex) => {
                        // Pattern: starts with number + dot, and ends with ? or :
                        if (/^\d+\.\s+.+[\?:]/.test(opt)) {
                            questionInOptionsIndex = optIndex;
                        }
                    });

                    if (questionInOptionsIndex !== -1) {
                        const extractedQuestion = q.options[questionInOptionsIndex].replace(/^\d+\.\s+/, "");
                        
                        // If current item already has a question, this extracted one belongs to the NEXT item
                        if (q.question && q.question.trim() !== "") {
                            pendingQuestion = extractedQuestion;
                            q.options.splice(questionInOptionsIndex, 1);
                            if (questionInOptionsIndex < q.correctIndex) q.correctIndex--;
                            fixCount++;
                        } else {
                            // Current item is missing a question, take this one
                            q.question = extractedQuestion;
                            q.options.splice(questionInOptionsIndex, 1);
                            if (questionInOptionsIndex < q.correctIndex) q.correctIndex--;
                            fixCount++;
                        }
                    }

                    // 3. Final cleanup for this item
                    if (q.correctAnswer !== undefined && q.correctIndex === undefined) {
                        q.correctIndex = q.correctAnswer;
                        delete q.correctAnswer;
                        fixCount++;
                    }
                    if (!q.explanation || q.explanation.trim() === "" || q.explanation.includes("Correct answer:")) {
                        const correctValue = q.options[q.correctIndex] || "unknown";
                        q.explanation = "The correct answer is '" + correctValue + "'. This choice aligns with the established clinical curriculum.";
                        fixCount++;
                    }
                }
            }
        }
    }

    console.log(`Fixes applied: ${fixCount}`);
    
    const newContent = 'export const MCQ_REPOSITORY = ' + JSON.stringify(MCQ_REPOSITORY, null, 2) + ';';
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('File updated successfully.');
}

fix();
