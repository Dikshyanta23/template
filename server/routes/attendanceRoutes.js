// routes/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path'); // Add this import
const Attendance = require('../models/Attendance');
const { isAuthenticated, isAdmin, isTutor } = require('../middleware/auth');

// Get all attendance records for a student (for student dashboard)
router.get('/student', isAuthenticated, async (req, res) => {
  try {
    const attendances = await Attendance.find({ student: req.user.id })
      .populate('tutor', 'name email')
      .populate('course', 'title')
      .sort('-date');
    
    res.json({ attendances });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all attendance records for a tutor (for tutor dashboard)
router.get('/tutor', isAuthenticated, isTutor, async (req, res) => {
  try {
    const attendances = await Attendance.find({ tutor: req.user.id })
      .populate('student', 'name email')
      .populate('course', 'title')
      .sort('-date');
    
    res.json({ attendances });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create attendance record (tutor only)
router.post('/', isAuthenticated, isTutor, async (req, res) => {
  try {
    const { student, course, date, hoursSpent, notes } = req.body;
    
    const attendance = new Attendance({
      student,
      tutor: req.user.id,
      course,
      date,
      hoursSpent,
      notes
    });
    
    await attendance.save();
    res.status(201).json({ attendance });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;