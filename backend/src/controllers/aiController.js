const aiService = require('../services/aiService');

exports.askQuestion = async (req, res) => {
  try {
    const { question, language } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const result = await aiService.getAnswer(question, language || 'English');
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "AI processing failed" });
  }
};

exports.analyzeImage = async (req, res) => {
  console.log("📥 Received image analysis request");
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      console.log("❌ No image data provided");
      return res.status(400).json({ error: "Image data required" });
    }

    console.log(`📸 Image data received (length: ${imageBase64.length})`);
    const result = await aiService.analyzeImage(imageBase64);
    console.log("✅ Image analysis completed successfully");
    res.json(result);
  } catch (error) {
    console.error("🏁 Image analysis failed:", error.message);
    res.status(500).json({ error: "Image analysis failed", details: error.message });
  }
};
