# 🚀 Production Deployment Guide - Render

This guide will help you deploy your Oshan Product API to production using Render and MongoDB Atlas.

## 📋 Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **MongoDB Atlas Account** - For production database
3. **Render Account** - Sign up at [render.com](https://render.com)
4. **Firebase Project** - Your existing Firebase project (buynor-25)

## 🗄️ Step 1: MongoDB Atlas Production Setup

### 1.1 Create Production Database
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a **new cluster** for production (or use existing)
3. Database name: `oshan_products_prod`

### 1.2 Create Production User
```
Username: oshan_prod_user
Password: [Generate strong password - save this!]
Role: Read and write to any database
```

### 1.3 Network Access
```
IP Access List: 0.0.0.0/0 (Allow access from anywhere)
Note: Render uses dynamic IPs, so we need to allow all IPs
```

### 1.4 Get Connection String
```
mongodb+srv://oshan_prod_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/oshan_products_prod?retryWrites=true&w=majority
```

## 🔥 Step 2: Firebase Production Setup

### 2.1 Create Production Service Account
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **buynor-25**
3. **Project Settings** → **Service Accounts**
4. **Generate new private key** (for production)
5. Download the JSON file

### 2.2 Extract Credentials
From the downloaded JSON file, extract:
```json
{
  "project_id": "buynor-25",
  "private_key_id": "production_key_id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxx@buynor-25.iam.gserviceaccount.com",
  "client_id": "123456789..."
}
```

## 🌐 Step 3: Render Deployment

### 3.1 Connect GitHub Repository
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Select your repository containing the backend code
5. **Root Directory**: `backend` (if your backend is in a subdirectory)

### 3.2 Configure Service
```
Name: oshan-product-api
Environment: Node
Region: Choose closest to your users
Branch: main (or your production branch)
```

### 3.3 Build & Deploy Settings
```
Build Command: npm install
Start Command: npm start
```

### 3.4 Environment Variables
In Render Dashboard, add these environment variables:

#### Required Variables:
```
NODE_ENV = production
PORT = 10000
MONGODB_URI = mongodb+srv://oshan_prod_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/oshan_products_prod?retryWrites=true&w=majority
```

#### Firebase Admin SDK:
```
FIREBASE_PROJECT_ID = buynor-25
FIREBASE_PRIVATE_KEY_ID = [from JSON file]
FIREBASE_PRIVATE_KEY = [from JSON file - include the quotes and \n]
FIREBASE_CLIENT_EMAIL = [from JSON file]
FIREBASE_CLIENT_ID = [from JSON file]
FIREBASE_AUTH_URI = https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI = https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL = https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL = https://www.googleapis.com/robot/v1/metadata/x509/[your-service-account-email]
```

#### Security & Rate Limiting:
```
JWT_SECRET = [generate 32+ character random string]
RATE_LIMIT_WINDOW_MS = 900000
RATE_LIMIT_MAX_REQUESTS = 50
```

#### CORS (Optional - for specific Flutter app domains):
```
CORS_ORIGINS = https://your-flutter-app.web.app,https://your-flutter-app.firebaseapp.com
```

### 3.5 Deploy
1. Click **"Create Web Service"**
2. Render will automatically deploy your app
3. Your API will be available at: `https://your-app-name.onrender.com`

## 📱 Step 4: Update Flutter App

### 4.1 Update API Configuration
In `lib/config/api_config.dart`:
```dart
class ApiConfig {
  // Production API URL
  static const String baseUrl = 'https://your-app-name.onrender.com/api';
  
  static const String productsEndpoint = '$baseUrl/products';
  static const Duration requestTimeout = Duration(seconds: 30);
}
```

### 4.2 Test Production API
```dart
// Test the production endpoint
final response = await http.get(
  Uri.parse('https://your-app-name.onrender.com/health')
);
```

## 🧪 Step 5: Testing Production Deployment

### 5.1 Health Check
```bash
curl https://your-app-name.onrender.com/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-08-01T12:00:00.000Z",
  "environment": "production"
}
```

### 5.2 API Endpoints Test
```bash
# Test public search (no auth required)
curl "https://your-app-name.onrender.com/api/products/search?address=test"

# Test protected endpoint (should return 401 without token)
curl -X POST https://your-app-name.onrender.com/api/products
```

### 5.3 Flutter App Integration Test
1. Update API URL in Flutter app
2. Build and test the app
3. Verify product operations work with production API

## 🔄 Step 6: Data Migration (Optional)

If you have existing products in Firestore:

### 6.1 Run Migration from Local Machine
```bash
# Set production environment variables locally
export MONGODB_URI="your_production_mongodb_uri"
export FIREBASE_PROJECT_ID="buynor-25"
# ... other Firebase variables

# Run migration
npm run migrate
```

### 6.2 Or Deploy Migration Script to Render
Create a separate Render service for one-time migration:
1. Same GitHub repo
2. Start Command: `npm run migrate`
3. Same environment variables
4. Run once, then delete the service

## 🔒 Step 7: Security Considerations

### 7.1 Environment Variables
- ✅ All secrets stored in Render environment variables
- ✅ No sensitive data in code repository
- ✅ Production-specific JWT secret

### 7.2 Database Security
- ✅ MongoDB Atlas with authentication
- ✅ Network restrictions where possible
- ✅ Separate production database

### 7.3 API Security
- ✅ Firebase token verification
- ✅ Rate limiting enabled
- ✅ CORS restrictions
- ✅ Helmet security headers

## 📊 Step 8: Monitoring & Maintenance

### 8.1 Render Monitoring
- **Logs**: View in Render dashboard
- **Metrics**: CPU, memory usage
- **Health checks**: Automatic monitoring

### 8.2 Database Monitoring
- **MongoDB Atlas**: Built-in monitoring
- **Performance**: Query optimization
- **Backup**: Automatic backups enabled

### 8.3 Error Handling
- **Server errors**: Logged in Render
- **Database errors**: MongoDB Atlas logs
- **Firebase errors**: Firebase Console

## 🚀 Step 9: Deployment Automation

### 9.1 Auto-Deploy Setup
✅ Already configured! Render will auto-deploy when you push to your main branch.

### 9.2 Manual Deploy
If needed, trigger manual deploy in Render dashboard.

### 9.3 Environment-Specific Branches
Consider using:
- `main` branch → Production deployment
- `develop` branch → Staging deployment (optional)

## 💰 Cost Estimation

### Render (Free Tier Available)
- **Free**: 750 hours/month, 512MB RAM
- **Starter**: $7/month, 512MB RAM, no sleep
- **Standard**: $25/month, 2GB RAM, autoscaling

### MongoDB Atlas
- **Free**: M0 cluster (512MB storage)
- **Dedicated**: M10+ for production ($57+/month)

### Firebase
- **Spark Plan**: Free quota for auth and storage
- **Blaze Plan**: Pay-as-you-go for higher usage

## 🔧 Troubleshooting

### Common Issues:

**1. Render Build Fails**
- Check Node.js version in `package.json` engines
- Verify all dependencies are in `package.json`
- Check build logs in Render dashboard

**2. MongoDB Connection Issues**
- Verify connection string format
- Check IP whitelist (use 0.0.0.0/0 for Render)
- Ensure database user has correct permissions

**3. Firebase Auth Errors**
- Verify all Firebase environment variables
- Check private key format (include \n characters)
- Ensure service account has proper permissions

**4. CORS Errors**
- Update CORS_ORIGINS environment variable
- Add your Flutter app domains
- Check preflight OPTIONS requests

## 📞 Support & Next Steps

1. **Deploy to Render** using this guide
2. **Test thoroughly** with your Flutter app
3. **Monitor performance** and logs
4. **Scale up** Render plan as needed
5. **Set up monitoring** and alerts

Your production API will be ready at:
`https://your-app-name.onrender.com`

## 🎯 Production Checklist

- [ ] MongoDB Atlas production cluster created
- [ ] Firebase production service account configured
- [ ] Render web service deployed
- [ ] All environment variables set
- [ ] Health check endpoint responding
- [ ] Flutter app updated with production URL
- [ ] End-to-end testing completed
- [ ] Monitoring and logging configured
- [ ] Backup and recovery plan in place
- [ ] Security review completed

🎉 **Your production-ready MongoDB + Render deployment is complete!**
