const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema({
  paymentOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentOrder', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  transactionId: { type: String, required: true, unique: true, index: true },
  payerName: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  transactionDate: { type: Date, required: true },
  screenshotPath: { type: String, default: null },
  verificationMethod: {
    type: String,
    enum: ['MANUAL_ADMIN', 'AUTO_API', 'WEBHOOK', 'FREE_PROMO'],
    default: 'MANUAL_ADMIN',
  },
  verificationStatus: {
    type: String,
    enum: ['PENDING', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED'],
    default: 'PENDING_VERIFICATION',
    index: true,
  },
  verifiedAt: { type: Date, default: null },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  rejectionReason: { type: String, default: null },
  providerReference: { type: String, default: null, index: true },
  isSuspicious: { type: Boolean, default: false },
  suspiciousReasons: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PaymentTransaction', paymentTransactionSchema);
