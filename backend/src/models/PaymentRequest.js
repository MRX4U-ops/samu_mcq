const mongoose = require('mongoose');

const paymentRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  transactionId: { type: String, unique: true, sparse: true },
  payment_reference: { type: String, required: true, unique: true },
  screenshotUrl: { type: String },
  amount: { type: Number, default: 49 },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'expired'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PaymentRequest', paymentRequestSchema);
