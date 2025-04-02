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

// Get tutors
router.get('/tutors', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const tutors = await User.find({ role: 'tutor', verified: true })
      .select('-password')
      .populate('courses', 'title');
    
    res.json({ tutors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Assign courses to a tutor (admin only)
router.put('/:id/courses', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { courseIds } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'tutor') {
      return res.status(400).json({ message: 'Only tutors can be assigned courses' });
    }
    
    // Update user's courses
    user.courses = courseIds;
    await user.save();
    
    // Update courses' tutors
    await Course.updateMany(
      { tutors: user._id },
      { $pull: { tutors: user._id } }
    );
    
    if (courseIds.length > 0) {
      await Course.updateMany(
        { _id: { $in: courseIds } },
        { $addToSet: { tutors: user._id } }
      );
    }
    
    res.json({ 
      message: 'Courses assigned successfully',
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        courses: courseIds
      }
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update user profile photo (admin only or self)
router.put('/:id/photo', authenticate, async (req, res) => {
  try {
    const { photoUrl } = req.body;
    
    // Check if user is admin or updating their own profile
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.profilePhoto = photoUrl;
    await user.save();
    
    res.json({ 
      message: 'Profile photo updated successfully',
      photoUrl: user.profilePhoto
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;