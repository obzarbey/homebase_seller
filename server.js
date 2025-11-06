require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const { initializeFirebase } = require('./config/firebase');

const app = express();

// Trust only the first proxy (Render/Heroku style) to avoid permissive trust proxy warnings
// This ensures Express correctly uses X-Forwarded-* headers without allowing trivial spoofing
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// Initialize Firebase
initializeFirebase();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

app.use(limiter);

// CORS configuration
const corsOrigins = process.env.NODE_ENV === 'production' 
  ? (process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [
      'https://your-flutter-app.web.app',
      'https://your-flutter-app.firebaseapp.com'
    ])
  : true; // Allow all origins in development

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/products', require('./routes/products')); // Legacy products route
app.use('/api/catalog', require('./routes/catalog')); // New centralized catalog
app.use('/api/seller-products', require('./routes/sellerProducts')); // New seller products
app.use('/api/shop-management', require('./routes/shopManagement')); // Shop management and analytics
app.use('/api/test', require('./routes/test')); // Test routes for notifications

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const connectionState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    const healthStatus = {
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      server: {
        port: process.env.PORT || 5000,
        externalUrl: process.env.RENDER_EXTERNAL_URL || 'localhost'
      },
      database: {
        status: states[connectionState],
        connected: connectionState === 1,
        host: mongoose.connection.host || 'not connected'
      }
    };

    // Return 500 if database is not connected
    if (connectionState !== 1) {
      healthStatus.success = false;
      healthStatus.message = 'Database not connected';
      return res.status(500).json(healthStatus);
    }

    res.status(200).json(healthStatus);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Oshan Product API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      products: '/api/products',
      catalog: '/api/catalog',
      sellerProducts: '/api/seller-products',
      test: '/api/test'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${NODE_ENV} mode`);
  console.log(`📱 API Base URL: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`🌐 External URL: ${process.env.RENDER_EXTERNAL_URL || 'Not available'}`);
});

module.exports = app;
