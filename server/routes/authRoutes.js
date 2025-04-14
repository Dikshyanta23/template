const router = require('express').Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if name is valid
    if (!name || name.split(' ').length < 2) {
      return res.status(400).json({ message: 'Name must include at least two distinct words.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Determine role
    const userCount = await User.countDocuments(); // Count existing users
    let validRole;

    if (userCount === 0) {
      // First user becomes admin
      validRole = 'admin';
      // Set isVerified to true for the first user
      const user = await User.create({ 
        name, 
        email, 
        password,
        role: validRole,
      });
      // Continue with token creation and response
      const token = jwt.sign(
        { id: user._id, role: user.role }, 
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.cookie('token', token, { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      return res.status(201).json({ 
        user: { 
          id: user._id, 
          email: user.email, 
          role: user.role,
        },
        message: `Registration successful as ${validRole}`
      });
    } else {
      // Subsequent users
      validRole = role === 'tutor' ? 'tutor' : 'student';
      const user = await User.create({ 
        name, 
        email, 
        password,
        role: validRole,
      });

      const token = jwt.sign(
        { id: user._id, role: user.role }, 
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.cookie('token', token, { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      return res.status(201).json({ 
        user: { 
          id: user._id, 
          email: user.email, 
          role: user.role,
          verified: user.isVerified
        },
        message: `Registration successful as ${validRole}`
      });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.cookie('token', token, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.json({ 
      user: { id: user._id, email: user.email, role: user.role },
      message: 'Login successful'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Check Auth Status
router.get('/check-auth', isAuthenticated, (req, res) => {
  User.findById(req.user.id)
    .select('-password')
    .then(user => {
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json({ 
        user: { 
          id: user._id, 
          email: user.email, 
          role: user.role,
        },
        message: 'authenticated'
      });
    })
    .catch(err => res.status(500).json({ message: err.message }));
});

// Promote a user to admin (Admin Only)
router.post('/promote-to-admin', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { role: 'admin' },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User promoted to admin successfully', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;