const mongoose = require('mongoose');

const sellerProductSchema = new mongoose.Schema({
  sellerId: {
    type: String,
    required: true,
    index: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCatalog',
    required: true,
    index: true
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
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock'],
    default: 'active',
    index: true
  },
  customNote: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  customName: {
    type: String,
    trim: true,
    maxlength: 100,
    default: null
  },
  // Seller's location for this product
  address: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  // For image override (seller can use their own image)
  customImageUrl: {
    type: String,
    default: null
  },
  customImagePath: {
    type: String,
    default: null
  },
  // Availability toggle
  isAvailable: {
    type: Boolean,
    default: true,
    index: true
  },
  // Sales tracking
  totalSales: {
    type: Number,
    default: 0,
    min: 0
  },
  lastSaleDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
sellerProductSchema.index({ sellerId: 1, createdAt: -1 });
sellerProductSchema.index({ productId: 1, sellerId: 1 }, { unique: true }); // Prevent duplicate listings
sellerProductSchema.index({ address: 1, isAvailable: 1 });
sellerProductSchema.index({ status: 1, isAvailable: 1 });

// Virtual for checking if in stock
sellerProductSchema.virtual('inStock').get(function() {
  return this.stock > 0;
});

// Virtual for effective price (offer price if available, else regular price)
sellerProductSchema.virtual('effectivePrice').get(function() {
  return this.offerPrice > 0 ? this.offerPrice : this.price;
});

// Auto-update status based on stock
sellerProductSchema.pre('save', function(next) {
  if (this.stock === 0 && this.status === 'active') {
    this.status = 'out_of_stock';
  } else if (this.stock > 0 && this.status === 'out_of_stock') {
    this.status = 'active';
  }
  next();
});

module.exports = mongoose.model('SellerProduct', sellerProductSchema);
