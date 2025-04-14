const router = require('express').Router();
const Course = require('../models/Course');
const Question = require('../models/Question');
const User = require('../models/User');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const cloudinary = require('../utils/cloudinary');


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

// Create a course (Admin Only)
router.post('/courses', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { title, description, collection, topics, tutors, questions } = req.body;

    // Validate required fields
    if (!title || !description || !collection || !topics || !questions) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate topics format
    const topicList = topics.split(',').map((topic) => topic.trim());
    if (topicList.length === 0) {
      return res.status(400).json({ message: 'Topics must be a comma-separated list' });
    }

    // Validate questions format
    if (!Array.isArray(questions) || questions.length !== 20) {
      return res.status(400).json({ message: 'Exactly 20 questions must be provided' });
    }

    for (const question of questions) {
      if (
        typeof question.text !== 'string' ||
        !Array.isArray(question.options) ||
        question.options.length !== 4 ||
        !question.options.some((option) => option.isCorrect)
      ) {
        return res.status(400).json({ message: 'Invalid question format' });
      }
    }

    // Create the course
    const newCourse = new Course({
      title,
      description,
      collection,
      topics: topicList,
      tutors: Array.isArray(tutors) ? tutors : [tutors],
    });

    await newCourse.save();

    // Save questions to the database
    const savedQuestions = [];
    for (const questionData of questions) {
      const question = new Question({
        course: newCourse._id,
        text: questionData.text,
        options: questionData.options.map((option) => ({
          text: option.text,
          isCorrect: option.isCorrect,
          explanation: option.explanation || '',
        })),
      });
      await question.save();
      savedQuestions.push(question);
    }

    // Fetch the populated course to return
    const populatedCourse = await Course.findById(newCourse._id)
      .populate('collection')
      .populate('tutors', 'name email');

    res.status(201).json({
      message: 'Course created successfully with questions',
      course: populatedCourse,
      questions: savedQuestions,
    });
  } catch (err) {
    console.error('Error creating course:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a course (admin only)
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
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

// Delete a course (Admin Only)
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Remove course from tutors
    await User.updateMany({ courses: course._id }, { $pull: { courses: course._id } });

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
      { $match: { course: new ObjectId(req.params.id) } },
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

router.post('/upload-image', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { title, description, collection, topics } = req.body;

    // Upload image to Cloudinary
    let imageUrl = '';
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      imageUrl = result.secure_url;
    }

    const newCourse = new Course({
      title,
      description,
      collection,
      topics: topics.split(',').map((topic) => topic.trim()),
      image: imageUrl,
    });
    await newCourse.save();

    res.status(201).json({ message: 'Course created successfully', course: newCourse });
  } catch (err) {
    console.error('Error creating course:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;