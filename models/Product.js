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
    required: false,
    trim: true,
    maxlength: 1000,
    default: 'No description provided'
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
    trim: true,
    maxlength: 200
  },
  isAvailable: {
    type: Boolean,
    default: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
    index: true
  }
}, {
  timestamps: true, // This adds createdAt and updatedAt automatically
  collection: 'products' // Ensure we use the main products collection
});

// Production-ready indexes for efficient querying
productSchema.index({ sellerId: 1, createdAt: -1 }); // Seller's products by newest first
productSchema.index({ category: 1, isAvailable: 1 }); // Category filtering with availability
productSchema.index({ address: 'text', name: 'text', description: 'text' }); // Text search
productSchema.index({ price: 1 }); // Price range queries
productSchema.index({ isAvailable: 1, createdAt: -1 }); // Available products by newest

// Pre-save middleware for additional validation
productSchema.pre('save', function(next) {
  // Ensure offer price is not greater than regular price
  if (this.offerPrice > this.price) {
    const error = new Error('Offer price cannot be greater than regular price');
    error.name = 'ValidationError';
    return next(error);
  }
  
  // Sanitize text fields
  if (this.name) this.name = this.name.trim();
  if (this.description) this.description = this.description.trim();
  if (this.address) this.address = this.address.trim();
  if (this.category) this.category = this.category.trim();
  
  next();
});

module.exports = mongoose.model('Product', productSchema);
