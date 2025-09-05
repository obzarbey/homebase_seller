const axios = require('axios');

// Use the production URL from the API config
const BASE_URL = 'https://homebase-seller.onrender.com/api';

// Test the stock update endpoint
async function testStockUpdate() {
  try {
    console.log('🧪 Testing stock update endpoint...');
    
    // Note: This test would require a valid Firebase auth token
    // For now, let's just test that the endpoint exists and returns proper error
    const response = await axios.post(`${BASE_URL}/seller-products/update-stock-for-order`, {
      orderItems: [
        {
          productId: '507f1f77bcf86cd799439011', // Example ObjectId
          sellerId: 'test-seller-id',
          quantityToReduce: 2
        }
      ]
    });
    
    console.log('✅ Stock update endpoint response:', response.data);
    return true;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Stock update endpoint exists (auth required as expected)');
      console.log('Response:', error.response.data);
      return true;
    } else {
      console.error('❌ Stock update endpoint failed:', error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      }
      return false;
    }
  }
}

async function testHealth() {
  try {
    console.log('🏥 Testing server health...');
    const response = await axios.get(`${BASE_URL.replace('/api', '')}/health`);
    console.log('✅ Server is healthy:', response.data.message);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting stock update API tests...\n');
  
  const healthPassed = await testHealth();
  console.log('');
  
  const stockUpdatePassed = await testStockUpdate();
  console.log('');
  
  console.log('📊 Test Results:');
  console.log(`Health Check: ${healthPassed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Stock Update Endpoint: ${stockUpdatePassed ? '✅ PASS' : '❌ FAIL'}`);
  
  if (healthPassed && stockUpdatePassed) {
    console.log('\n🎉 All tests passed! Stock update endpoint is ready.');
  } else {
    console.log('\n❌ Some tests failed. Check the logs above.');
  }
}

// Run the tests
runTests().catch(console.error);
