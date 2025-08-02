const Product = require('../models/Product');

// URL validation helper function
const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

// Add a new product
const addProduct = async (req, res) => {
  try {
    // Sanitize and validate required fields
    const { name, price, category, imageUrl, address } = req.body;
    
    // Additional server-side validation for critical fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required and must be a valid string'
      });
    }

    if (!price || typeof price !== 'number' || price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Product price is required and must be a positive number'
      });
    }

    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product category is required and must be a valid string'
      });
    }

    if (!imageUrl || typeof imageUrl !== 'string' || !isValidUrl(imageUrl)) {
      return res.status(400).json({
        success: false,
        message: 'Product image URL is required and must be a valid URL'
      });
    }

    if (!address || typeof address !== 'string' || address.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product address is required and must be a valid string'
      });
    }

    // Prepare sanitized product data
    const productData = {
      name: name.trim(),
      description: req.body.description ? req.body.description.trim() : 'No description provided',
      price: Number(price),
      offerPrice: req.body.offerPrice ? Number(req.body.offerPrice) : 0,
      imageUrl: imageUrl.trim(),
      imagePath: req.body.imagePath ? req.body.imagePath.trim() : '',
      address: address.trim(),
      category: category.trim(),
      isAvailable: req.body.isAvailable !== undefined ? Boolean(req.body.isAvailable) : true,
      sellerId: req.user.uid, // Use Firebase UID as sellerId
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Validate offer price is not greater than regular price
    if (productData.offerPrice > productData.price) {
      return res.status(400).json({
        success: false,
        message: 'Offer price cannot be greater than regular price'
      });
    }

    // Create and save product to main products collection
    const product = new Product(productData);
    const savedProduct = await product.save();

    console.log(`Product added successfully: ${savedProduct._id} by seller: ${req.user.uid}`);

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      data: {
        id: savedProduct._id,
        name: savedProduct.name,
        description: savedProduct.description,
        price: savedProduct.price,
        offerPrice: savedProduct.offerPrice,
        imageUrl: savedProduct.imageUrl,
        address: savedProduct.address,
        category: savedProduct.category,
        isAvailable: savedProduct.isAvailable,
        sellerId: savedProduct.sellerId,
        createdAt: savedProduct.createdAt,
        updatedAt: savedProduct.updatedAt
      }
    });
  } catch (error) {
    console.error('Error adding product:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Product validation failed',
        errors: validationErrors
      });
    }
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Product with similar details already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while adding product',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
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
};
