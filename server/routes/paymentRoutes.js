// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Record a payment (Admin Only)
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { student, session, amount, paymentDate, paymentMethod, notes } = req.body;
    const payment = new Payment({
      student,
      session,
      amount,
      paymentDate: paymentDate || new Date(),
      paymentMethod,
      notes,
      recordedBy: req.user.id,
    });
    await payment.save();
    res.status(201).json({ payment });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get payments for a student
router.get('/student', isAuthenticated, async (req, res) => {
  try {
    const payments = await Payment.find({ student: req.user.id })
      .populate({
        path: 'session',
        populate: [
          { path: 'tutor', select: 'name email' },
          { path: 'course', select: 'title' }
        ]
      })
      .sort('-paymentDate');
    
    res.json({ payments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all payments (admin only)
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('student', 'name email')
      .populate({
        path: 'session',
        populate: [
          { path: 'tutor', select: 'name email' },
          { path: 'course', select: 'title' }
        ]
      })
      .populate('recordedBy', 'name email')
      .sort('-paymentDate');
    
    res.json({ payments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;