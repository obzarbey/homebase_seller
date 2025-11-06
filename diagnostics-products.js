const mongoose = require('mongoose');
const axios = require('axios');

// Test all aspects of the product system
const runFullDiagnostics = async () => {
  console.log('🔍 FULL DIAGNOSTICS FOR PRODUCT ISSUE\n');
  console.log('=' .repeat(60));

  // 1. Test Cluster 1 Connection
  console.log('\n1️⃣ Testing Cluster 1 Connection...');
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Cluster 1 Connected:', conn.connection.host);
    
    // Count all products
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    const totalCount = await Product.collection.countDocuments();
    console.log('📦 Total Products in Cluster 1:', totalCount);
    
    // Get products grouped by seller
    const sellerStats = await Product.collection.aggregate([
      {
        $group: {
          _id: '$sellerId',
          count: { $sum: 1 },
          productNames: { $push: '$name' }
        }
      }
    ]).toArray();
    
    console.log('\n📊 Products by Seller:');
    sellerStats.forEach(seller => {
      console.log(`   Seller: ${seller._id}`);
      console.log(`   Count: ${seller.count}`);
      console.log(`   Products: ${seller.productNames.join(', ')}`);
    });
    
    await conn.disconnect();
  } catch (error) {
    console.error('❌ Database Error:', error.message);
    return;
  }

  // 2. Test API Endpoints
  console.log('\n2️⃣ Testing API Endpoints...');
  const baseUrl = 'http://localhost:5000/api';
  
  const endpoints = [
    { name: 'Get All Products', url: `${baseUrl}/products/all` },
    { name: 'Get Seller Products (All)', url: `${baseUrl}/seller-products/all` },
    { name: 'Health Check', url: 'http://localhost:5000/health' },
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(endpoint.url, { timeout: 5000 });
      const data = response.data;
      
      console.log(`\n✅ ${endpoint.name}`);
      console.log(`   URL: ${endpoint.url}`);
      
      if (data.success) {
        const productCount = data.data?.products?.length || data.data?.pagination?.totalProducts || 0;
        console.log(`   Status: ${data.success ? 'SUCCESS' : 'FAILED'}`);
        console.log(`   Products: ${productCount}`);
      } else {
        console.log(`   ❌ Status: FAILED`);
        console.log(`   Message: ${data.message}`);
      }
    } catch (error) {
      console.error(`❌ ${endpoint.name}: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n🔧 RECOMMENDATIONS:\n');
  console.log('If products are not showing:');
  console.log('1. ✅ Ensure MongoDB URI in .env points to Cluster 1');
  console.log('2. ✅ Clear app cache on devices (Settings > Storage > Clear Cache)');
  console.log('3. ✅ Stop and restart the backend server');
  console.log('4. ✅ Check if seller ID matches current logged-in seller');
  console.log('5. ✅ Verify seller profile is complete & verified');
  console.log('6. ✅ Try adding a new product to test write operations');
  console.log('');
};

// Run only if MongoDB URI is set
if (process.env.MONGODB_URI) {
  runFullDiagnostics().catch(console.error);
} else {
  console.error('❌ MONGODB_URI not set in .env');
}
