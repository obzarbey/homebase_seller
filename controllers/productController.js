// Public: Get all products (for unauthenticated users)
const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, isAvailable } = req.query;

    // Build filter
    const filter = {};
    if (category) filter.category = category;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';

    // Calculate pagination
    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

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
    console.error('Error fetching all products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};
const Product = require('../models/Product');

// Add a new product
const addProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      sellerId: req.user.uid, // Use Firebase UID as sellerId
      timestamp: new Date()
    };

    const product = new Product(productData);
    const savedProduct = await product.save();

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      data: savedProduct
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add product',
      error: error.message
    });
  }
};

// Update a product owned by seller
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.uid;

    // Check if product exists and belongs to the seller
    const existingProduct = await Product.findOne({ _id: id, sellerId });
    
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or you are not authorized to update this product'
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

// Delete a product owned by seller
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.uid;

    // Check if product exists and belongs to the seller
    const product = await Product.findOne({ _id: id, sellerId });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or you are not authorized to delete this product'
      });
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: { id, imagePath: product.imagePath } // Return imagePath for client-side cleanup
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
};

// Get products owned by seller
const getSellerProducts = async (req, res) => {
  try {
    const sellerId = req.user.uid;
    const { page = 1, limit = 10, category, isAvailable } = req.query;

    // Build filter
    const filter = { sellerId };
    if (category) filter.category = category;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';

    // Calculate pagination
    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .sort({ timestamp: -1 }) // Most recent first
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

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
    console.error('Error fetching seller products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

// Get single product by ID (for public viewing)
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    
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
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

// Search products by address (public endpoint)
const searchProductsByAddress = async (req, res) => {
  try {
    const { address, page = 1, limit = 10 } = req.query;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address parameter is required'
      });
    }

    const filter = {
      address: { $regex: address, $options: 'i' }, // Case-insensitive search
      isAvailable: true
    };

    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

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
    console.error('Error searching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search products',
      error: error.message
    });
  }
};

module.exports = {
  addProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  getProductById,
  searchProductsByAddress
  ,getAllProducts
};
