const aiService = require('./src/services/aiService');

async function runTest() {
  console.log("🚀 Starting AI Test on Localhost...");
  try {
    const question = "What is a cell in biology?";
    const language = "English";
    
    console.log(`📝 Question: ${question}`);
    console.log("⏳ Generating answer...");
    
    const result = await aiService.getAnswer(question, language);
    
    console.log("\n✅ TEST SUCCESSFUL!");
    console.log(`🤖 Source: ${result.source}`);
    console.log(`📄 Answer: \n${result.answer}`);
  } catch (error) {
    console.error("\n❌ TEST FAILED!");
    console.error(`Error: ${error.message}`);
  }
}

runTest();
