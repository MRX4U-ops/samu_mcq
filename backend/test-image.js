const aiService = require('./src/services/aiService');

async function testImageAnalysis() {
  console.log("🚀 Testing Image Analysis locally...");
  try {
    // 1x1 transparent GIF base64
    const base64 = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    const result = await aiService.analyzeImage(base64);
    console.log("✅ Analysis Result:", result);
  } catch (error) {
    console.error("❌ Analysis Failed:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }
}

testImageAnalysis();
