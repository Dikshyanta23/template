// server/models/Payment.js
const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['student-payment', 'tutor-payment'],
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank-transfer', 'credit-card', 'paypal', 'other'],
    required: true
  },
  notes: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);