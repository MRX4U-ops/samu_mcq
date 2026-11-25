const mongoose = require('mongoose');

const paymentOrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'INR' },
  planId: { type: String, required: true },
  validityDays: { type: Number, required: true, min: 1 },
  paymentMethod: { type: String, default: 'DIRECT_UPI' },
  upiId: { type: String, required: true, default: 'mrx4u@ybl' },
  paymentReference: { type: String, required: true, unique: true, index: true },
  status: {
    type: String,
    enum: ['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED', 'EXPIRED', 'CANCELLED'],
    default: 'PENDING',
    index: true,
  },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

module.exports = mongoose.model('PaymentOrder', paymentOrderSchema);
