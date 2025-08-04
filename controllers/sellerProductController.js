const SellerProduct = require('../models/SellerProduct');
const ProductCatalog = require('../models/ProductCatalog');

// Add product to seller's inventory (link to catalog)
const addSellerProduct = async (req, res) => {
  try {
    const sellerId = req.user.uid;
    const { productId, price, offerPrice, stock, address, customNote, customImageUrl, customImagePath } = req.body;
    
    // Verify catalog product exists and is approved
    const catalogProduct = await ProductCatalog.findById(productId);
    if (!catalogProduct) {
      return res.status(404).json({
        success: false,
        message: 'Catalog product not found'
      });
    }
    
    if (catalogProduct.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot add product from unapproved catalog entry'
      });
    }
    
    // Check if seller already has this product
    const existingProduct = await SellerProduct.findOne({ sellerId, productId });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'You already have this product in your inventory'
      });
    }
    
    const sellerProduct = new SellerProduct({
      sellerId,
      productId,
      price,
      offerPrice: offerPrice || 0,
      stock,
      address,
      customNote: customNote || '',
      customImageUrl: customImageUrl || null,
      customImagePath: customImagePath || null
    });
    
    const savedProduct = await sellerProduct.save();
    
    // Populate the catalog data for response
    await savedProduct.populate('productId');
    
    res.status(201).json({
      success: true,
      message: 'Product added to your inventory successfully',
      data: savedProduct
    });
  } catch (error) {
    console.error('Error adding seller product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add product to inventory',
      error: error.message
    });
  }
};

// Update seller product
const updateSellerProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.uid;
    
    const existingProduct = await SellerProduct.findOne({ _id: id, sellerId });
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or you are not authorized to update it'
      });
    }
    
    const updatedProduct = await SellerProduct.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('productId');
    
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error updating seller product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

// Delete seller product
const deleteSellerProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.uid;
    
    const product = await SellerProduct.findOne({ _id: id, sellerId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or you are not authorized to delete it'
      });
    }
    
    await SellerProduct.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Product removed from inventory successfully',
      data: { 
        id, 
        customImagePath: product.customImagePath 
      }
    });
  } catch (error) {
    console.error('Error deleting seller product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove product from inventory',
      error: error.message
    });
  }
};

// Get seller's products
const getSellerProducts = async (req, res) => {
  try {
    const sellerId = req.user.uid;
    const { page = 1, limit = 10, category, status, isAvailable } = req.query;
    
    const filter = { sellerId };
    if (category) filter['productId.category'] = category;
    if (status) filter.status = status;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
    
    const skip = (page - 1) * limit;
    
    const products = await SellerProduct.find(filter)
      .populate('productId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await SellerProduct.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      message: 'Seller products retrieved successfully',
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalProducts: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch seller products',
      error: error.message
    });
  }
};

// Get all seller products (public endpoint)
const getAllSellerProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, address, sellerId } = req.query;
    
    const filter = { 
      isAvailable: true, 
      status: 'active' 
    };
    
    if (category && category !== 'all') {
      filter['productId.category'] = category;
    }
    
    if (address) {
      filter.address = { $regex: address, $options: 'i' };
    }
    
    if (sellerId) {
      filter.sellerId = sellerId;
    }
    
    const skip = (page - 1) * limit;
    
    const products = await SellerProduct.find(filter)
      .populate('productId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await SellerProduct.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalProducts: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching all seller products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

// Get single seller product by ID
const getSellerProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await SellerProduct.findById(id).populate('productId');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      data: product
    });
  } catch (error) {
    console.error('Error fetching seller product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

// Search products by address (public endpoint)
const searchSellerProductsByAddress = async (req, res) => {
  try {
    const { address, page = 1, limit = 10, category } = req.query;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address parameter is required'
      });
    }
    
    const filter = {
      address: { $regex: address, $options: 'i' },
      isAvailable: true,
      status: 'active'
    };
    
    if (category && category !== 'all') {
      filter['productId.category'] = category;
    }
    
    const skip = (page - 1) * limit;
    
    const products = await SellerProduct.find(filter)
      .populate('productId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await SellerProduct.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: products.length,
          totalProducts: total
        }
      }
    });
  } catch (error) {
    console.error('Error searching seller products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search products',
      error: error.message
    });
  }
};

// Check if seller already has a specific catalog product
const checkSellerProductExists = async (req, res) => {
  try {
    const sellerId = req.user.uid;
    const { productId } = req.params;
    
    const existingProduct = await SellerProduct.findOne({ sellerId, productId });
    
    res.status(200).json({
      success: true,
      exists: !!existingProduct,
      message: existingProduct ? 'Product already in your inventory' : 'Product not in your inventory'
    });
  } catch (error) {
    console.error('Error checking seller product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check product',
      error: error.message
    });
  }
};

module.exports = {
  addSellerProduct,
  updateSellerProduct,
  deleteSellerProduct,
  getSellerProducts,
  getAllSellerProducts,
  getSellerProductById,
  searchSellerProductsByAddress,
  checkSellerProductExists
};
