const data = require('../backend/src/data/anatomyData.js');
const topicKey = 't-s-2-2-2';
console.log('Structure of t-s-2-2-2:', Object.keys(data['s-2-2'][topicKey]));
console.log('Length of test:', data['s-2-2'][topicKey].test ? data['s-2-2'][topicKey].test.length : 'none');
console.log('Length of situational:', data['s-2-2'][topicKey].situational ? data['s-2-2'][topicKey].situational.length : 'none');
