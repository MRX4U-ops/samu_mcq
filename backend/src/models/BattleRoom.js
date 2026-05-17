const mongoose = require('mongoose');

const battleRoomSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, index: true },
  hostUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  taskType: { type: String, enum: ['task_question', 'situational_task'], required: true },
  maxPlayers: { type: Number, required: true, min: 2, max: 16 },
  mcqSet: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MCQ' }],
  status: { type: String, enum: ['lobby', 'live', 'ended'], default: 'lobby' },
  currentQuestionIndex: { type: Number, default: -1 },
  questionStartTime: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('BattleRoom', battleRoomSchema);
