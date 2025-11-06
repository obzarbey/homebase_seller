const mongoose = require('mongoose');

// Define the schemas
const productCatalogSchema = new mongoose.Schema({}, { strict: false });
const sellerProductSchema = new mongoose.Schema({}, { strict: false });

const runDiagnostics = async () => {
  console.log('🔍 Checking Collections in Cluster 1\n');
  console.log('=' .repeat(70));

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ Connected to:', conn.connection.host);
    console.log('📊 Database:', conn.connection.name);

    // Get models
    const ProductCatalog = mongoose.model('ProductCatalog', productCatalogSchema);
    const SellerProduct = mongoose.model('SellerProduct', sellerProductSchema);

    // Check ProductCatalog collection
    console.log('\n📦 ProductCatalog Collection:');
    const catalogCount = await ProductCatalog.collection.countDocuments();
    console.log(`   Total Products: ${catalogCount}`);

    if (catalogCount > 0) {
      const sampleCatalog = await ProductCatalog.collection.findOne();
      console.log('\n   📋 Sample Product:');
      console.log(`   - ID: ${sampleCatalog._id}`);
      console.log(`   - Name: ${sampleCatalog.name}`);
      console.log(`   - Category: ${sampleCatalog.category}`);
      console.log(`   - Status: ${sampleCatalog.status}`);
      console.log(`   - CreatedBy: ${sampleCatalog.createdBy}`);
    }

    // Check SellerProduct collection
    console.log('\n\n🛍️ SellerProduct Collection:');
    const sellerCount = await SellerProduct.collection.countDocuments();
    console.log(`   Total Seller Products: ${sellerCount}`);

    if (sellerCount > 0) {
      const sampleSeller = await SellerProduct.collection.findOne();
      console.log('\n   📋 Sample Seller Product:');
      console.log(`   - ID: ${sampleSeller._id}`);
      console.log(`   - Seller ID: ${sampleSeller.sellerId}`);
      console.log(`   - Product ID (Reference): ${sampleSeller.productId}`);
      console.log(`   - Price: ${sampleSeller.price}`);
      console.log(`   - Stock: ${sampleSeller.stock}`);
      console.log(`   - Status: ${sampleSeller.status}`);
      console.log(`   - Address: ${sampleSeller.address}`);
    }

    // Group seller products by seller
    console.log('\n\n👥 Seller Products by Seller:');
    const sellerStats = await SellerProduct.collection.aggregate([
      {
        $group: {
          _id: '$sellerId',
          count: { $sum: 1 },
          activeCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
            }
          },
          totalStock: { $sum: '$stock' }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();

    if (sellerStats.length === 0) {
      console.log('   ⚠️  No seller products found');
    } else {
      sellerStats.forEach((seller, index) => {
        console.log(`\n   ${index + 1}. Seller: ${seller._id}`);
        console.log(`      - Total Products: ${seller.count}`);
        console.log(`      - Active Products: ${seller.activeCount}`);
        console.log(`      - Total Stock: ${seller.totalStock}`);
      });
    }

    // Check Product collection (old)
    console.log('\n\n⚠️ Legacy Product Collection (Old):');
    try {
      const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
      const productCount = await Product.collection.countDocuments();
      console.log(`   Total Products: ${productCount}`);
      
      if (productCount > 0) {
        const sample = await Product.collection.findOne();
        console.log(`   Sample: ${sample.name}`);
        console.log(`   ⚠️  These products are NOT being used by the new system`);
      }
    } catch (e) {
      console.log('   Collection does not exist (Expected)');
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n📋 SUMMARY:');
    console.log(`   - ProductCatalog: ${catalogCount} products`);
    console.log(`   - SellerProduct: ${sellerCount} seller-specific products`);
    console.log(`   - Sellers with products: ${sellerStats.length}`);
    
    if (sellerCount === 0) {
      console.log('\n❌ NO SELLER PRODUCTS FOUND!');
      console.log('\n💡 To fix:');
      console.log('   1. Add ProductCatalog entries (base products)');
      console.log('   2. Add SellerProduct entries (seller-specific pricing & stock)');
      console.log('   3. Or migrate data from old cluster if it had products');
    } else {
      console.log('\n✅ Products are in the database!');
      console.log('   If still not showing in app:');
      console.log('   1. Clear app cache');
      console.log('   2. Restart backend server');
      console.log('   3. Check seller account UID matches one in the list');
    }

    await conn.disconnect();

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

if (process.env.MONGODB_URI) {
  runDiagnostics();
} else {
  console.error('❌ MONGODB_URI not set');
}
