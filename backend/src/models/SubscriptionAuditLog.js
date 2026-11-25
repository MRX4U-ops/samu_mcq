const mongoose = require('mongoose');

const subscriptionAuditLogSchema = new mongoose.Schema({
  subscriptionId: { type: String, required: true, index: true },
  adminId: { type: String, default: null },
  action: { type: String, required: true },
  previousValues: { type: mongoose.Schema.Types.Mixed, default: {} },
  newValues: { type: mongoose.Schema.Types.Mixed, default: {} },
  reason: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model('SubscriptionAuditLog', subscriptionAuditLogSchema);
