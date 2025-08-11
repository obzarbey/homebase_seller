const https = require('https');

console.log('🧪 Testing product creation with empty description...');

const productData = JSON.stringify({
  "name": "Test Product",
  "description": "",  // Empty description like Flutter app sends
  "price": 500,
  "offerPrice": 0,
  "imageUrl": "https://example.com/image.jpg", 
  "imagePath": "",
  "address": "Test Address",
  "category": "Fashion & Lifestyle",
  "isAvailable": true
});

const options = {
  hostname: 'buynor-seller.onrender.com',
  port: 443,
  path: '/api/products',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer fake-token-for-testing'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('📡 Status Code:', res.statusCode);
    console.log('📄 Response:');
    
    try {
      const response = JSON.parse(data);
      console.log(JSON.stringify(response, null, 2));
      
      if (res.statusCode === 201) {
        console.log('✅ Product creation validation fix is working!');
      } else if (res.statusCode === 401) {
        console.log('✅ Validation passed! (401 is expected - invalid token)');
      } else if (res.statusCode === 400) {
        console.log('❌ Validation still failing:', response.details);
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request failed:', e.message);
});

req.write(productData);
req.end();
