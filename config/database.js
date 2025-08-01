const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MongoDB URI is provided
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    console.log('🔄 Connecting to MongoDB...');
    console.log('Environment:', process.env.NODE_ENV || 'development');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      maxPoolSize: 10, // Maximum number of connections in the connection pool
      minPoolSize: 1, // Minimum number of connections in the connection pool
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    
    // Provide helpful debugging information
    if (error.message.includes('IP')) {
      console.error('💡 Suggestion: Check MongoDB Atlas IP whitelist');
      console.error('   - Add 0.0.0.0/0 to allow all IPs (for Render deployment)');
      console.error('   - Or add Render\'s IP ranges to the whitelist');
    }
    
    if (error.message.includes('authentication')) {
      console.error('💡 Suggestion: Check MongoDB credentials in MONGODB_URI');
    }
    
    console.error('🔧 Current MONGODB_URI format check:');
    const uri = process.env.MONGODB_URI;
    if (uri) {
      const maskedUri = uri.replace(/:([^:@]+)@/, ':***@');
      console.error(`   ${maskedUri}`);
    } else {
      console.error('   MONGODB_URI is not set!');
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;
