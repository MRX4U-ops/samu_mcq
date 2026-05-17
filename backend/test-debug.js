const aiService = require('./src/services/aiService');

async function runTest() {
  console.log("🚀 Detailed AI Debug Test...");
  try {
    const question = "Explain a biological cell.";
    const result = await aiService.getAnswer(question, "English");
    console.log("Result:", result);
  } catch (error) {
    console.error("Test Error:", error);
  }
}

runTest();
