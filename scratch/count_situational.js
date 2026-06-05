const { s_2_2_situational } = require('../mobile-app/src/data/repository/course2/s-2-2-situational.js');
console.log('Generated Situational Questions Count per Topic:');
Object.keys(s_2_2_situational).forEach(k => {
    console.log(`- ${k}: ${s_2_2_situational[k].length} questions`);
});
