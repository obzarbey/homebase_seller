const mongoose = require('mongoose');
const Product = require('./models/Product');
const ProductCatalog = require('./models/ProductCatalog');
const SellerProduct = require('./models/SellerProduct');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const migrateToCentralizedSystem = async () => {
  console.log('🔄 Starting migration to centralized product catalog system...');
  
  try {
    // Get all existing products
    console.log('📥 Fetching existing products...');
    const existingProducts = await Product.find({}).lean();
    
    if (existingProducts.length === 0) {
      console.log('📭 No existing products found');
      return;
    }
    
    console.log(`📊 Found ${existingProducts.length} existing products`);
    
    let catalogCount = 0;
    let sellerProductCount = 0;
    let errorCount = 0;
    
    // Group products by name + category to create catalog entries
    const catalogGroups = new Map();
    
    for (const product of existingProducts) {
      const key = `${product.name.toLowerCase()}_${product.category.toLowerCase()}`;
      
      if (!catalogGroups.has(key)) {
        catalogGroups.set(key, {
          name: product.name,
          category: product.category,
          description: product.description || '',
          imageUrl: product.imageUrl,
          products: []
        });
      }
      
      catalogGroups.get(key).products.push(product);
    }
    
    console.log(`📋 Created ${catalogGroups.size} unique catalog entries`);
    
    // Create catalog entries and seller products
    for (const [key, group] of catalogGroups) {
      try {
        // Create catalog entry
        const catalogProduct = new ProductCatalog({
          name: group.name,
          brand: '', // Extract from name if possible
          category: group.category,
          description: group.description,
          unit: 'piece',
          imageUrl: group.imageUrl,
          status: 'approved', // Auto-approve existing products
          createdBy: group.products[0].sellerId, // Use first seller as creator
          approvedBy: 'system_migration',
          approvedAt: new Date()
        });
        
        const savedCatalogProduct = await catalogProduct.save();
        catalogCount++;
        
        console.log(`✅ Created catalog entry: "${savedCatalogProduct.name}"`);
        
        // Create seller products for each original product
        for (const originalProduct of group.products) {
          try {
            const sellerProduct = new SellerProduct({
              sellerId: originalProduct.sellerId,
              productId: savedCatalogProduct._id,
              price: originalProduct.price,
              offerPrice: originalProduct.offerPrice || 0,
              stock: 10, // Default stock since old system didn't track it
              address: originalProduct.address,
              customNote: '',
              customImageUrl: originalProduct.imageUrl !== group.imageUrl ? originalProduct.imageUrl : null,
              customImagePath: originalProduct.imagePath || null,
              isAvailable: originalProduct.isAvailable,
              status: originalProduct.isAvailable ? 'active' : 'inactive',
              createdAt: originalProduct.timestamp || originalProduct.createdAt || new Date(),
              updatedAt: originalProduct.updatedAt || new Date()
            });
            
            await sellerProduct.save();
            sellerProductCount++;
            
          } catch (error) {
            console.error(`❌ Error creating seller product for ${originalProduct.name}:`, error.message);
            errorCount++;
          }
        }
        
      } catch (error) {
        console.error(`❌ Error creating catalog entry for ${group.name}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n🎉 Migration completed!`);
    console.log(`✅ Catalog entries created: ${catalogCount}`);
    console.log(`✅ Seller products created: ${sellerProductCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Original products: ${existingProducts.length}`);
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
  }
};

const validateMigration = async () => {
  console.log('🔍 Validating migration...');
  
  try {
    const originalCount = await Product.countDocuments();
    const catalogCount = await ProductCatalog.countDocuments();
    const sellerProductCount = await SellerProduct.countDocuments();
    
    console.log(`📊 Original products: ${originalCount}`);
    console.log(`📊 Catalog entries: ${catalogCount}`);
    console.log(`📊 Seller products: ${sellerProductCount}`);
    
    if (sellerProductCount >= originalCount) {
      console.log('✅ Migration validation passed');
    } else {
      console.log('⚠️  Migration validation failed - some products may be missing');
    }
    
  } catch (error) {
    console.error('❌ Validation error:', error);
  }
};

const cleanupOldData = async () => {
  console.log('🧹 Starting cleanup of old product data...');
  
  try {
    // Backup old products before deletion
    const backupCount = await Product.countDocuments();
    console.log(`📦 Backing up ${backupCount} old products...`);
    
    // You might want to export to a backup collection first
    // await Product.aggregate([{ $out: "products_backup" }]);
    
    // For now, just log the action
    console.log('⚠️  Cleanup not performed - uncomment code in cleanupOldData() to proceed');
    console.log('⚠️  Remember to backup your data before cleanup!');
    
    // Uncomment these lines when ready to cleanup:
    // await Product.deleteMany({});
    // console.log('✅ Old products cleaned up');
    
  } catch (error) {
    console.error('❌ Cleanup error:', error);
  }
};

// CLI interface
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'migrate':
    migrateToCentralizedSystem().then(() => {
      mongoose.connection.close();
      process.exit(0);
    });
    break;
  case 'validate':
    validateMigration().then(() => {
      mongoose.connection.close();
      process.exit(0);
    });
    break;
  case 'cleanup':
    cleanupOldData().then(() => {
      mongoose.connection.close();
      process.exit(0);
    });
    break;
  case 'help':
  default:
    console.log(`
🔄 Centralized Product Catalog Migration Tool

Usage:
  node migrate-to-catalog.js migrate    - Migrate products to centralized system
  node migrate-to-catalog.js validate  - Validate migration (compare counts)
  node migrate-to-catalog.js cleanup   - Clean up old product data (DESTRUCTIVE!)
  node migrate-to-catalog.js help      - Show this help message

Migration Process:
1. Run 'migrate' to create catalog and seller-product entries
2. Run 'validate' to check migration success
3. Test the new system thoroughly
4. Run 'cleanup' to remove old data (BACKUP FIRST!)

⚠️  Important: Always backup your database before migration!
    `);
    break;
}

module.exports = {
  migrateToCentralizedSystem,
  validateMigration,
  cleanupOldData
};
