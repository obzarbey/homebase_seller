const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
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
  price: {
    type: Number,
    required: true,
    min: 0
  },
  offerPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  imageUrl: {
    type: String,
    required: true
  },
  imagePath: {
    type: String,
    default: ''
  },
  sellerId: {
    type: String,
    required: true,
    index: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

// Index for efficient querying
productSchema.index({ sellerId: 1, timestamp: -1 });
productSchema.index({ address: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isAvailable: 1 });

module.exports = mongoose.model('Product', productSchema);
