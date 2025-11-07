const mongoose = require('mongoose');

const saleRecordSchema = new mongoose.Schema({
  sellerId: {
    type: String,
    required: true,
    index: true
  },
  orderId: {
    type: String,
    required: true,
    index: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCatalog',
    required: false,
    default: null,
    index: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  customName: {
    type: String,
    trim: true,
    default: null
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  costPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0
  },
  profit: {
    type: Number,
    required: true
  },
  saleType: {
    type: String,
    enum: ['order', 'manual'],
    required: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  isWeightBased: {
    type: Boolean,
    default: false
  },
  unit: {
    type: String,
    default: 'piece',
    trim: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  customerName: {
    type: String,
    trim: true,
    default: null
  },
  customerPhone: {
    type: String,
    trim: true,
    default: null
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500,
    default: null
  },
  saleDate: {
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
saleRecordSchema.index({ sellerId: 1, saleDate: -1 });
saleRecordSchema.index({ sellerId: 1, category: 1, saleDate: -1 });
saleRecordSchema.index({ sellerId: 1, productId: 1, saleDate: -1 });
saleRecordSchema.index({ sellerId: 1, saleType: 1, saleDate: -1 });

// Virtual for profit margin percentage
saleRecordSchema.virtual('profitMargin').get(function() {
  if (this.totalAmount <= 0) return 0;
  return (this.profit / this.totalAmount) * 100;
});

module.exports = mongoose.model('SaleRecord', saleRecordSchema);