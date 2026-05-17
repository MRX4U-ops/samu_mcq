const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  firebase_uid: { type: String, required: true, unique: true },
  devices: [{
    deviceId: String,
    lastActiveAt: { type: Date, default: Date.now }
  }],
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  subscription: {
    isActive: { type: Boolean, default: false },
    startDate: { type: Date },
    endDate: { type: Date },
    status: { type: String, enum: ['active', 'pending', 'expired', 'none'], default: 'none' }
  },
  stats: {
    streak: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    points: { type: Number, default: 0 },
    badges: [{ type: String }],
    totalSolved: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    wrongCount: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    multiplayer: {
      battlesPlayed: { type: Number, default: 0 },
      wins: { type: Number, default: 0 },
      rank: { type: String, default: 'Novice' }
    }
  },
  wrongQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MCQ' }],
  upcomingExams: [{
    subject: { type: String, required: true },
    date: { type: Date, required: true },
    notes: { type: String }
  }],
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MCQ' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
