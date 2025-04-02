const router = require('express').Router();
const User = require('../models/User');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Get all users (admin only)
router.get('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify/unverify a user (admin only)
router.put('/:id/verify', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { verified } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { verified }, 
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user, message: `User ${verified ? 'verified' : 'unverified'} successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Change user role (admin only)
router.put('/:id/role', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['tutor', 'admin', 'student'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { role }, 
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user, message: `User role changed to ${role} successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;