// Test enhanced search functionality with searchKeywords and customName
const mongoose = require('mongoose');
const SellerProduct = require('./models/SellerProduct');
const ProductCatalog = require('./models/ProductCatalog');
require('dotenv').config();

async function testEnhancedSearch() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dealmart');
    console.log('✅ Connected to MongoDB');
    
    // Find a seller product that exists and get its catalog
    const sellerProduct = await SellerProduct.findOne({ 
      isAvailable: true,
      status: 'active'
    }).populate('productId');
    
    if (!sellerProduct || !sellerProduct.productId) {
      console.log('❌ No active seller products found');
      process.exit(1);
    }
    
    const catalogProduct = sellerProduct.productId;
    
    console.log(`\n📦 Testing search with product: ${catalogProduct.name}`);
    console.log(`   Search keywords: [${catalogProduct.searchKeywords?.join(', ') || 'none'}]`);
    
    console.log(`   Seller custom name: "${sellerProduct.customName || 'none'}"`);
    
    // Test search scenarios
    const testSearches = [
      catalogProduct.searchKeywords?.[0], // First keyword from catalog
      'premium', // Common keyword that might be in searchKeywords
      'quality', // Another common keyword
      sellerProduct.customName ? sellerProduct.customName.split(' ')[0] : 'test'
    ];
    
    for (const searchTerm of testSearches) {
      if (!searchTerm) continue;
      
      console.log(`\n🔍 Testing search for: "${searchTerm}"`);
      
      // Simulate the search aggregation pipeline
      const pipeline = [
        {
          $match: {
            isAvailable: true,
            status: 'active'
          }
        },
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
          $match: {
            $or: [
              { 'catalogData.name': { $regex: searchTerm, $options: 'i' } },
              { 'catalogData.brand': { $regex: searchTerm, $options: 'i' } },
              { 'catalogData.description': { $regex: searchTerm, $options: 'i' } },
              { 'catalogData.searchKeywords': { $in: [new RegExp(searchTerm, 'i')] } },
              { customNote: { $regex: searchTerm, $options: 'i' } },
              { customName: { $regex: searchTerm, $options: 'i' } }
            ]
          }
        },
        {
          $project: {
            _id: 1,
            sellerId: 1,
            price: 1,
            offerPrice: 1,
            customName: 1,
            customNote: 1,
            name: '$catalogData.name',
            brand: '$catalogData.brand',
            searchKeywords: '$catalogData.searchKeywords'
          }
        },
        { $limit: 5 }
      ];
      
      const results = await SellerProduct.aggregate(pipeline);
      
      console.log(`   📊 Found ${results.length} results`);
      
      results.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.name} (${result.customName || 'no custom name'})`);
        console.log(`      Keywords: [${result.searchKeywords?.join(', ') || 'none'}]`);
      });
    }
    
    console.log('\n✅ Search enhancement test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

testEnhancedSearch();
