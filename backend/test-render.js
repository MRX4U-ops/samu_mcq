const axios = require('axios');

async function testRender() {
  console.log("🚀 Testing LIVE Render backend...");
  try {
    const base64 = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    const response = await axios.post('https://samu-mcqs.onrender.com/api/ai/analyze-image', {
      imageBase64: base64
    }, {
      timeout: 60000 // 60s
    });
    console.log("✅ Render Success:", response.data);
  } catch (error) {
    console.error("❌ Render Failed:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
  }
}

testRender();
