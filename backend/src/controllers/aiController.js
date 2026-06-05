const aiService = require('../services/aiService');

exports.askQuestion = async (req, res) => {
  try {
    // Web frontend sends { message, userId }; mobile/legacy sends { question }
    const question = req.body.message || req.body.question;
    const language = req.body.language || 'English';

    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const result = await aiService.getAnswer(question, language);
    // Ensure response field matches what frontend expects
    if (result && !result.response && result.answer) {
      result.response = result.answer;
    }
    res.json(result);
  } catch (error) {
    console.error('AI chat error:', error.message);
    res.status(500).json({ error: "AI processing failed", response: "Sorry, I could not process your request right now. Please try again." });
  }
};

exports.analyzeImage = async (req, res) => {
  console.log("📥 Received image analysis request");
  try {
    // Web frontend sends { image: "data:image/jpeg;base64,...", prompt }
    // Legacy sends { imageBase64 }
    const imageData = req.body.image || req.body.imageBase64;
    const prompt = req.body.prompt || 'Please analyze this medical image.';

    if (!imageData) {
      console.log("❌ No image data provided");
      return res.status(400).json({ error: "Image data required" });
    }

    // Strip data URI prefix if present, pass raw base64 to service
    const base64 = imageData.startsWith('data:')
      ? imageData.split(',')[1]
      : imageData;

    console.log(`📸 Image data received (length: ${base64.length})`);
    const result = await aiService.analyzeImage(base64, prompt);
    console.log("✅ Image analysis completed successfully");
    res.json(result);
  } catch (error) {
    console.error("🏁 Image analysis failed:", error.message);
    res.status(500).json({ error: "Image analysis failed", details: error.message });
  }
};

