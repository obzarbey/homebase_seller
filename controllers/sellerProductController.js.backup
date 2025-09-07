const SellerProduct = require('../models/SellerProduct');
const ProductCatalog = require('../models/ProductCatalog');
const { initializeFirebase } = require('../config/firebase');

// Helper function to delete image from Firebase Storage
const deleteImageFromStorage = async (imagePath) => {
  if (!imagePath) return false;
  
  try {
    const admin = initializeFirebase();
    const bucket = admin.storage().bucket();
    
    await bucket.file(imagePath).delete();
    console.log(`Image deleted from Firebase Storage: ${imagePath}`);
    return true;
  } catch (error) {
    console.warn(`Failed to delete image from Firebase Storage: ${error.message}`);
    if (error.code === 404) {
      console.log('Image was already deleted or does not exist');
    }
    return false;
  }
};

// Helper function to extract keywords from custom name
const extractKeywordsFromCustomName = (customName) => {
  if (!customName || typeof customName !== 'string') return [];
  
  // Split by spaces, commas, hyphens, and other common separators
  const keywords = customName
    .toLowerCase()
    .split(/[\s,\-_]+/)
    .map(word => word.trim())
    .filter(word => word.length > 0);
  
  return [...new Set(keywords)]; // Remove duplicates
};

// Helper function to update search keywords in product catalog
const updateProductCatalogSearchKeywords = async (productId, customName) => {
  if (!customName) return;
  
  try {
    const newKeywords = extractKeywordsFromCustomName(customName);
    if (newKeywords.length === 0) return;
    
    // Find the product catalog and add new keywords
    const catalogProduct = await ProductCatalog.findById(productId);
    if (!catalogProduct) return;
    
    // Get existing keywords
    const existingKeywords = catalogProduct.searchKeywords || [];
    
    // Merge and deduplicate keywords
    const updatedKeywords = [...new Set([...existingKeywords, ...newKeywords])];
    
    // Update the catalog product
    await ProductCatalog.findByIdAndUpdate(
      productId,
      { $set: { searchKeywords: updatedKeywords } },
      { new: true }
    );
    
    console.log(`Updated search keywords for product ${productId} with custom name: ${customName}`);
  } catch (error) {
    console.warn(`Failed to update search keywords for product ${productId}:`, error.message);
  }
};

