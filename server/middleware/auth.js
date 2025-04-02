const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authenticate = (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

exports.authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  next();
};

exports.verifyUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Admin users are always verified
    if (user.role === 'admin') {
      return next();
    }
    
    if (!user.verified) {
      return res.status(403).json({ message: 'Account pending verification' });
    }
    
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};