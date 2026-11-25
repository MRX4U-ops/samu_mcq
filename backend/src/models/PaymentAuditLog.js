const mongoose = require('mongoose');

const paymentAuditLogSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, index: true },
  adminId: { type: String, default: null },
  action: { type: String, required: true },
  previousStatus: { type: String, default: null },
  newStatus: { type: String, default: null },
  reason: { type: String, default: '' },
  ipAddress: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model('PaymentAuditLog', paymentAuditLogSchema);
