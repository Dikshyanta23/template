// server/routes/enquiryRoutes.js
const router = require('express').Router();
const Enquiry = require('../models/Enquiry');
const Course = require('../models/Course');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Get all enquiries (admin only)
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const enquiries = await Enquiry.find().populate('course', 'title').sort('-createdAt');
    res.json({ enquiries });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create an enquiry
router.post('/', async (req, res) => {
  try {
    const { courseId, name, email, phone, message } = req.body;
    
    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const enquiry = await Enquiry.create({
      course: courseId,
      name,
      email,
      phone,
      message
    });
    
    res.status(201).json({ 
      enquiry: { id: enquiry._id },
      message: 'Enquiry submitted successfully. We will contact you soon.' 
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete an enquiry (Admin Only)
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }
    await enquiry.remove();
    res.json({ message: 'Enquiry deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;