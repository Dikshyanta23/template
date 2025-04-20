const router = require('express').Router();
const Course = require('../models/Course');
const Question = require('../models/Question');
const User = require('../models/User');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const cloudinary = require('../utils/cloudinary');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Configure multer for file uploads
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

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
router.post('/', isAuthenticated, isAdmin, upload.single('image'), async (req, res) => {
  try {
    console.log('1');

    const { title, description, collection, topics, tutors, questions } = req.body;

    // Validate image file
    if (!req.file) {
      console.log('2');
      return res.status(400).json({ message: 'Image file is required' });
    }

    // Validate required fields
    if (!title || !description || !collection || !topics || !questions) {
      console.log('3');
      return res.status(400).json({ message: 'All fields are required' });
    }
 

    // Validate topics format
    const topicList = topics.split(',').map((topic) => topic.trim());
    if (topicList.length === 0) {
      console.log('4');
      return res.status(400).json({ message: 'Topics must be a comma-separated list' });
    }

    // Validate questions format
    const parsedQuestions = JSON.parse(questions); // Parse questions from stringified JSON
    if (!Array.isArray(parsedQuestions) || parsedQuestions.length !== 20) {
      console.log('5');
      return res.status(400).json({ message: 'Exactly 20 questions must be provided' });
    }

    for (const question of parsedQuestions) {
      if (
        typeof question.text !== 'string' ||
        !Array.isArray(question.options) ||
        question.options.length !== 4 ||
        typeof question.correctAnswer !== 'number' ||
        question.correctAnswer < 0 ||
        question.correctAnswer > 3
      ) {
        console.log('6');
        return res.status(400).json({ message: 'Invalid question format' });
      }
    }

    // Handle image upload to Cloudinary
    let imageUrl = '';
    if (req.file) {
      const uniqueFilename = `${uuidv4()}-${req.file.originalname}`;
      const result = await cloudinary.uploader.upload(req.file.buffer.toString('base64'), {
        public_id: uniqueFilename,
        folder: 'course_images',
        resource_type: 'image',
      });
      imageUrl = result.secure_url;
    }
  
    

    // Create the course
    const newCourse = new Course({
      title,
      description,
      collection,
      topics: topicList,
      tutors: Array.isArray(tutors) ? tutors : [tutors],
      image: imageUrl, // Save the Cloudinary URL
    });

    await newCourse.save();

    // Save questions to the database
    const savedQuestions = [];
    for (const questionData of parsedQuestions) {
      const question = new Question({
        course: newCourse._id,
        text: questionData.text,
        options: questionData.options.map((option) => ({
          text: option.text,
          explanation: option.explanation || '',
        })),
        correctAnswer: questionData.correctAnswer,
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
    console.log('7');
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


module.exports = router;