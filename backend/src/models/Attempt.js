const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mcqId: { type: mongoose.Schema.Types.ObjectId, ref: 'MCQ', required: true },
  selectedIndex: { type: Number, required: true },
  isCorrect: { type: Boolean, required: true },
  timeTaken: { type: Number }, // in seconds
}, { timestamps: true });

module.exports = mongoose.model('Attempt', attemptSchema);
