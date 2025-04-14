// server/routes/questionRoutes.js
const router = require('express').Router();
const Question = require('../models/Question');
const Course = require('../models/Course');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const mongoose = require('mongoose');

// Get all questions for a course (admin only)
router.get('/course/:courseId', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const questions = await Question.find({ course: req.params.courseId });
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a question (admin only)
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { courseId, text, options } = req.body;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Verify at least one correct answer
    const hasCorrectAnswer = options.some(option => option.isCorrect);
    if (!hasCorrectAnswer) {
      return res.status(400).json({ message: 'At least one option must be correct' });
    }

    const question = await Question.create({
      course: courseId,
      text,
      options: options.map(option => ({
        text: option.text,
        isCorrect: option.isCorrect,
        explanation: option.explanation || '',
      })),
    });

    res.status(201).json({ question, message: 'Question created successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a question (admin only)
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { text, options } = req.body;
    
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    // Verify at least one correct answer
    if (options) {
      const hasCorrectAnswer = options.some(option => option.isCorrect);
      if (!hasCorrectAnswer) {
        return res.status(400).json({ message: 'At least one option must be correct' });
      }
    }
    
    question.text = text || question.text;
    question.options = options || question.options;
    
    await question.save();
    
    res.json({ question, message: 'Question updated successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a question (admin only)
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    await question.remove();
    
    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;