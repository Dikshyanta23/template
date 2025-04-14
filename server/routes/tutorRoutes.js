// routes/tutorRoutes.js
const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');
const { isAuthenticated } = require('../middleware/auth');

// Get tutor dashboard data (sessions, attendance, payments)
router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    // Verify user is a tutor
    if (req.user.role !== 'tutor') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Get active sessions
    const activeSessions = await Session.find({ 
      tutor: req.user.id,
      status: 'active'
    })
    .populate('student', 'name email')
    .populate('course', 'title')
    .sort('startDate');
    
    // Get recent attendance records
    const recentAttendance = await Attendance.find({ 
      tutor: req.user.id 
    })
    .populate('student', 'name email')
    .populate('course', 'title')
    .sort('-date')
    .limit(5);
    
    // Get recent payments
    const recentPayments = await Payment.find({
      tutor: req.user.id
    })
    .populate('student', 'name email')
    .populate('session')
    .sort('-paymentDate')
    .limit(5);
    
    // Calculate statistics
    const totalHoursAssigned = activeSessions.reduce((sum, session) => sum + session.totalHours, 0);
    const totalHoursCompleted = activeSessions.reduce((sum, session) => sum + session.hoursCompleted, 0);
    const totalEarnings = await Payment.aggregate([
      { $match: { tutor: req.user._id } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    
    const pendingPayments = await Session.aggregate([
      { $match: { tutor: req.user._id, status: { $ne: 'cancelled' } } },
      { $group: { 
        _id: null, 
        totalDue: { $sum: { $subtract: ["$totalAmount", "$amountPaid"] } } 
      } }
    ]);
    
    res.json({
      activeSessions,
      recentAttendance,
      recentPayments,
      stats: {
        totalHoursAssigned,
        totalHoursCompleted,
        totalEarnings: totalEarnings.length > 0 ? totalEarnings[0].total : 0,
        pendingPayments: pendingPayments.length > 0 ? pendingPayments[0].totalDue : 0
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all sessions for a tutor
router.get('/sessions', isAuthenticated, async (req, res) => {
  try {
    if (req.user.role !== 'tutor') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const sessions = await Session.find({ tutor: req.user.id })
      .populate('student', 'name email')
      .populate('course', 'title')
      .sort('-startDate');
    
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all attendance records for a tutor
router.get('/attendance', isAuthenticated, async (req, res) => {
  try {
    if (req.user.role !== 'tutor') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const attendances = await Attendance.find({ tutor: req.user.id })
      .populate('student', 'name email')
      .populate('course', 'title')
      .sort('-date');
    
    res.json({ attendances });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create attendance record
router.post('/attendance', isAuthenticated, async (req, res) => {
  try {
    if (req.user.role !== 'tutor') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { student, course, date, hoursSpent, notes } = req.body;
    
    // Validate session exists
    const session = await Session.findOne({
      student,
      tutor: req.user.id,
      course,
      status: 'active'
    });
    
    if (!session) {
      return res.status(400).json({ message: 'No active session found for this student and course' });
    }
    
    // Create attendance record
    const attendance = new Attendance({
      student,
      tutor: req.user.id,
      course,
      date,
      hoursSpent,
      notes
    });
    
    await attendance.save();
    
    // Update session hours completed
    session.hoursCompleted += hoursSpent;
    if (session.hoursCompleted >= session.totalHours) {
      session.status = 'completed';
      session.endDate = new Date();
    }
    await session.save();
    
    res.status(201).json({ attendance });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update attendance record
router.put('/attendance/:id', isAuthenticated, async (req, res) => {
  try {
    if (req.user.role !== 'tutor') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { date, hoursSpent, notes } = req.body;
    
    // Find the attendance record
    const attendance = await Attendance.findOne({
      _id: req.params.id,
      tutor: req.user.id
    });
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    // Calculate hours difference
    const hoursDiff = hoursSpent - attendance.hoursSpent;
    
    // Update attendance
    attendance.date = date || attendance.date;
    attendance.hoursSpent = hoursSpent || attendance.hoursSpent;
    attendance.notes = notes || attendance.notes;
    
    await attendance.save();
    
    // Update session hours if hours changed
    if (hoursDiff !== 0) {
      const session = await Session.findOne({
        student: attendance.student,
        tutor: req.user.id,
        course: attendance.course
      });
      
      if (session) {
        session.hoursCompleted += hoursDiff;
        if (session.hoursCompleted >= session.totalHours) {
          session.status = 'completed';
          session.endDate = new Date();
        } else if (session.status === 'completed' && session.hoursCompleted < session.totalHours) {
          session.status = 'active';
          session.endDate = null;
        }
        await session.save();
      }
    }
    
    res.json({ attendance });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete attendance record
router.delete('/attendance/:id', isAuthenticated, async (req, res) => {
  try {
    if (req.user.role !== 'tutor') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Find the attendance record
    const attendance = await Attendance.findOne({
      _id: req.params.id,
      tutor: req.user.id
    });
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    // Update session hours
    const session = await Session.findOne({
      student: attendance.student,
      tutor: req.user.id,
      course: attendance.course
    });
    
    if (session) {
      session.hoursCompleted -= attendance.hoursSpent;
      if (session.status === 'completed' && session.hoursCompleted < session.totalHours) {
        session.status = 'active';
        session.endDate = null;
      }
      await session.save();
    }
    
    // Delete attendance
    await attendance.remove();
    
    res.json({ message: 'Attendance record deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all payments for a tutor
router.get('/payments', isAuthenticated, async (req, res) => {
  try {
    if (req.user.role !== 'tutor') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const payments = await Payment.find({ tutor: req.user.id })
      .populate('student', 'name email')
      .populate({
        path: 'session',
        populate: {
          path: 'course',
          select: 'title'
        }
      })
      .sort('-paymentDate');
    
    res.json({ payments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;