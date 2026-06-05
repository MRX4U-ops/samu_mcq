const fs = require('fs');

try {
    const content = fs.readFileSync('c:/samu_mcq/mobile-app/src/data/mcqRepository.js', 'utf8');
    // Remove the 'export const MCQ_REPOSITORY = ' prefix and the trailing ';'
    const jsonStr = content.replace('export const MCQ_REPOSITORY = ', '').replace(/;$/, '');
    JSON.parse(jsonStr);
    console.log("mcqRepository.js is syntactically CORRECT (Valid JSON structure).");
} catch (e) {
    console.log("mcqRepository.js has a SYNTAX ERROR:");
    console.log(e.message);
    
    // Try to find the line number from the error message if possible
    const match = e.message.match(/at position (\d+)/);
    if (match) {
        const pos = parseInt(match[1]);
        const content = fs.readFileSync('c:/samu_mcq/mobile-app/src/data/mcqRepository.js', 'utf8');
        const lines = content.substring(0, pos).split('\n');
        console.log(`Error is approximately at line ${lines.length}`);
        
        // Print context
        const contextLines = content.split('\n').slice(Math.max(0, lines.length - 5), lines.length + 5);
        console.log("Context:");
        contextLines.forEach((line, i) => {
            console.log(`${Math.max(0, lines.length - 5) + i + 1}: ${line}`);
        });
    }
}
