const data = require('../backend/src/data/anatomyData.js');
console.log('Main keys:', Object.keys(data));
if (data['s-2-2']) {
    console.log('s-2-2 keys:', Object.keys(data['s-2-2']));
} else {
    console.log('s-2-2 is not a direct key.');
    // Let's find any keys containing s-2-2
    const matches = Object.keys(data).filter(k => k.includes('s-2-2'));
    console.log('Keys containing s-2-2:', matches);
}
