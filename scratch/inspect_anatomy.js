const data = require('../backend/src/data/anatomyData.js');
const topic13 = data['s-2-2']['t-s-2-2-13'];
console.log('Original Q4:', JSON.stringify(topic13.situational[3], null, 2));
console.log('Original Q5:', JSON.stringify(topic13.situational[4], null, 2));
