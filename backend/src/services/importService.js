const MCQ = require('../models/MCQ');

/**
 * Basic import service stub to handle bulk MCQ creation
 * In a production environment, this would integrate with 'mammoth' or 'xlsx' 
 * to parse DOCX/PDF files uploaded via Admin Panel.
 */
const importMCQs = async (topicId, taskType, questions) => {
  try {
    const formattedQuestions = questions.map(q => ({
      topicId,
      taskType,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation
    }));

    const result = await MCQ.insertMany(formattedQuestions);
    return { success: true, count: result.length };
  } catch (error) {
    console.error('Import Error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { importMCQs };
