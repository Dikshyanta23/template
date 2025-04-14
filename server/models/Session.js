// server/models/Session.js
const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  totalHours: {
    type: Number,
    required: true
  },
  hoursCompleted: {
    type: Number,
    default: 0
  },
  hourlyRate: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  notes: {
    type: String
  },
  attendances: [{
    date: {
      type: Date,
      required: true
    },
    hours: {
      type: Number,
      required: true
    },
    notes: {
      type: String
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Session', SessionSchema);