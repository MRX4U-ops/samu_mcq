const { MCQ_REPOSITORY } = require('./mobile-app/src/data/mcqRepository');

const subjects = Object.keys(MCQ_REPOSITORY);
console.log('Available Subjects:', subjects.join(', '));

subjects.forEach(s => {
  const topics = Object.keys(MCQ_REPOSITORY[s]);
  console.log(`Subject ${s} has ${topics.length} topics.`);
});
