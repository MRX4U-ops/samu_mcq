const fs = require('fs');
const path = require('path');

// Load parsed JSONs
const biochemData = require('./parsed_biochem_data.json');
const biochemRepo = require('./parsed_biochem_repo.json');

// Helper to format JSON with 8 spaces indentation (or 10 spaces)
function formatWithIndent(arr, indentSize) {
    const spaces = ' '.repeat(indentSize);
    const jsonStr = JSON.stringify(arr, null, 2);
    // Indent every line by indentSize except the first line
    const lines = jsonStr.split('\n');
    const indentedLines = lines.map((line, idx) => {
        if (idx === 0) return line;
        return spaces + line;
    });
    return indentedLines.join('\n');
}

// 1. UPDATE backend/src/data/biochemistryData.js
console.log('--- Updating backend/src/data/biochemistryData.js ---');
const biochemDataPath = path.resolve(__dirname, '../backend/src/data/biochemistryData.js');
let biochemDataContent = fs.readFileSync(biochemDataPath, 'utf8');

// Find the index of "t-s-2-1-1": {
const searchKey = '"t-s-2-1-1":';
const keyIdx = biochemDataContent.indexOf(searchKey);
if (keyIdx === -1) {
    throw new Error('Could not find "t-s-2-1-1": in biochemistryData.js');
}

// Find "test": [ after that key
const testSearch = '"test": [';
const testIdx = biochemDataContent.indexOf(testSearch, keyIdx);
if (testIdx === -1) {
    throw new Error('Could not find "test": [ after "t-s-2-1-1" in biochemistryData.js');
}

// Find the matching closing bracket for "test": [
// Since each question is an object with { ... }, the end of the array is followed by "situational": [
const situationalSearch = '"situational": [';
const sitIdx = biochemDataContent.indexOf(situationalSearch, testIdx);
if (sitIdx === -1) {
    throw new Error('Could not find "situational": [ after "test" in biochemistryData.js');
}

// Find the closing bracket ']' of the "test" array which is just before "situational": [
// Let's find the last ']' before sitIdx
const closingBrackIdx = biochemDataContent.lastIndexOf(']', sitIdx);
if (closingBrackIdx === -1 || closingBrackIdx < testIdx) {
    throw new Error('Could not find closing bracket for "test" in biochemistryData.js');
}

// Now replace from testIdx + testSearch.length to closingBrackIdx
const formattedQuestionsData = '\n' + formatWithIndent(biochemData, 10).slice(1, -1).trim() + '\n        ';
const newBiochemDataContent = biochemDataContent.slice(0, testIdx + testSearch.length) +
                              formattedQuestionsData +
                              biochemDataContent.slice(closingBrackIdx);

fs.writeFileSync(biochemDataPath, newBiochemDataContent, 'utf8');
console.log('✅ Successfully updated biochemistryData.js');


// 2. UPDATE backend/src/data/mcqRepository.js
console.log('\n--- Updating backend/src/data/mcqRepository.js ---');
const mcqRepoPath = path.resolve(__dirname, '../backend/src/data/mcqRepository.js');
let mcqRepoContent = fs.readFileSync(mcqRepoPath, 'utf8');

// Find the index of "t-s-2-1-1": [ under "s-2-1"
const searchKeyRepo = '"t-s-2-1-1": [';
const keyIdxRepo = mcqRepoContent.indexOf(searchKeyRepo);
if (keyIdxRepo === -1) {
    throw new Error('Could not find "t-s-2-1-1": [ in mcqRepository.js');
}

// Find the matching closing bracket for "t-s-2-1-1": [
// The next key is "t-s-2-1-2": [
const nextKeyRepo = '"t-s-2-1-2": [';
const nextKeyIdxRepo = mcqRepoContent.indexOf(nextKeyRepo, keyIdxRepo);
if (nextKeyIdxRepo === -1) {
    throw new Error('Could not find "t-s-2-1-2": [ after "t-s-2-1-1" in mcqRepository.js');
}

