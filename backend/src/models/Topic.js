const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  title: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Topic', topicSchema);
