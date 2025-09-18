// Test offer filtering logic
const mongoose = require('mongoose');
const SellerProduct = require('./models/SellerProduct');
require('dotenv').config();

async function testOfferFiltering() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dealmart');
    console.log('✅ Connected to MongoDB');
    
    // Test the aggregation pipeline for offers
    const pipeline = [
      {
        $match: {
          isAvailable: true,
          status: 'active',
          $expr: {
            $and: [
              { $gt: ['$offerPrice', 0] },
              { $lt: ['$offerPrice', '$price'] }
            ]
          }
        }
      },
      {
        $lookup: {
          from: 'productcatalogs',
          localField: 'productId',
          foreignField: '_id',
          as: 'catalogData'
        }
      },
      {
        $unwind: {
          path: '$catalogData',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          sellerId: 1,
          price: 1,
          offerPrice: 1,
          customName: 1,
          name: { 
            $cond: { 
              if: { $and: [{ $ne: ['$customName', null] }, { $ne: ['$customName', ''] }] }, 
              then: '$customName', 
              else: '$catalogData.name' 
            } 
          },
          catalogName: '$catalogData.name',
          offerValid: {
            $and: [
              { $gt: ['$offerPrice', 0] },
              { $lt: ['$offerPrice', '$price'] }
            ]
          }
        }
      },
      { $limit: 10 }
    ];
    
    console.log('\n🔍 Testing offer filtering pipeline...');
    const results = await SellerProduct.aggregate(pipeline);
    
    console.log(`📊 Found ${results.length} products with valid offers`);
    
    results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.name}`);
      console.log(`   Regular Price: ৳${result.price}`);
      console.log(`   Offer Price: ৳${result.offerPrice}`);
      console.log(`   Discount: ৳${result.price - result.offerPrice} (${Math.round((1 - result.offerPrice/result.price) * 100)}% off)`);
      console.log(`   Offer Valid: ${result.offerValid}`);
      console.log(`   Seller ID: ${result.sellerId}`);
    });
    
    // Also test products that should NOT be in offers
    console.log('\n🚫 Testing products that should NOT be offers...');
    const nonOffersPipeline = [
      {
        $match: {
          isAvailable: true,
          status: 'active',
          $or: [
            { offerPrice: { $lte: 0 } },
            { $expr: { $gte: ['$offerPrice', '$price'] } },
            { offerPrice: null }
          ]
        }
      },
      {
        $lookup: {
          from: 'productcatalogs',
          localField: 'productId',
          foreignField: '_id',
          as: 'catalogData'
        }
      },
      {
        $unwind: {
          path: '$catalogData',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          price: 1,
          offerPrice: 1,
          name: '$catalogData.name'
        }
      },
      { $limit: 5 }
    ];
    
    const nonOffers = await SellerProduct.aggregate(nonOffersPipeline);
    console.log(`📊 Found ${nonOffers.length} products without valid offers (for comparison)`);
    
    nonOffers.forEach((result, index) => {
      console.log(`${index + 1}. ${result.name} - Price: ৳${result.price}, Offer: ৳${result.offerPrice || 'none'}`);
    });
    
    console.log('\n✅ Offer filtering test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

testOfferFiltering();
