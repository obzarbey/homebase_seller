const axios = require('axios');

// Test the production-ready add-product API
const testAddProductAPI = async () => {
  const baseURL = process.env.NODE_ENV === 'production' 
    ? 'https://homebase-seller.onrender.com/api'
    : 'http://localhost:3000/api';

  console.log('Testing Production-Ready Add Product API');
  console.log('='.repeat(50));

  // Test cases
  const testCases = [
    {
      name: 'Valid Product',
      data: {
        name: 'Test Product',
        description: 'A great test product',
        price: 29.99,
        offerPrice: 24.99,
        imageUrl: 'https://example.com/image.jpg',
        address: 'Test Address, City',
        category: 'Electronics',
        isAvailable: true
      },
      shouldSucceed: true
    },
    {
      name: 'Missing Required Fields',
      data: {
        description: 'Product without name',
        price: 29.99
      },
      shouldSucceed: false
    },
    {
      name: 'Invalid Price',
      data: {
        name: 'Test Product',
        price: -10,
        imageUrl: 'https://example.com/image.jpg',
        address: 'Test Address',
        category: 'Electronics'
      },
      shouldSucceed: false
    },
    {
      name: 'Invalid URL',
      data: {
        name: 'Test Product',
        price: 29.99,
        imageUrl: 'not-a-valid-url',
        address: 'Test Address',
        category: 'Electronics'
      },
      shouldSucceed: false
    },
    {
      name: 'Offer Price Greater Than Price',
      data: {
        name: 'Test Product',
        price: 20.00,
        offerPrice: 25.00,
        imageUrl: 'https://example.com/image.jpg',
        address: 'Test Address',
        category: 'Electronics'
      },
      shouldSucceed: false
    }
  ];

  for (const testCase of testCases) {
    console.log(`\nTesting: ${testCase.name}`);
    console.log('-'.repeat(30));
    
    try {
      const response = await axios.post(`${baseURL}/products`, testCase.data, {
        headers: {
          'Content-Type': 'application/json',
          // Note: In real testing, you'd need a valid Firebase token here
          'Authorization': 'Bearer YOUR_FIREBASE_TOKEN'
        }
      });

      if (testCase.shouldSucceed) {
        console.log('✅ Test passed - Product created successfully');
        console.log('Response:', {
          success: response.data.success,
          message: response.data.message,
          productId: response.data.data?.id
        });
      } else {
        console.log('❌ Test failed - Expected validation error but got success');
      }
    } catch (error) {
      if (!testCase.shouldSucceed) {
        console.log('✅ Test passed - Validation error caught as expected');
        console.log('Error:', {
          status: error.response?.status,
          message: error.response?.data?.message,
          errors: error.response?.data?.errors
        });
      } else {
        console.log('❌ Test failed - Unexpected error');
        console.log('Error:', error.response?.data || error.message);
      }
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('Production API Testing Complete');
};

// Health check test
const testHealthCheck = async () => {
  const baseURL = process.env.NODE_ENV === 'production' 
    ? 'https://homebase-seller.onrender.com'
    : 'http://localhost:3000';

  try {
    const response = await axios.get(`${baseURL}/health`);
    console.log('✅ Health Check Passed:', response.data);
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
  }
};

// Run tests
const runTests = async () => {
  console.log('Starting Production API Tests...\n');
  
  await testHealthCheck();
  console.log();
  await testAddProductAPI();
};

// Only run if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testAddProductAPI, testHealthCheck };
