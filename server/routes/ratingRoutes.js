// routes/ratingRoutes.js
const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const User = require('../models/User');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Submit a rating (student only)
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { tutor, rating, feedback } = req.body;
    
    // Check if student has already rated this tutor
    const existingRating = await Rating.findOne({ 
      student: req.user.id,
      tutor
    });
    
    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.feedback = feedback;
      await existingRating.save();
      res.json({ rating: existingRating });
    } else {
      // Create new rating
      const newRating = new Rating({
        student: req.user.id,
        tutor,
        rating,
        feedback
      });
      
      await newRating.save();
      
      // Update tutor's average rating
      await updateTutorAverageRating(tutor);
      
      res.status(201).json({ rating: newRating });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get average rating for a tutor (public)
router.get('/tutor/:id', async (req, res) => {
  try {
    const ratings = await Rating.find({ tutor: req.params.id });
    
    if (ratings.length === 0) {
      return res.json({ averageRating: 0, totalRatings: 0 });
    }
    
    const averageRating = ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length;
    
    res.json({ 
      averageRating: parseFloat(averageRating.toFixed(1)), 
      totalRatings: ratings.length 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all feedback for admin view (admin only)
router.get('/feedback', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const ratings = await Rating.find()
      .populate('student', 'name email')
      .populate('tutor', 'name email')
      .sort('-date');
    
    res.json({ ratings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Helper function to update tutor's average rating
async function updateTutorAverageRating(tutorId) {
  const ratings = await Rating.find({ tutor: tutorId });
  
  if (ratings.length === 0) {
    await User.findByIdAndUpdate(tutorId, { averageRating: 0 });
    return;
  }
  
  const averageRating = ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length;
  
  await User.findByIdAndUpdate(tutorId, { 
    averageRating: parseFloat(averageRating.toFixed(1)),
    totalRatings: ratings.length
  });
}

module.exports = router;