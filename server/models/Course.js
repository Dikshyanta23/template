// server/models/Course.js
const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Course description is required']
  },
  collection: {
    type: String,
    required: [true, 'Course collection is required'],
    enum: ['A Levels', 'IB', 'US BSc Preparation']
  },
  topics: [{
    type: String,
    required: [true, 'At least one topic is required']
  }],
  image: {
    type: String,
    default: null
  },
  tutors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Course', CourseSchema);