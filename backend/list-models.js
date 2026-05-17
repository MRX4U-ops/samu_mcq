const axios = require('axios');
const env = require('./src/config/env');

async function listModels() {
  console.log("🚀 Listing Available Models...");
  try {
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1/models?key=${env.GEMINI_API_KEY}`
    );
    console.log("✅ MODELS LISTED:");
    console.log(JSON.stringify(response.data.models.map(m => m.name), null, 2));
  } catch (e) {
    console.log("❌ LIST FAILED!");
    console.log(e.response?.data || e.message);
  }
}

listModels();
