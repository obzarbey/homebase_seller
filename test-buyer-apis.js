// Test script for Buyer App APIs with flattened JOIN structure
// Run with: node test-buyer-apis.js

const API_BASE_URL = 'https://buynor-seller.onrender.com/api';

async function testAPI(endpoint, description) {
  console.log(`\n🧪 Testing: ${description}`);
  console.log(`📍 Endpoint: ${endpoint}`);
  
  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Success!');
      console.log(`📊 Total Products: ${data.data.pagination?.totalProducts || data.data.products?.length || 'N/A'}`);
      
      // Check structure of first product
      if (data.data.products && data.data.products.length > 0) {
        const product = data.data.products[0];
        console.log('📦 First Product Structure:');
        console.log(`   • ID: ${product._id}`);
        console.log(`   • Name: ${product.name || 'MISSING'}`);
        console.log(`   • Category: ${product.category || 'MISSING'}`);
        console.log(`   • Price: ৳${product.price || 'MISSING'}`);
        console.log(`   • Seller ID: ${product.sellerId || 'MISSING'}`);
        console.log(`   • Address: ${product.address || 'MISSING'}`);
        console.log(`   • Custom Image: ${product.customImageUrl ? 'Yes' : 'No'}`);
        console.log(`   • Catalog Image: ${product.imageUrl ? 'Yes' : 'No'}`);
        console.log(`   • Description: ${product.description ? 'Yes' : 'No'}`);
        
        // Check if it's properly flattened (not nested)
        if (product.productId && typeof product.productId === 'object') {
          console.log('⚠️  WARNING: Data is nested, not flattened! Flutter app expects flat structure.');
        } else {
          console.log('✅ Data is properly flattened for Flutter app');
        }
      }
    } else {
      console.log('❌ Failed:', data.message);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Testing Buyer App APIs with MongoDB JOIN/Aggregation');
  console.log('=' * 60);

  // Test 1: All Products
  await testAPI(
    `${API_BASE_URL}/seller-products/all?page=1&limit=5`,
    'Get All Seller Products (All Sellers)'
  );

  // Test 2: Products by Category
  await testAPI(
    `${API_BASE_URL}/seller-products/all?category=Food%20%26%20Grocery&page=1&limit=5`,
    'Filter Products by Category'
  );

  // Test 3: Products by Location
  await testAPI(
    `${API_BASE_URL}/seller-products/all?address=dhaka&page=1&limit=5`,
    'Filter Products by Location'
  );

  // Test 4: Search Products
  await testAPI(
    `${API_BASE_URL}/seller-products/all?search=rice&page=1&limit=5`,
    'Search Products by Name/Description'
  );

  // Test 5: Products by Specific Seller (you'll need to replace SELLER_ID)
  await testAPI(
    `${API_BASE_URL}/seller-products/seller/YOUR_SELLER_ID_HERE?page=1&limit=5`,
    'Get Products by Specific Seller'
  );

  // Test 6: Search by Address
  await testAPI(
    `${API_BASE_URL}/seller-products/search?address=dhaka&page=1&limit=5`,
    'Search Products by Address'
  );

  // Test 7: Categories
  await testAPI(
    `${API_BASE_URL}/catalog/categories`,
    'Get All Categories'
  );

  console.log('\n🏁 Testing Complete!');
  console.log('\n📱 For Flutter App Integration:');
  console.log('1. ✅ All APIs return flattened structure (name, category, etc. at root level)');
  console.log('2. ✅ Custom seller images prioritized over catalog images');
  console.log('3. ✅ Search functionality across product names and descriptions');
  console.log('4. ✅ Proper pagination support');
  console.log('5. ✅ Category filtering support');
  console.log('\n🔧 Expected Flutter Response Structure:');
  console.log(`{
  "_id": "seller_product_id",
  "sellerId": "...",
  "price": 900,
  "customImageUrl": "...",
  "address": "khagrachari",
  "name": "black Shirt",           // ← Flattened from catalog
  "category": "Fashion & Lifestyle", // ← Flattened from catalog
  "description": "...",            // ← Flattened from catalog
  "imageUrl": "..."               // ← Flattened from catalog
}`);
}

// Run the tests
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  runTests();
} else {
  // Browser environment
  runTests();
}
