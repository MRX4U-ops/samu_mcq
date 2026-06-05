const data = require('../mobile-app/src/data/repository/course2/s-2-2');
if (data.s_2_2) {
  console.log('Keys in data.s_2_2:', Object.keys(data.s_2_2));
  const topicId = 't-s-2-2-4';
  const topicData = data.s_2_2[topicId];
  if (topicData) {
    console.log(`Found ${topicId}`);
    const testQs = Array.isArray(topicData) ? topicData : (topicData.test || []);
    console.log(`Number of test questions: ${testQs.length}`);
    testQs.slice(0, 5).forEach((q, idx) => {
      console.log(`\nQuestion ${idx + 1}: ${q.question}`);
      console.log(`Options:`, q.options);
      console.log(`Correct Index: ${q.correctIndex}`);
      console.log(`Explanation: ${q.explanation}`);
    });
  } else {
    console.log(`${topicId} not found in data.s_2_2`);
  }
} else {
  console.log('data.s_2_2 is undefined');
}
