// Test script for manual sale API endpoint
const https = require('https');

const API_BASE_URL = 'https://homebase-seller.onrender.com/api/shop-management';

// Test data matching what the Flutter app sends
const testSaleData = {
  productId: 'manual_1699372800000',
  productName: 'Test Product',
  customName: null,
  quantity: 2,
  sellingPrice: 100.0,
  costPrice: 70.0,
  category: 'Manual Entry',
  customerName: null,
  customerPhone: null,
  notes: null,
  saleDate: new Date().toISOString(),
  isWeightBased: false,
  unit: 'piece',
  imageUrl: null
};

function testManualSaleAPI() {
  return new Promise((resolve, reject) => {
    console.log('🧪 Testing Manual Sale API');
    console.log('📡 POST /api/shop-management/sales/manual');
    console.log('📊 Test Data:', JSON.stringify(testSaleData, null, 2));
    
    const url = new URL(`${API_BASE_URL}/sales/manual`);
    const postData = JSON.stringify(testSaleData);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        // Note: In real usage, you need Firebase auth token here
        // 'Authorization': 'Bearer YOUR_FIREBASE_TOKEN'
      }
    };

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
          
          if (res.statusCode === 401 || res.statusCode === 403) {
            console.log('🔐 Expected: Authentication required (this is normal for testing)');
          } else if (res.statusCode === 400) {
            console.log('❌ Validation Error - Check the details above');
          } else if (res.statusCode === 201) {
            console.log('✅ Success: Manual sale would be created with proper auth');
          }
          
          resolve({ status: res.statusCode, data: jsonResponse });
        } catch (e) {
          console.log(`📝 Raw Response: ${responseData}`);
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Request failed: ${error.message}`);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Test the health endpoint first
function testHealthEndpoint() {
  return new Promise((resolve, reject) => {
    console.log('🏥 Testing Health Endpoint');
    console.log('📡 GET /api/shop-management/health');
    
    const url = new URL(`${API_BASE_URL}/health`);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

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
          console.log(`📝 Raw Response: ${responseData}`);
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Request failed: ${error.message}`);
      reject(error);
    });

    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Manual Sale API Tests');
  console.log('📍 Base URL:', API_BASE_URL);
  console.log('=' .repeat(50));
  
  try {
    // Test 1: Health check
    await testHealthEndpoint();
    
    console.log('\n' + '=' .repeat(50));
    
    // Test 2: Manual sale creation
    await testManualSaleAPI();

    console.log('\n🏁 Testing Complete!');
    console.log('\n📝 What to expect:');
    console.log('- Health endpoint: ✅ 200 OK with API info');
    console.log('- Manual sale: 🔐 401 Unauthorized (normal without auth token)');
    console.log('- If you see validation errors, check the backend validation rules');

  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Run all tests
runTests();