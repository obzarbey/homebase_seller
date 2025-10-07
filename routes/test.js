const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();

// Test endpoint for order notifications
router.post('/order-notification', async (req, res) => {
  try {
    const { sellerId, orderData, fcmToken } = req.body;
    
    console.log('🧪 Testing order notification for seller:', sellerId);
    console.log('📱 FCM Token:', fcmToken);
    console.log('📦 Order Data:', orderData);
    
    if (!fcmToken) {
      return res.status(400).json({ error: 'FCM token is required' });
    }
    
    // Create test notification message
    const message = {
      notification: {
        title: '🛒 Test Order Received!',
        body: `Test order #${orderData.orderId} from ${orderData.buyerName} - ৳${orderData.amount}`,
      },
      data: {
        type: 'order',
        notificationType: 'order',
        orderId: orderData.orderId,
        sellerId: sellerId,
        amount: orderData.amount.toString(),
        buyerName: orderData.buyerName,
        isTest: 'true'
      },
      token: fcmToken,
      android: {
        priority: 'high',
        notification: {
          channelId: 'order_channel',
          sound: 'order_ringtone',
          priority: 'max',
        }
      }
    };
    
    // Send the notification
    const response = await admin.messaging().send(message);
    console.log('✅ Test notification sent successfully:', response);
    
    res.json({
      success: true,
      message: 'Test order notification sent',
      messageId: response,
      orderData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error sending test order notification:', error);
    res.status(500).json({ 
      error: 'Failed to send test notification',
      details: error.message 
    });
  }
});

// Test endpoint to check Firebase configuration
router.get('/firebase-status', (req, res) => {
  try {
    const app = admin.app();
    res.json({
      success: true,
      message: 'Firebase Admin SDK is initialized',
      projectId: app.options.projectId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Firebase Admin SDK not initialized',
      details: error.message
    });
  }
});

module.exports = router;