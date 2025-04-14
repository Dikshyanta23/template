// routes/sessionRoutes.js
const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const Attendance = require('../models/Attendance');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Create a new session (admin only)
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { student, tutor, course, totalHours, startDate } = req.body;
    
    const session = new Session({
      student,
      tutor,
      course,
      totalHours,
      startDate
    });
    
    await session.save();
    res.status(201).json({ session });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get sessions for a student
router.get('/student', isAuthenticated, async (req, res) => {
  try {
    const sessions = await Session.find({ student: req.user.id })
      .populate('tutor', 'name email averageRating')
      .populate('course', 'title')
      .sort('-startDate');
    
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update session hours based on attendance (automatic)
router.put('/:id/update-hours', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Calculate total hours from attendance records
    const attendances = await Attendance.find({
      student: session.student,
      tutor: session.tutor,
      course: session.course,
      date: { $gte: session.startDate }
    });
    
    const hoursCompleted = attendances.reduce((sum, record) => sum + record.hoursSpent, 0);
    
    session.hoursCompleted = hoursCompleted;
    
    // Check if session is completed
    if (hoursCompleted >= session.totalHours) {
      session.status = 'completed';
      session.endDate = new Date();
    }
    
    await session.save();
    res.json({ session });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;