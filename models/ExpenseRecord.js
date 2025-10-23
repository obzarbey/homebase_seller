const mongoose = require('mongoose');

const expenseRecordSchema = new mongoose.Schema({
  sellerId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: [
      'inventory',
      'marketing', 
      'utilities',
      'transport',
      'packaging',
      'fees',
      'maintenance',
      'other'
    ],
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['business', 'operational', 'marketing'],
    index: true
  },
  reference: {
    type: String,
    trim: true,
    maxlength: 50,
    default: null
  },
  attachmentUrl: {
    type: String,
    default: null
  },
  expenseDate: {
    type: Date,
    required: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
expenseRecordSchema.index({ sellerId: 1, expenseDate: -1 });
expenseRecordSchema.index({ sellerId: 1, category: 1, expenseDate: -1 });
expenseRecordSchema.index({ sellerId: 1, type: 1, expenseDate: -1 });

module.exports = mongoose.model('ExpenseRecord', expenseRecordSchema);