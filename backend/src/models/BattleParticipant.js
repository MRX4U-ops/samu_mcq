const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  mcqId: { type: mongoose.Schema.Types.ObjectId, ref: 'MCQ', required: true },
  selectedIndex: { type: Number, required: true },
  timeTaken: { type: Number, required: true }, // in milliseconds
  isCorrect: { type: Boolean, required: true },
  points: { type: Number, required: true, default: 0 }
}, { _id: false });

const battleParticipantSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'BattleRoom', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, default: 0 },
  totalTimeTaken: { type: Number, default: 0 },
  answers: [answerSchema]
}, { timestamps: true });

// Ensure a user can only participate once per room
battleParticipantSchema.index({ roomId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('BattleParticipant', battleParticipantSchema);