// Find the closing bracket ']' of the "t-s-2-1-1" array which is just before nextKeyRepo
const closingBrackIdxRepo = mcqRepoContent.lastIndexOf(']', nextKeyIdxRepo);
if (closingBrackIdxRepo === -1 || closingBrackIdxRepo < keyIdxRepo) {
    throw new Error('Could not find closing bracket for "t-s-2-1-1" in mcqRepository.js');
}

// Replace the content inside the bracket
const formattedQuestionsRepo = '\n' + formatWithIndent(biochemRepo, 8).slice(1, -1).trim() + '\n    ';
const newMcqRepoContent = mcqRepoContent.slice(0, keyIdxRepo + searchKeyRepo.length) +
                          formattedQuestionsRepo +
                          mcqRepoContent.slice(closingBrackIdxRepo);

fs.writeFileSync(mcqRepoPath, newMcqRepoContent, 'utf8');
console.log('✅ Successfully updated mcqRepository.js');


// 3. UPDATE mobile-app/src/data/repository/course2/s-2-1.js
console.log('\n--- Updating mobile-app/src/data/repository/course2/s-2-1.js ---');
const mobileDataPath = path.resolve(__dirname, '../mobile-app/src/data/repository/course2/s-2-1.js');
let mobileDataContent = fs.readFileSync(mobileDataPath, 'utf8');

// Find the index of "t-s-2-1-0": [
const searchKeyMobile = '"t-s-2-1-0": [';
const keyIdxMobile = mobileDataContent.indexOf(searchKeyMobile);
if (keyIdxMobile === -1) {
    throw new Error('Could not find "t-s-2-1-0": [ in s-2-1.js');
}

// Find the matching closing bracket for "t-s-2-1-0": [
// The next key is "t-s-2-1-1": [
const nextKeyMobile = '"t-s-2-1-1": [';
const nextKeyIdxMobile = mobileDataContent.indexOf(nextKeyMobile, keyIdxMobile);
if (nextKeyIdxMobile === -1) {
    throw new Error('Could not find "t-s-2-1-1": [ after "t-s-2-1-0" in s-2-1.js');
}

// Find the closing bracket ']' of the "t-s-2-1-0" array which is just before nextKeyMobile
const closingBrackIdxMobile = mobileDataContent.lastIndexOf(']', nextKeyIdxMobile);
if (closingBrackIdxMobile === -1 || closingBrackIdxMobile < keyIdxMobile) {
    throw new Error('Could not find closing bracket for "t-s-2-1-0" in s-2-1.js');
}

// Replace the content inside the bracket
const formattedQuestionsMobile = '\n' + formatWithIndent(biochemRepo, 6).slice(1, -1).trim() + '\n    ';
const newMobileDataContent = mobileDataContent.slice(0, keyIdxMobile + searchKeyMobile.length) +
                            formattedQuestionsMobile +
                            mobileDataContent.slice(closingBrackIdxMobile);

fs.writeFileSync(mobileDataPath, newMobileDataContent, 'utf8');
console.log('✅ Successfully updated mobile-app/src/data/repository/course2/s-2-1.js');

console.log('\n--- VERIFICATION OF SYNTAX VALIDITY ---');
try {
    // Validate biochemistryData.js by requiring it
    const dataObj = require(biochemDataPath);
    console.log('✅ biochemistryData.js is syntactically valid! Mapped keys:', Object.keys(dataObj));
} catch (e) {
    console.error('❌ biochemistryData.js syntax validation failed:', e.message);
}

try {
    // Validate mcqRepository.js by requiring it
    const repoObj = require(mcqRepoPath);
    console.log('✅ mcqRepository.js is syntactically valid! Mapped keys:', Object.keys(repoObj));
} catch (e) {
    console.error('❌ mcqRepository.js syntax validation failed:', e.message);
}

console.log('\n🏁 Update complete.');
