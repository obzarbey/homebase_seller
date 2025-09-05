const axios = require('axios');

const API_BASE_URL = 'https://homebase-seller.onrender.com/api';

// Test the stock update endpoint without auth
async function testStockUpdate() {
  try {
    console.log('Testing stock update endpoint without auth...');
    
    // Test with the seller product ID from the error message
    const testOrderItems = [
      {
        productId: '68baecd9cdf2b9271d55ba4f', // This is actually the seller product _id
        sellerId: '7rhtdlVyBeYr3VncNZJ333IrVm52',
        quantityToReduce: 1
      }
    ];
    
    const stockUpdateResponse = await axios.post(
      `${API_BASE_URL}/seller-products/update-stock-for-order`,
      { orderItems: testOrderItems },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Stock update response:', JSON.stringify(stockUpdateResponse.data, null, 2));
    
  } catch (error) {
    if (error.response) {
      console.error('Error response:', error.response.status, error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testStockUpdate();
