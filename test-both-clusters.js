const mongoose = require('mongoose');

// Test both MongoDB clusters
const testClusters = async () => {
  console.log('🔍 Testing MongoDB Clusters Connection\n');

  // Cluster 0 (Old)
  const cluster0_uri = 'mongodb+srv://obzarbey:Atlas(1234)@cluster0.hjp2hxa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  
  // Cluster 1 (New)
  const cluster1_uri = 'mongodb+srv://obzarbey:Atlas(1234)@cluster1.z7e5e7e.mongodb.net/?appName=Cluster1';

  try {
    // Test Cluster 0
    console.log('📊 Testing Cluster 0 (Old)...');
    const conn0 = await mongoose.connect(cluster0_uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });
    
    console.log('✅ Cluster 0 Connected:', conn0.connection.host);
    
    // Count products in cluster 0
    const productModel0 = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    const count0 = await productModel0.collection.countDocuments();
    console.log('📦 Products in Cluster 0:', count0);
    
    // Get sample products
    if (count0 > 0) {
      const sample = await productModel0.collection.findOne();
      console.log('📋 Sample product from Cluster 0:');
      console.log(JSON.stringify(sample, null, 2));
    }
    
    await conn0.disconnect();
    console.log('✅ Cluster 0 Disconnected\n');

  } catch (error) {
    console.error('❌ Cluster 0 Error:', error.message);
  }

  try {
    // Test Cluster 1
    console.log('📊 Testing Cluster 1 (New)...');
    const conn1 = await mongoose.connect(cluster1_uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });
    
    console.log('✅ Cluster 1 Connected:', conn1.connection.host);
    
    // Count products in cluster 1
    const productModel1 = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    const count1 = await productModel1.collection.countDocuments();
    console.log('📦 Products in Cluster 1:', count1);
    
    // Get sample products
    if (count1 > 0) {
      const sample = await productModel1.collection.findOne();
      console.log('📋 Sample product from Cluster 1:');
      console.log(JSON.stringify(sample, null, 2));
    } else {
      console.log('⚠️  No products found in Cluster 1');
    }
    
    await conn1.disconnect();
    console.log('✅ Cluster 1 Disconnected\n');

  } catch (error) {
    console.error('❌ Cluster 1 Error:', error.message);
  }

  console.log('\n=== Summary ===');
  console.log('If Cluster 0 has products but Cluster 1 doesn\'t:');
  console.log('1. You need to migrate data from Cluster 0 to Cluster 1');
  console.log('2. Or revert to using Cluster 0 URI in .env');
};

testClusters().catch(console.error);
