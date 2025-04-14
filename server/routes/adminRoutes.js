// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Session = require('../models/Session');
const Course = require('../models/Course');
const Enquiry = require('../models/Enquiry');
const { isAdmin, isAuthenticated } = require('../middleware/auth');

// Dashboard Stats
router.get('/dashboard/stats', isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeSessions = await Session.countDocuments({ status: 'active' });
    const totalCourses = await Course.countDocuments();

    // Upcoming payments (sessions with < 5 hours remaining)
    const upcomingPayments = await Session.find({
      status: 'active',
      $expr: { $lt: [{ $subtract: ['$totalHours', '$hoursCompleted'] }, 5] },
    })
      .populate('student', 'name email')
      .populate('course', 'title')
      .limit(5);

    // Calculate pending payments amount
    const pendingPayments = upcomingPayments.reduce((total, session) => {
      const hourlyRate = session.hourlyRate || 50; // Default rate if not specified
      const hoursRemaining = session.totalHours - session.hoursCompleted;
      return total + hourlyRate * hoursRemaining;
    }, 0);

    // Recent enquiries
    const recentEnquiries = await Enquiry.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalUsers,
      activeSessions,
      totalCourses,
      pendingPayments,
      upcomingPayments: upcomingPayments.map((session) => ({
        _id: session._id,
        student: session.student,
        course: session.course,
        hoursRemaining: session.totalHours - session.hoursCompleted,
        totalHours: session.totalHours,
        amountDue: (session.hourlyRate || 50) * (session.totalHours - session.hoursCompleted),
      })),
      recentEnquiries,
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// User Management Routes
router.get('/users', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user password (Admin Only)
router.put('/users/password/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { password } = req.body;

    // Validate password input
    if (!password || password.trim() === '') {
      return res.status(400).json({ message: 'Password cannot be empty' });
    }

    // Fetch the user document
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the password
    user.password = password; // Set the new password
    await user.save(); // Save triggers the pre('save') middleware to hash the password

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error updating user password:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user details (Admin Only)
router.put('/users/details/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { name, email, role, phone } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ message: 'Name, email, and role are required' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, phone },
      { new: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User details updated successfully', user });
  } catch (err) {
    console.error('Error updating user details:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single user by ID
router.get('/users/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password'); // Exclude password from the response
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    console.error('Error fetching user details:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;