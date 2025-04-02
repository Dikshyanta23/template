// server/routes/courseRoutes.js
const router = require('express').Router();
const Course = require('../models/Course');
const Question = require('../models/Question');
const User = require('../models/User');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().populate('tutors', 'email profilePhoto');
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get courses by collection
router.get('/collection/:collection', async (req, res) => {
  try {
    const courses = await Course.find({ collection: req.params.collection })
      .populate('tutors', 'email profilePhoto');
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single course
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('tutors', 'email profilePhoto');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    res.json({ course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a course (admin only)
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { title, description, collection, topics, image, tutorIds } = req.body;
    
    const course = await Course.create({
      title,
      description,
      collection,
      topics,
      image,
      tutors: tutorIds || []
    });
    
    // Update tutors with this course
    if (tutorIds && tutorIds.length > 0) {
      await User.updateMany(
        { _id: { $in: tutorIds } },
        { $addToSet: { courses: course._id } }
      );
    }
    
    res.status(201).json({ course, message: 'Course created successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a course (admin only)
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { title, description, collection, topics, image, tutorIds } = req.body;
    
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Remove course from previous tutors
    await User.updateMany(
      { courses: course._id },
      { $pull: { courses: course._id } }
    );
    
    // Update course
    course.title = title || course.title;
    course.description = description || course.description;
    course.collection = collection || course.collection;
    course.topics = topics || course.topics;
    course.image = image || course.image;
    course.tutors = tutorIds || [];
    
    await course.save();
    
    // Add course to new tutors
    if (tutorIds && tutorIds.length > 0) {
      await User.updateMany(
        { _id: { $in: tutorIds } },
        { $addToSet: { courses: course._id } }
      );
    }
    
    res.json({ course, message: 'Course updated successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a course (admin only)
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Remove course from tutors
    await User.updateMany(
      { courses: course._id },
      { $pull: { courses: course._id } }
    );
    
    // Delete all questions for this course
    await Question.deleteMany({ course: course._id });
    
    // Delete the course
    await course.remove();
    
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get random questions for a course test
router.get('/:id/test', async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 10;
    
    const questions = await Question.aggregate([
      { $match: { course: mongoose.Types.ObjectId(req.params.id) } },
      { $sample: { size: count } }
    ]);
    
    if (!questions.length) {
      return res.status(404).json({ message: 'No questions found for this course' });
    }
    
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;