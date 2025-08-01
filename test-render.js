const https = require('https');

console.log('🔍 Testing MongoDB API on Render...');

// Test health endpoint
https.get('https://homebase-seller.onrender.com/health', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('✅ Health Check Response:');
    console.log(JSON.stringify(JSON.parse(data), null, 2));
    
    // Check if database is connected
    const response = JSON.parse(data);
    if (response.database && response.database.connected) {
      console.log('✅ Database Status: Connected');
      console.log('🏠 Database Host:', response.database.host);
    } else {
      console.log('❌ Database Status: Not Connected');
      console.log('🔧 Database Info:', response.database);
    }
  });
}).on('error', (err) => {
  console.error('❌ Health check failed:', err.message);
});
