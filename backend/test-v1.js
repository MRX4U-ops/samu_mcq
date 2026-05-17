const axios = require('axios');
const env = require('./src/config/env');

async function testV1() {
  console.log("🚀 Testing Gemini V1 Endpoint...");
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: "Explain a cell in 2 lines." }] }]
      }
    );
    console.log("✅ V1 SUCCESS!");
    console.log(response.data.candidates[0].content.parts[0].text);
  } catch (e) {
    console.log("❌ V1 FAILED!");
    console.log(e.response?.data || e.message);
  }
}

testV1();
