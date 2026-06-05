const axios = require('axios');

async function testBattleCreation() {
  console.log("⚡ TESTING BATTLE CREATION ON LOCALHOST...\n");
  const API_URL = 'http://localhost:5000/api/battle';

  // 1. Test Regular Topic 7 (Microbiology-1)
  const regularTopicId = 'ee2dd985-93a2-4032-9afe-4cb8329f33d5';
  console.log(`➡️ Case A: Creating Room for Regular Topic 7 (UUID: ${regularTopicId})`);
  try {
    const res = await axios.post(`${API_URL}/create`, {
      courseId: 'c-2',
      subjectId: '177b387b-0941-4281-89dc-6a18a0e4656d',
      topicId: regularTopicId,
      taskType: 'task_question',
      maxPlayers: 8,
      hostUserId: 'host-tester'
    });
    
    console.log(`✅ Room Created Successfully! Room Code: ${res.data.roomCode}`);
    console.log(`📊 Total loaded questions: ${res.data.questionsCount}`);
    if (res.data.questionsCount > 0) {
      console.log(`❓ Sample Question 1: "${res.data.sampleQuestion}"`);
      console.log(`✨ Explanation: "${res.data.sampleExplanation}"`);
    } else {
      console.log("❌ ERROR: Loaded 0 questions!");
    }
  } catch (error) {
    console.error("❌ Case A Failed:", error.response ? error.response.data : error.message);
  }

  console.log("\n--------------------------------------------------\n");

  // 2. Test Subject Master Topic (Microbiology-1)
  const masterTopicId = 'master-177b387b-0941-4281-89dc-6a18a0e4656d';
  console.log(`➡️ Case B: Creating Room for Master Topic (ID: ${masterTopicId})`);
  try {
    const res = await axios.post(`${API_URL}/create`, {
      courseId: 'c-2',
      subjectId: '177b387b-0941-4281-89dc-6a18a0e4656d',
      topicId: masterTopicId,
      taskType: 'task_question',
      maxPlayers: 8,
      hostUserId: 'host-tester'
    });
    
    console.log(`✅ Master Room Created Successfully! Room Code: ${res.data.roomCode}`);
    console.log(`📊 Total loaded questions: ${res.data.questionsCount}`);
    if (res.data.questionsCount > 0) {
      console.log(`❓ Sample Question 1: "${res.data.sampleQuestion}"`);
    } else {
      console.log("❌ ERROR: Loaded 0 questions!");
    }
  } catch (error) {
    console.error("❌ Case B Failed:", error.response ? error.response.data : error.message);
  }
}

testBattleCreation();
