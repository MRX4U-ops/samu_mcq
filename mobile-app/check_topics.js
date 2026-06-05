const { MCQ_REPOSITORY } = require('./src/data/repository/index.js');
const localSubjectId = 's-1-8';
const localTopics = Array.from({ length: 24 }, (_, i) => ({ _id: `t-${localSubjectId}-${i}`, title: `Topic ${i + 1}`, localSubjectId }));
let missing = 0;
localTopics.forEach(t => {
  const count = MCQ_REPOSITORY[localSubjectId][t._id] ? MCQ_REPOSITORY[localSubjectId][t._id].test.length : 0;
  if (count === 0) {
    console.log('Missing/Empty topic:', t.title, t._id);
    missing++;
  } else {
    console.log('Found:', t.title, count, 'questions');
  }
});
console.log('Total topics missing/empty:', missing);
