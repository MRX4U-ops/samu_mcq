const mongoose = require('mongoose');

const mcqSchema = new mongoose.Schema({
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  taskType: { type: String, enum: ['task_question', 'situational_task'], required: true },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctIndex: { type: Number, required: true },
  explanation: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('MCQ', mcqSchema);
