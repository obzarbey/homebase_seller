const mongoose = require('mongoose');

const productCatalogSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    index: true // For search functionality
  },
  brand: {
    type: String,
    required: false,
    trim: true,
    maxlength: 50,
    default: '',
    index: true
  },
  category: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: false,
    trim: true,
    maxlength: 1000,
    default: ''
  },
  unit: {
    type: String,
    required: false,
    trim: true,
    maxlength: 20,
    default: 'piece' // e.g., 'kg', 'piece', 'liter', etc.
  },
  imageUrl: {
    type: String,
    required: true
  },
  // Admin approval system
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  // Who created this catalog entry
  createdBy: {
    type: String,
    required: true,
    index: true
  },
  // Admin approval details
  approvedBy: {
    type: String,
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  // Search optimization
  searchKeywords: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Compound indexes for efficient searching
productCatalogSchema.index({ name: 'text', brand: 'text', description: 'text' });
productCatalogSchema.index({ category: 1, status: 1 });
productCatalogSchema.index({ status: 1, createdAt: -1 });

// Auto-generate search keywords
productCatalogSchema.pre('save', function(next) {
  const keywords = [];
  
  // Add name words
  if (this.name) {
    keywords.push(...this.name.toLowerCase().split(' '));
  }
  
  // Add brand words
  if (this.brand) {
    keywords.push(...this.brand.toLowerCase().split(' '));
  }
  
  // Add category
  if (this.category) {
    keywords.push(this.category.toLowerCase());
  }
  
  // Remove duplicates and empty strings
  this.searchKeywords = [...new Set(keywords.filter(k => k.length > 0))];
  next();
});

module.exports = mongoose.model('ProductCatalog', productCatalogSchema);
