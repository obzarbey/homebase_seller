// Simple test to verify searchKeywords implementation
const mongoose = require('mongoose');
const ProductCatalog = require('./models/ProductCatalog');
require('dotenv').config();

// Helper function (same as in controller)
const extractKeywordsFromCustomName = (customName) => {
  if (!customName || typeof customName !== 'string') return [];
  
  const keywords = customName
    .toLowerCase()
    .split(/[\s,\-_]+/)
    .map(word => word.trim())
    .filter(word => word.length > 0);
  
  return [...new Set(keywords)];
};

// Helper function (same as in controller)
const updateProductCatalogSearchKeywords = async (productId, customName) => {
  if (!customName) return;
  
  try {
    const newKeywords = extractKeywordsFromCustomName(customName);
    if (newKeywords.length === 0) return;
    
    const catalogProduct = await ProductCatalog.findById(productId);
    if (!catalogProduct) return;
    
    const existingKeywords = catalogProduct.searchKeywords || [];
    const updatedKeywords = [...new Set([...existingKeywords, ...newKeywords])];
    
    const result = await ProductCatalog.findByIdAndUpdate(
      productId,
      { $set: { searchKeywords: updatedKeywords } },
      { new: true }
    );
    
    console.log(`✅ Updated search keywords for product ${productId}`);
    console.log(`   Custom name: "${customName}"`);
    console.log(`   New keywords added: [${newKeywords.join(', ')}]`);
    console.log(`   Total keywords now: [${result.searchKeywords.join(', ')}]`);
    return result;
  } catch (error) {
    console.error(`❌ Failed to update search keywords:`, error.message);
  }
};

async function testImplementation() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dealmart');
    console.log('✅ Connected to MongoDB');
    
    // Find a sample product from the catalog
    const sampleProduct = await ProductCatalog.findOne({ status: 'approved' });
    if (!sampleProduct) {
      console.log('❌ No approved products found in catalog for testing');
      process.exit(1);
    }
    
    console.log(`\n📦 Testing with product: ${sampleProduct.name}`);
    console.log(`   Product ID: ${sampleProduct._id}`);
    console.log(`   Current keywords: [${sampleProduct.searchKeywords?.join(', ') || 'none'}]`);
    
    // Test custom names
    const testCustomNames = [
      "Premium Quality Version",
      "Extra Large Size",
      "Limited Edition Special",
      "Hand-Made Artisan Style"
    ];
    
    for (const customName of testCustomNames) {
      console.log(`\n🧪 Testing custom name: "${customName}"`);
      await updateProductCatalogSearchKeywords(sampleProduct._id, customName);
    }
    
    // Show final result
    const finalProduct = await ProductCatalog.findById(sampleProduct._id);
    console.log(`\n🎉 Final keywords: [${finalProduct.searchKeywords.join(', ')}]`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

testImplementation();
