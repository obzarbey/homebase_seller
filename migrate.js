const admin = require('firebase-admin');
const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

// Initialize Firebase Admin
const { initializeFirebase } = require('./config/firebase');
initializeFirebase();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const migrateProducts = async () => {
  console.log('🔄 Starting product migration from Firestore to MongoDB...');
  
  try {
    const firestore = admin.firestore();
    
    // Get all products from Firestore
    console.log('📥 Fetching products from Firestore...');
    const snapshot = await firestore.collection('products').get();
    
    if (snapshot.empty) {
      console.log('📭 No products found in Firestore');
      return;
    }
    
    console.log(`📊 Found ${snapshot.size} products in Firestore`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process each product
    for (const doc of snapshot.docs) {
      try {
        const firestoreData = doc.data();
        
        // Transform Firestore data to MongoDB format
        const mongoProduct = {
          name: firestoreData.name || '',
          description: firestoreData.description || '',
          price: Number(firestoreData.price) || 0,
          offerPrice: Number(firestoreData.offerPrice) || 0,
          imageUrl: firestoreData.imageUrl || '',
          imagePath: firestoreData.imagePath || '',
          sellerId: firestoreData.sellerId || '',
          address: firestoreData.address || '',
          isAvailable: firestoreData.isAvailable !== false, // Default to true if not specified
          category: firestoreData.category || '',
          timestamp: firestoreData.timestamp ? firestoreData.timestamp.toDate() : new Date(),
        };
        
        // Check if product already exists in MongoDB
        const existingProduct = await Product.findOne({
          sellerId: mongoProduct.sellerId,
          name: mongoProduct.name,
          timestamp: mongoProduct.timestamp
        });
        
        if (existingProduct) {
          console.log(`⏭️  Product "${mongoProduct.name}" already exists, skipping...`);
          continue;
        }
        
        // Create new product in MongoDB
        const newProduct = new Product(mongoProduct);
        await newProduct.save();
        
        successCount++;
        console.log(`✅ Migrated: "${mongoProduct.name}" (${successCount}/${snapshot.size})`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error migrating product ${doc.id}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Migration completed!`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total processed: ${snapshot.size}`);
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
  } finally {
    // Close connections
    await mongoose.connection.close();
    console.log('📤 Database connections closed');
    process.exit(0);
  }
};

// Validation function
const validateMigration = async () => {
  console.log('🔍 Validating migration...');
  
  try {
    const firestore = admin.firestore();
    const firestoreSnapshot = await firestore.collection('products').get();
    const mongoCount = await Product.countDocuments();
    
    console.log(`📊 Firestore products: ${firestoreSnapshot.size}`);
    console.log(`📊 MongoDB products: ${mongoCount}`);
    
    if (mongoCount >= firestoreSnapshot.size) {
      console.log('✅ Migration validation passed');
    } else {
      console.log('⚠️  Migration validation failed - some products may be missing');
    }
    
  } catch (error) {
    console.error('❌ Validation error:', error);
  }
};

// CLI interface
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'migrate':
    migrateProducts();
    break;
  case 'validate':
    validateMigration().then(() => {
      mongoose.connection.close();
      process.exit(0);
    });
    break;
  case 'help':
  default:
    console.log(`
🔄 Firestore to MongoDB Migration Tool

Usage:
  node migrate.js migrate    - Migrate all products from Firestore to MongoDB
  node migrate.js validate  - Validate migration (compare counts)
  node migrate.js help      - Show this help message

Before running:
1. Ensure your .env file is configured with both Firebase and MongoDB credentials
2. Make sure the MongoDB database is accessible
3. Backup your data before migration

Example:
  node migrate.js migrate
    `);
    process.exit(0);
}
