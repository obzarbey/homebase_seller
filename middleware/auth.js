const { initializeFirebase } = require('../config/firebase');

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Auth Error: No token provided or invalid format');
      console.log('Authorization header:', authHeader);
      return res.status(401).json({
        success: false,
        message: 'No token provided or invalid format'
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token || token.trim() === '' || token === 'null' || token === 'undefined') {
      console.log('❌ Auth Error: Empty or invalid token');
      console.log('Token received:', token);
      return res.status(401).json({
        success: false,
        message: 'Empty or invalid token'
      });
    }
    
    const admin = initializeFirebase();
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Add user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    };
    
    console.log('✅ Token verified for user:', decodedToken.uid);
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

module.exports = { verifyFirebaseToken };
