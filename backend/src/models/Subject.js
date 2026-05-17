const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);
