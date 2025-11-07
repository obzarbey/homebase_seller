// Test script for Shop Management API endpoints
const https = require('https');

const API_BASE_URL = 'https://homebase-seller.onrender.com/api/shop-management';

// Test function to make API calls
function testAPI(endpoint, method = 'GET', data = null, description = '') {
  return new Promise((resolve, reject) => {
    console.log(`\n🧪 Testing: ${description}`);
    console.log(`📡 ${method} ${endpoint}`);
    
    const url = new URL(endpoint);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        // Note: In real usage, you need Firebase auth token here
        // 'Authorization': 'Bearer YOUR_FIREBASE_TOKEN'
      }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode}`);
        
        try {
          const jsonResponse = JSON.parse(responseData);
          console.log(`✅ Response: ${JSON.stringify(jsonResponse, null, 2)}`);
          resolve({ status: res.statusCode, data: jsonResponse });
        } catch (e) {
          console.log(`📝 Raw Response: ${responseData.substring(0, 200)}...`);
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Request failed: ${error.message}`);
      reject(error);
    });

    if (data && (method === 'POST' || method === 'PUT')) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Shop Management API Tests');
  console.log('📍 Base URL:', API_BASE_URL);
  
  try {
    // Test 1: Health check (will likely fail due to auth, but shows if server is up)
    await testAPI(
      `${API_BASE_URL}/sales?page=1&limit=5`,
      'GET',
      null,
      'Get Sales Data (expect auth error, but shows server status)'
    );

    // // Test 2: Manual sale creation (will fail due to auth)
    // await testAPI(
    //   `${API_BASE_URL}/sales/manual`,
    //   'POST',
    //   {
    //     productId: 'test_product_123',
    //     productName: 'Test Product',
    //     quantity: 2,
    //     sellingPrice: 100,
    //     costPrice: 70,
    //     category: 'Test Category'
    //   },
    //   'Create Manual Sale (expect auth error)'
    // );

    // // Test 3: Add expense (will fail due to auth)
    // await testAPI(
    //   `${API_BASE_URL}/expenses`,
    //   'POST',
    //   {
    //     title: 'Test Expense',
    //     description: 'Testing expense creation',
    //     amount: 50,
    //     category: 'operational',
    //     type: 'one-time'
    //   },
    //   'Create Expense (expect auth error)'
    // );

    // Test 4: Get expenses (will fail due to auth)
    await testAPI(
      `${API_BASE_URL}/expenses?page=1&limit=5`,
      'GET',
      null,
      'Get Expenses Data (expect auth error)'
    );

    // Test 5: Get profit/loss report (will fail due to auth)
    await testAPI(
      `${API_BASE_URL}/report/profit-loss`,
      'GET',
      null,
      'Get Profit/Loss Report (expect auth error)'
    );

    console.log('\n🏁 Testing Complete!');
    console.log('\n📝 Expected Results:');
    console.log('- All requests should return 401/403 (authentication errors)');
    console.log('- This confirms the server is running and routes are accessible');
    console.log('- Authentication will work when called from the Flutter app with Firebase tokens');

  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Run all tests
runTests();