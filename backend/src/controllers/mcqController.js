const MCQ = require('../models/MCQ');
const User = require('../models/User');

// 1. Get Questions (SECURE: Omit correct answers + PAGINATION)
exports.getQuestionsByTopic = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const questions = await MCQ.find({ topicId: req.params.topicId })
      .select('-correctIndex -explanation')
      .skip(skip)
      .limit(limit);
      
    res.json({
      questions,
      currentPage: page,
      totalQuestions: await MCQ.countDocuments({ topicId: req.params.topicId })
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Validate Attempt (SECURE: Server-side validation)
exports.attemptQuestion = async (req, res) => {
  try {
    const { mcqId, selectedIndex } = req.body;
    const question = await MCQ.findById(mcqId);

    if (!question) return res.status(404).json({ error: 'Question not found' });

    const isCorrect = question.correctIndex === selectedIndex;
    
    // Track stats for the growth system
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'stats.totalSolved': 1, 'stats.points': isCorrect ? 10 : 0 },
      $push: isCorrect ? [] : { wrongQuestions: mcqId }
    });

    res.json({
      isCorrect,
      correctIndex: question.correctIndex,
      explanation: question.explanation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
