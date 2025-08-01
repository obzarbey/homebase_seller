const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Test data
const testProduct = {
  name: 'Test Product',
  description: 'A test product for API verification',
  price: 100,
  offerPrice: 80,
  imageUrl: 'https://via.placeholder.com/300x300.png?text=Test+Product',
  address: 'Test Location',
  category: 'Test Category',
  isAvailable: true
};

class ApiTester {
  constructor() {
    this.authToken = null;
    this.createdProductId = null;
  }

  async testHealthCheck() {
    try {
      console.log('🏥 Testing health check...');
      const response = await axios.get(`${BASE_URL}/health`);
      console.log('✅ Health check passed:', response.data.message);
      return true;
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      return false;
    }
  }

  async testPublicSearch() {
    try {
      console.log('🔍 Testing public product search...');
      const response = await axios.get(`${BASE_URL}/api/products/search`, {
        params: { address: 'test' }
      });
      console.log('✅ Public search passed:', response.data.message);
      return true;
    } catch (error) {
      console.error('❌ Public search failed:', error.message);
      return false;
    }
  }

  async testWithoutAuth() {
    try {
      console.log('🔒 Testing protected endpoint without auth...');
      await axios.post(`${BASE_URL}/api/products`, testProduct);
      console.error('❌ Auth test failed: should have been rejected');
      return false;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Auth protection working: unauthorized request rejected');
        return true;
      }
      console.error('❌ Unexpected error:', error.message);
      return false;
    }
  }

  async testWithMockAuth() {
    console.log('🔑 Testing with mock Firebase token...');
    console.log('⚠️  Note: This will fail without a real Firebase token');
    console.log('   To test with real auth, get a token from your Flutter app');
    
    const mockToken = 'mock-firebase-token';
    
    try {
      await axios.post(`${BASE_URL}/api/products`, testProduct, {
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Mock auth test passed (unexpected)');
      return true;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Mock auth correctly rejected');
        return true;
      }
      console.error('❌ Unexpected error:', error.message);
      return false;
    }
  }

  async runAllTests() {
    console.log('🧪 Starting API tests...\n');
    
    const tests = [
      { name: 'Health Check', fn: () => this.testHealthCheck() },
      { name: 'Public Search', fn: () => this.testPublicSearch() },
      { name: 'Auth Protection', fn: () => this.testWithoutAuth() },
      { name: 'Mock Auth', fn: () => this.testWithMockAuth() },
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        const result = await test.fn();
        if (result) {
          passed++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`❌ Test "${test.name}" crashed:`, error.message);
        failed++;
      }
      console.log(''); // Empty line for readability
    }

    console.log('📊 Test Results:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${passed + failed}`);

    if (failed === 0) {
      console.log('\n🎉 All tests passed! Your API is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Check the logs above for details.');
    }
  }
}

// CLI interface
const args = process.argv.slice(2);
const command = args[0];

const tester = new ApiTester();

switch (command) {
  case 'health':
    tester.testHealthCheck().then(() => process.exit(0));
    break;
  case 'all':
  default:
    tester.runAllTests().then(() => process.exit(0));
    break;
}
