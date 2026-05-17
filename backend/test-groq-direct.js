const aiService = require('./src/services/aiService');

async function testGroqDirect() {
  console.log("🚀 Testing Groq API directly with non-cached question...");
  try {
    const question = "Explain glycolysis in one sentence.";
    const result = await aiService.getAnswer(question, "English");
    console.log("✅ Result:", result);
  } catch (error) {
    console.error("❌ Failed:", error.message);
  }
}

testGroqDirect();
