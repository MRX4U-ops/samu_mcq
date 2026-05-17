const { GoogleGenerativeAI } = require("@google/generative-ai");
const env = require('./src/config/env');

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    // There is no direct listModels in the client SDK usually, but let's try a different approach
    console.log("Checking key validity and model access...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("test");
    console.log("Success with gemini-1.5-flash!");
  } catch (e) {
    console.error("Error:", e.message);
  }
}
listModels();
