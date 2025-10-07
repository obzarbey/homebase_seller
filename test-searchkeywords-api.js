// Test API for searchKeywords functionality
const express = require('express');
const mongoose = require('mongoose');
const ProductCatalog = require('./models/ProductCatalog');
require('dotenv').config();

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dealmart', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Test endpoint to check searchKeywords update
app.post('/test-search-keywords', async (req, res) => {
  try {
    const { productId, customName } = req.body;
    
    if (!productId || !customName) {
      return res.status(400).json({
        success: false,
        message: 'productId and customName are required'
      });
    }

    // Extract keywords from custom name
    const extractKeywordsFromCustomName = (customName) => {
      if (!customName || typeof customName !== 'string') return [];
      
      const keywords = customName
        .toLowerCase()
        .split(/[\s,\-_]+/)
        .map(word => word.trim())
        .filter(word => word.length > 0);
      
      return [...new Set(keywords)];
    };

    // Get the product before update
    const productBefore = await ProductCatalog.findById(productId);
    if (!productBefore) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Extract new keywords
    const newKeywords = extractKeywordsFromCustomName(customName);
    const existingKeywords = productBefore.searchKeywords || [];
    const updatedKeywords = [...new Set([...existingKeywords, ...newKeywords])];

    // Update the product
    const updatedProduct = await ProductCatalog.findByIdAndUpdate(
      productId,
      { $set: { searchKeywords: updatedKeywords } },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Search keywords updated successfully',
      data: {
        productId,
        customName,
        extractedKeywords: newKeywords,
        beforeKeywords: existingKeywords,
        afterKeywords: updatedProduct.searchKeywords,
        newKeywordsAdded: updatedKeywords.filter(k => !existingKeywords.includes(k))
      }
    });

  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message
    });
  }
});

// Test endpoint to view a product's search keywords
app.get('/test-view-keywords/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    const product = await ProductCatalog.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: {
        productId,
        name: product.name,
        brand: product.brand,
        category: product.category,
        searchKeywords: product.searchKeywords || []
      }
    });

  } catch (error) {
    console.error('View test error:', error);
    res.status(500).json({
      success: false,
      message: 'View test failed',
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('\nTest endpoints:');
  console.log(`POST http://localhost:${PORT}/test-search-keywords`);
  console.log('Body: { "productId": "your_product_id", "customName": "Your Custom Product Name" }');
  console.log(`GET http://localhost:${PORT}/test-view-keywords/:productId`);
  console.log('\nPress Ctrl+C to stop the server');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down test server...');
  await mongoose.connection.close();
  process.exit(0);
});