// Add product to seller's inventory (link to catalog)
const addSellerProduct = async (req, res) => {
  try {
    const sellerId = req.user.uid;
    const { productId, price, offerPrice, stock, address, customNote, customName, customCategory, customImageUrl, customImagePath } = req.body;
    
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
      customName: customName || null,
      customCategory: customCategory || null,
      customImageUrl: customImageUrl || null,
      customImagePath: customImagePath || null,
      isPreOwned: req.body.isPreOwned || false
    });
    
    const savedProduct = await sellerProduct.save();
    
    // Update search keywords in product catalog if custom name is provided
    if (customName) {
      await updateProductCatalogSearchKeywords(productId, customName);
    }
    
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

    // Check if custom image is being changed and delete old one
    const oldCustomImagePath = existingProduct.customImagePath;
    const newCustomImagePath = req.body.customImagePath;
    
    // If new image is different from old image, delete the old 
    // not working deleteImageFromStorage(oldCustomImagePath);
    if (oldCustomImagePath && 
        newCustomImagePath !== oldCustomImagePath && 
        existingProduct.customImageUrl) {
      await deleteImageFromStorage(oldCustomImagePath);
    }
    
    // Only allow updating seller-specific fields, not catalog references
    const allowedUpdates = {
      price: req.body.price,
      offerPrice: req.body.offerPrice,
      stock: req.body.stock,
      address: req.body.address,
      customNote: req.body.customNote,
      customName: req.body.customName,
      customCategory: req.body.customCategory,
      customImageUrl: req.body.customImageUrl,
      customImagePath: req.body.customImagePath,
      isAvailable: req.body.isAvailable,
      isPreOwned: req.body.isPreOwned,
      status: req.body.status,
      updatedAt: new Date()
    };
    
    // Remove undefined values
    Object.keys(allowedUpdates).forEach(key => {
      if (allowedUpdates[key] === undefined) {
        delete allowedUpdates[key];
      }
    });
    
    const updatedProduct = await SellerProduct.findByIdAndUpdate(
      id,
      allowedUpdates,
      { new: true, runValidators: true }
    ).populate('productId');
    
    // Update search keywords in product catalog if custom name is provided or changed
    if (allowedUpdates.customName) {
      await updateProductCatalogSearchKeywords(existingProduct.productId, allowedUpdates.customName);
    }
    
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

    // Store image info for deletion
    const customImageUrl = product.customImageUrl;
    const customImagePath = product.customImagePath;

    // Delete the product from database
    await SellerProduct.findByIdAndDelete(id);

    // Try to delete custom image from Firebase Storage if it exists
    let imageDeleted = false;
    if (customImageUrl && customImagePath) {
      imageDeleted = await deleteImageFromStorage(customImagePath);
    }
    
    res.status(200).json({
      success: true,
      message: 'Product removed from inventory successfully',
      data: { 
        id, 
        customImagePath,
        imageDeleted
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
  const { page = 1, limit = 10, category, status, isAvailable, onlyOffers, stockLt, lowStock } = req.query;
    
    const filter = { sellerId };
    if (category) filter['productId.category'] = category;
    if (status) filter.status = status;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
  if (onlyOffers === 'true') filter.offerPrice = { $gt: 0 };

    // Low stock filters
    if (lowStock === 'true') {
      filter.stock = { $lt: 5 };
    } else if (stockLt !== undefined) {
      const n = parseInt(stockLt, 10);
      if (!Number.isNaN(n)) {
        filter.stock = { $lt: n };
      }
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
  const { page = 1, limit = 20, category, address, sellerId, search, onlyOffers } = req.query;
    
    // Build aggregation pipeline for proper JOIN
    const pipeline = [];
    
    // Match stage - filter seller products
  const matchStage = {
      isAvailable: true,
      status: 'active'
    };
    
    if (address) {
      matchStage.address = { $regex: address, $options: 'i' };
    }
    
    if (sellerId) {
      matchStage.sellerId = sellerId;
    }
    if (onlyOffers === 'true') {
      matchStage.offerPrice = { $gt: 0 };
    }
    
    pipeline.push({ $match: matchStage });
    
    // Lookup stage - JOIN with ProductCatalog
    pipeline.push({
      $lookup: {
        from: 'productcatalogs',
        localField: 'productId',
        foreignField: '_id',
        as: 'catalogData'
      }
    });
    
    // Unwind catalog data
    pipeline.push({
      $unwind: {
        path: '$catalogData',
        preserveNullAndEmptyArrays: true
      }
    });
    
    // Filter by category if specified
    if (category && category !== 'all') {
      pipeline.push({
        $match: {
          'catalogData.category': category
        }
      });
    }
    
    // Filter by search term if specified
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'catalogData.name': { $regex: search, $options: 'i' } },
            { 'catalogData.brand': { $regex: search, $options: 'i' } },
            { 'catalogData.description': { $regex: search, $options: 'i' } },
            { customNote: { $regex: search, $options: 'i' } }
          ]
        }
      });
    }
    
    // Project stage - flatten the structure for Flutter app
    pipeline.push({
      $project: {
        _id: 1,
        sellerId: 1,
        productId: 1,
        price: 1,
        offerPrice: 1,
        stock: 1,
        address: 1,
        customNote: 1,
        customCategory: 1,
        customImageUrl: 1,
        customImagePath: 1,
        isAvailable: 1,
        isPreOwned: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        // Flattened catalog data - what Flutter expects
        name: '$catalogData.name',

        customCatalogCategory: '$catalogData.category',
        brand: '$catalogData.brand',
        category: '$catalogData.category',
        description: '$catalogData.description',
        unit: '$catalogData.unit',
        imageUrl: '$catalogData.imageUrl',
        catalogStatus: '$catalogData.status'
      }
    });
    
    // Sort stage
    pipeline.push({ $sort: { createdAt: -1 } });
    
    // Add pagination
    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });
    
    // Execute aggregation
    const products = await SellerProduct.aggregate(pipeline);
    
    // Get total count for pagination (separate pipeline without skip/limit)
    const countPipeline = pipeline.slice(0, -2); // Remove skip and limit
    countPipeline.push({ $count: 'total' });
    const totalResult = await SellerProduct.aggregate(countPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;
    
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
    
    // Use aggregation for consistent flattened structure
    const pipeline = [
      { $match: { _id: require('mongoose').Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'productcatalogs',
          localField: 'productId',
          foreignField: '_id',
          as: 'catalogData'
        }
      },
      {
        $unwind: {
          path: '$catalogData',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          sellerId: 1,
          productId: 1,
          price: 1,
          offerPrice: 1,
          stock: 1,
          address: 1,
          customNote: 1,
          customCategory: 1,
          customImageUrl: 1,
          customImagePath: 1,
          isAvailable: 1,
          isPreOwned: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          // Flattened catalog data - what Flutter expects
          name: '$catalogData.name',

          customCatalogCategory: '$catalogData.category',
          brand: '$catalogData.brand',
          category: '$catalogData.category',
          description: '$catalogData.description',
          unit: '$catalogData.unit',
          imageUrl: '$catalogData.imageUrl',
          catalogStatus: '$catalogData.status'
        }
      }
    ];
    
    const result = await SellerProduct.aggregate(pipeline);
    const product = result.length > 0 ? result[0] : null;
    
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
    const { address, page = 1, limit = 10, category, search } = req.query;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address parameter is required'
      });
    }
    
    // Build aggregation pipeline for proper JOIN
    const pipeline = [];
    
    // Match stage - filter by address and other criteria
    const matchStage = {
      address: { $regex: address, $options: 'i' },
      isAvailable: true,
      status: 'active'
    };
    
    pipeline.push({ $match: matchStage });
    
    // Lookup stage - JOIN with ProductCatalog
    pipeline.push({
      $lookup: {
        from: 'productcatalogs',
        localField: 'productId',
        foreignField: '_id',
        as: 'catalogData'
      }
    });
    
    // Unwind catalog data
    pipeline.push({
      $unwind: {
        path: '$catalogData',
        preserveNullAndEmptyArrays: true
      }
    });
    
    // Filter by category if specified
    if (category && category !== 'all') {
      pipeline.push({
        $match: {
          'catalogData.category': category
        }
      });
    }
    
    // Filter by search term if specified
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'catalogData.name': { $regex: search, $options: 'i' } },
            { 'catalogData.brand': { $regex: search, $options: 'i' } },
            { 'catalogData.description': { $regex: search, $options: 'i' } },
            { customNote: { $regex: search, $options: 'i' } }
          ]
        }
      });
    }
    
    // Project stage - flatten the structure for Flutter app
    pipeline.push({
      $project: {
        _id: 1,
        sellerId: 1,
        productId: 1,
        price: 1,
        offerPrice: 1,
        stock: 1,
        address: 1,
        customNote: 1,
        customCategory: 1,
        customImageUrl: 1,
        customImagePath: 1,
        isAvailable: 1,
        isPreOwned: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        // Flattened catalog data - what Flutter expects
        name: '$catalogData.name',

        customCatalogCategory: '$catalogData.category',
        brand: '$catalogData.brand',
        category: '$catalogData.category',
        description: '$catalogData.description',
        unit: '$catalogData.unit',
        imageUrl: '$catalogData.imageUrl',
        catalogStatus: '$catalogData.status'
      }
    });
    
    // Sort stage
    pipeline.push({ $sort: { createdAt: -1 } });
    
    // Add pagination
    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });
    
    // Execute aggregation
    const products = await SellerProduct.aggregate(pipeline);
    
    // Get total count for pagination (separate pipeline without skip/limit)
    const countPipeline = pipeline.slice(0, -2); // Remove skip and limit
    countPipeline.push({ $count: 'total' });
    const totalResult = await SellerProduct.aggregate(countPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;
    
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

// Get products by specific seller (public endpoint)
const getProductsBySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { page = 1, limit = 20, category, available = true, search, onlyOffers } = req.query;
    
    // Build aggregation pipeline for proper JOIN
    const pipeline = [];
    
    // Match stage - filter by seller and other criteria
    const matchStage = {
      sellerId: sellerId,
      status: 'active'
    };
    
    // Only filter by availability if specified
    if (available !== undefined) {
      matchStage.isAvailable = available === 'true';
    }
    
    // Filter for offers only if specified
    if (onlyOffers === 'true') {
      matchStage.offerPrice = { $gt: 0 };
    }
    
    pipeline.push({ $match: matchStage });
    
    // Lookup stage - JOIN with ProductCatalog
    pipeline.push({
      $lookup: {
        from: 'productcatalogs',
        localField: 'productId',
        foreignField: '_id',
        as: 'catalogData'
      }
    });
    
    // Unwind catalog data
    pipeline.push({
      $unwind: {
        path: '$catalogData',
        preserveNullAndEmptyArrays: true
      }
    });
    
    // Filter by category if specified
    if (category && category !== 'all') {
      pipeline.push({
        $match: {
          'catalogData.category': category
        }
      });
    }
    
    // Filter by search term if specified
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'catalogData.name': { $regex: search, $options: 'i' } },
            { 'catalogData.brand': { $regex: search, $options: 'i' } },
            { 'catalogData.description': { $regex: search, $options: 'i' } },
            { customNote: { $regex: search, $options: 'i' } }
          ]
        }
      });
    }
    
    // Project stage - flatten the structure for Flutter app
    pipeline.push({
      $project: {
        _id: 1,
        sellerId: 1,
        productId: 1,
        price: 1,
        offerPrice: 1,
        stock: 1,
        address: 1,
        customNote: 1,
        customCategory: 1,
        customImageUrl: 1,
        customImagePath: 1,
        isAvailable: 1,
        isPreOwned: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        // Flattened catalog data - what Flutter expects
        name: '$catalogData.name',

        customCatalogCategory: '$catalogData.category',
        brand: '$catalogData.brand',
        category: '$catalogData.category',
        description: '$catalogData.description',
        unit: '$catalogData.unit',
        imageUrl: '$catalogData.imageUrl',
        catalogStatus: '$catalogData.status'
      }
    });
    
    // Sort stage
    pipeline.push({ $sort: { createdAt: -1 } });
    
    // Add pagination
    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });
    
    // Execute aggregation
    const products = await SellerProduct.aggregate(pipeline);
    
    // Get total count for pagination (separate pipeline without skip/limit)
    const countPipeline = pipeline.slice(0, -2); // Remove skip and limit
    countPipeline.push({ $count: 'total' });
    const totalResult = await SellerProduct.aggregate(countPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;
    
    res.status(200).json({
      success: true,
      message: 'Seller products retrieved successfully',
      data: {
        sellerId,
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

// Update all seller products' address when seller updates their address
const updateAllSellerProductsAddress = async (req, res) => {
  try {
    const sellerId = req.user.uid;
    const { address } = req.body;
    
    if (!address || address.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }
    
    // Update all products for this seller with the new address
    const updateResult = await SellerProduct.updateMany(
      { sellerId },
      { 
        address: address.trim(),
        updatedAt: new Date()
      }
    );
    
    res.status(200).json({
      success: true,
      message: `Successfully updated address for ${updateResult.modifiedCount} products`,
      data: {
        sellerId,
        newAddress: address.trim(),
        productsUpdated: updateResult.modifiedCount,
        productsMatched: updateResult.matchedCount
      }
    });
  } catch (error) {
    console.error('Error updating seller products address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update products address',
      error: error.message
    });
  }
};

// Update stock for multiple products (for order processing)
// Accepts orderItems: Array of
// - { productId, sellerId, quantityToReduce } where productId can be either the catalog productId (preferred)
//   or the seller product _id (legacy/client variations)
// - OR { sellerProductId, sellerId, quantityToReduce }
// The controller will flexibly resolve the correct SellerProduct document.
const updateStockForOrder = async (req, res) => {
  try {
  const { orderItems } = req.body; // See accepted shapes above
    
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'orderItems array is required'
      });
    }

    const stockUpdates = [];
    const lowStockProducts = [];

    // Process each item in the order
    for (const item of orderItems) {
      const { productId, sellerId, sellerProductId, quantityToReduce } = item;

      if (!sellerId || !quantityToReduce || (!productId && !sellerProductId)) {
        return res.status(400).json({
          success: false,
          message: 'Each order item must have sellerId, quantityToReduce and either productId or sellerProductId'
        });
      }

      // Resolve the SellerProduct document using flexible strategies
      let sellerProduct = null;

      // 1) Explicit sellerProductId takes precedence
      if (sellerProductId) {
        sellerProduct = await SellerProduct.findOne({ _id: sellerProductId, sellerId }).populate('productId');
      }

      // 2) Try standard lookup by catalog productId
      if (!sellerProduct && productId) {
        sellerProduct = await SellerProduct.findOne({ productId, sellerId }).populate('productId');
      }

      // 3) If still not found, the provided productId might actually be the seller product _id
      if (!sellerProduct && productId) {
        sellerProduct = await SellerProduct.findOne({ _id: productId, sellerId }).populate('productId');
      }

      if (!sellerProduct) {
        return res.status(404).json({
          success: false,
          message: `Seller product not found for productId: ${productId}, sellerId: ${sellerId}`
        });
      }

      const currentStock = sellerProduct.stock;
  let newStock = currentStock - quantityToReduce;
  if (newStock < 0) newStock = 0; // Avoid negative stock

      // Check for low stock (less than 5)
      if (newStock < 5) {
        const productName = sellerProduct.customName || sellerProduct.productId.name;
        lowStockProducts.push({
          productName,
          newStock,
          sellerId
        });
      }

      // Update the stock
      await SellerProduct.findByIdAndUpdate(
        sellerProduct._id,
        { 
          stock: newStock,
          updatedAt: new Date()
        },
        { runValidators: true }
      );

      stockUpdates.push({
        productId,
        sellerId,
        previousStock: currentStock,
        newStock,
        quantityReduced: quantityToReduce
      });
    }

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully for all order items',
      data: {
        stockUpdates,
        lowStockProducts
      }
    });

  } catch (error) {
    console.error('Error updating stock for order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock',
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
  checkSellerProductExists,
  getProductsBySeller,
  updateAllSellerProductsAddress,
  updateStockForOrder
};
