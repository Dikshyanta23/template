// server/routes/questionRoutes.js
const router = require('express').Router();
const Question = require('../models/Question');
const Course = require('../models/Course');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Get all questions for a course (admin only)
router.get('/course/:courseId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const questions = await Question.find({ course: req.params.courseId });
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a question (admin only)
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
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
      options
    });
    
    res.status(201).json({ question, message: 'Question created successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a question (admin only)
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
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
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
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

// Bulk upload questions (admin only)
router.post('/bulk', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { courseId, questions } = req.body;
    
    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Prepare questions for insertion
    const questionsToInsert = questions.map(q => ({
      course: courseId,
      text: q.text,
      options: q.options
    }));
    
    // Validate all questions have at least one correct answer
    const allValid = questionsToInsert.every(q => 
      q.options.some(option => option.isCorrect)
    );
    
    if (!allValid) {
      return res.status(400).json({ message: 'All questions must have at least one correct answer' });
    }
    
    const insertedQuestions = await Question.insertMany(questionsToInsert);
    
    res.status(201).json({ 
      count: insertedQuestions.length,
      message: `${insertedQuestions.length} questions created successfully` 
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;