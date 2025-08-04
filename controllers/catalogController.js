const ProductCatalog = require('../models/ProductCatalog');

// Search products in catalog
const searchCatalog = async (req, res) => {
  try {
    const { query, category, page = 1, limit = 20 } = req.query;
    
    const filter = { status: 'approved' }; // Only show approved products
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { searchKeywords: { $in: [new RegExp(query, 'i')] } }
      ];
    }
    
    const skip = (page - 1) * limit;
    const totalProducts = await ProductCatalog.countDocuments(filter);
    
    const products = await ProductCatalog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const totalPages = Math.ceil(totalProducts / limit);
    
    res.status(200).json({
      success: true,
      message: 'Catalog products retrieved successfully',
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error searching catalog:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search catalog',
      error: error.message
    });
  }
};

// Get catalog product by ID
const getCatalogProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await ProductCatalog.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Catalog product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Catalog product retrieved successfully',
      data: product
    });
  } catch (error) {
    console.error('Error fetching catalog product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch catalog product',
      error: error.message
    });
  }
};

// Create new catalog product (seller request)
const createCatalogProduct = async (req, res) => {
  try {
    const sellerId = req.user.uid;
    
    const catalogProduct = new ProductCatalog({
      ...req.body,
      createdBy: sellerId,
      status: 'pending' // Requires admin approval
    });
    
    const savedProduct = await catalogProduct.save();
    
    res.status(201).json({
      success: true,
      message: 'Catalog product created successfully. Pending admin approval.',
      data: savedProduct
    });
  } catch (error) {
    console.error('Error creating catalog product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create catalog product',
      error: error.message
    });
  }
};

// Get categories
const getCategories = async (req, res) => {
  try {
    const categories = await ProductCatalog.distinct('category', { status: 'approved' });
    
    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: categories.sort()
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

// Admin functions
const getPendingCatalogProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = { status: 'pending' };
    const totalProducts = await ProductCatalog.countDocuments(filter);
    
    const products = await ProductCatalog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const totalPages = Math.ceil(totalProducts / limit);
    
    res.status(200).json({
      success: true,
      message: 'Pending catalog products retrieved successfully',
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching pending products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending products',
      error: error.message
    });
  }
};

const approveCatalogProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.uid;
    
    const product = await ProductCatalog.findByIdAndUpdate(
      id,
      {
        status: 'approved',
        approvedBy: adminId,
        approvedAt: new Date()
      },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Catalog product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Catalog product approved successfully',
      data: product
    });
  } catch (error) {
    console.error('Error approving catalog product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve catalog product',
      error: error.message
    });
  }
};

const rejectCatalogProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.uid;
    
    const product = await ProductCatalog.findByIdAndUpdate(
      id,
      {
        status: 'rejected',
        approvedBy: adminId,
        approvedAt: new Date(),
        rejectionReason: reason || 'No reason provided'
      },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Catalog product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Catalog product rejected successfully',
      data: product
    });
  } catch (error) {
    console.error('Error rejecting catalog product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject catalog product',
      error: error.message
    });
  }
};

module.exports = {
  searchCatalog,
  getCatalogProductById,
  createCatalogProduct,
  getCategories,
  getPendingCatalogProducts,
  approveCatalogProduct,
  rejectCatalogProduct
};
