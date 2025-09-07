const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testCategoryFiltering() {
  try {
    console.log('🧪 Testing Category Filtering...\n');
    
    // Test 1: Get products from a seller with custom categories
    console.log('📋 Test 1: Testing seller with custom categories...');
    const sellerId = '3KWxl3rIHaV3S9WR5WMC1FgF5h63'; // From your MongoDB sample
    
    // Get all products from this seller
    const allProductsResponse = await axios.get(`${BASE_URL}/api/seller-products/seller/${sellerId}`);
    const allProducts = allProductsResponse.data.data;
    console.log(`   Found ${allProducts.length} total products for seller`);
    
    // Show categories available
    const categories = [...new Set(allProducts.map(p => p.category || p.customCategory || 'Unknown'))];
    console.log(`   Available categories: ${categories.join(', ')}`);
    
    // Test 2: Filter by custom category "Personal Care"
    console.log('\n📋 Test 2: Filtering by custom category "Personal Care"...');
    const personalCareResponse = await axios.get(`${BASE_URL}/api/seller-products/seller/${sellerId}?category=Personal Care`);
    const personalCareProducts = personalCareResponse.data.data;
    console.log(`   Found ${personalCareProducts.length} products in "Personal Care" category`);
    
    personalCareProducts.forEach(product => {
      console.log(`   - ${product.name} (category: ${product.category}, customCategory: ${product.customCategory || 'null'})`);
    });
    
    // Test 3: Filter by original catalog category "Baby & Kids"
    console.log('\n📋 Test 3: Filtering by original category "Baby & Kids"...');
    const babyKidsResponse = await axios.get(`${BASE_URL}/api/seller-products/seller/${sellerId}?category=Baby & Kids`);
    const babyKidsProducts = babyKidsResponse.data.data;
    console.log(`   Found ${babyKidsProducts.length} products in "Baby & Kids" category`);
    
    babyKidsProducts.forEach(product => {
      console.log(`   - ${product.name} (category: ${product.category}, customCategory: ${product.customCategory || 'null'})`);
    });
    
    console.log('\n✅ Category filtering test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    console.error('Stack:', error.stack);
  }
}

// Run the test
testCategoryFiltering();
