const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

// Mock Data/Models for Demo
const User = { countDocuments: async () => 1240 };
const MCQ = { countDocuments: async () => 15000 };
const Payment = { countDocuments: async () => 5 };

// Admin Login (Public)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@ssmu.com' && password === 'admin123') {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
    return res.json({ token, admin: { name: 'Admin', email } });
  }
  res.status(401).json({ message: 'Invalid credentials' });
});

// Dashboard Stats (Simple Mock)
router.get('/dashboard', async (req, res) => {
  res.json({
    totalUsers: await User.countDocuments(),
    totalMCQs: await MCQ.countDocuments(),
    pendingPayments: await Payment.countDocuments(),
    activeSubscriptions: 850,
    activeQuizRooms: 2
  });
});

// ACADEMIC MANAGEMENT (CRUD)
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');

// Course CRUD
router.get('/courses', async (req, res) => res.json(await Course.find()));
router.post('/courses', async (req, res) => res.status(201).json(await Course.create(req.body)));
router.put('/courses/:id', async (req, res) => res.json(await Course.findByIdAndUpdate(req.params.id, req.body, { new: true })));
router.delete('/courses/:id', async (req, res) => { await Course.findByIdAndDelete(req.params.id); res.json({ success: true }); });

// Subject CRUD
router.get('/subjects', async (req, res) => res.json(await Subject.find()));
router.post('/subjects', async (req, res) => res.status(201).json(await Subject.create(req.body)));
router.put('/subjects/:id', async (req, res) => res.json(await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true })));
router.delete('/subjects/:id', async (req, res) => { await Subject.findByIdAndDelete(req.params.id); res.json({ success: true }); });

// Topic CRUD
router.get('/topics', async (req, res) => res.json(await Topic.find()));
router.post('/topics', async (req, res) => res.status(201).json(await Topic.create(req.body)));
router.put('/topics/:id', async (req, res) => res.json(await Topic.findByIdAndUpdate(req.params.id, req.body, { new: true })));
router.delete('/topics/:id', async (req, res) => { await Topic.findByIdAndDelete(req.params.id); res.json({ success: true }); });

// PAYMENT VERIFICATION
const PaymentRequest = require('../models/PaymentRequest');
const Subscription = require('../models/Subscription');

// Get payment requests with optional status filter
router.get('/payment-requests', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const requests = await PaymentRequest.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payment requests" });
  }
});

// Approve payment and activate subscription
router.post('/payment-approve/:id', async (req, res) => {
  try {
    const request = await PaymentRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: "Request not found" });
    if (request.status !== 'pending') return res.status(400).json({ error: "Request is not pending" });

    // Update payment request
    request.status = 'approved';
    await request.save();

    // Create Subscription
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 90); // 90 days

    await Subscription.findOneAndUpdate(
      { userId: request.userId },
      { 
        startDate, 
        endDate, 
        status: 'active' 
      },
      { upsert: true, new: true }
    );

    // Update User model subscription status
    const User = require('../models/User');
    await User.findByIdAndUpdate(request.userId, {
      'subscription.isActive': true,
      'subscription.status': 'active',
      'subscription.startDate': startDate,
      'subscription.endDate': endDate
    });

    res.json({ message: "Payment approved and subscription activated." });
  } catch (error) {
    res.status(500).json({ error: "Failed to approve payment" });
  }
});

// Reject payment
router.post('/payment-reject/:id', async (req, res) => {
  try {
    const request = await PaymentRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: "Request not found" });
    
    request.status = 'rejected';
    await request.save();

    res.json({ message: "Payment rejected." });
  } catch (error) {
    res.status(500).json({ error: "Failed to reject payment" });
  }
});

module.exports = router;
