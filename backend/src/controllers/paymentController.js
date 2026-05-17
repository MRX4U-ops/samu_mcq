const PaymentRequest = require('../models/PaymentRequest');
const User = require('../models/User');

// User: Submit Payment Request
exports.requestSubscription = async (req, res) => {
  try {
    const { transactionId, screenshotUrl } = req.body;

    const request = await PaymentRequest.create({
      userId: req.user.id,
      transactionId,
      screenshotUrl
    });

    await User.findByIdAndUpdate(req.user.id, { 'subscription.status': 'pending' });

    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ error: "Duplicate transaction ID or invalid data" });
  }
};

// Admin: Approve Payment (Activate for 90 days)
exports.approvePayment = async (req, res) => {
  try {
    const { requestId } = req.body;
    const request = await PaymentRequest.findById(requestId);
    
    if (!request) return res.status(404).json({ error: "Request not found" });

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 90); // Exact 90 days

    await User.findByIdAndUpdate(request.userId, {
      subscription: {
        isActive: true,
        startDate,
        endDate,
        status: 'active'
      }
    });

    request.status = 'approved';
    await request.save();

    res.json({ message: "Subscription activated for 90 days" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// User: Check Status
exports.getSubscriptionStatus = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user.subscription);
};
