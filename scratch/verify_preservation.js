const data = require('../backend/src/data/anatomyData.js');

console.log('--- VERIFYING BACKEND PRESERVATION ---');
const s22 = data['s-2-2'];
let allPreserved = true;

for (let i = 1; i <= 15; i++) {
    const key = `t-s-2-2-${i}`;
    const topic = s22[key];
    if (!topic) {
        console.error(`ERROR: ${key} is missing in s-2-2!`);
        allPreserved = false;
        continue;
    }
    
    if (!topic.test || !Array.isArray(topic.test)) {
        console.error(`ERROR: ${key}.test is missing or not an array!`);
        allPreserved = false;
    } else {
        console.log(`${key} - Test questions count: ${topic.test.length} (Expected: >0)`);
        if (topic.test.length === 0) {
            console.error(`ERROR: ${key}.test is empty!`);
            allPreserved = false;
        }
    }
    
    if (!topic.situational || !Array.isArray(topic.situational)) {
        console.error(`ERROR: ${key}.situational is missing or not an array!`);
        allPreserved = false;
    } else {
        console.log(`${key} - Situational questions count: ${topic.situational.length}`);
    }
}

if (allPreserved) {
    console.log('SUCCESS: All backend test questions were successfully preserved and situational questions were integrated!');
} else {
    console.log('FAILED: Preservation verification failed!');
}
