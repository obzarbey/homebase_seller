# 🚀 Quick Start: Production Deployment with Render

## ⚡ 5-Minute Setup

### 1. Prerequisites
- [ ] GitHub account with your code
- [ ] MongoDB Atlas account (free tier OK)
- [ ] Render account (free tier available)
- [ ] Firebase project (existing: homebase-25)

### 2. MongoDB Atlas Setup (2 minutes)
```
1. Go to cloud.mongodb.com
2. Create new cluster or use existing
3. Create database user: oshan_prod_user
4. Network Access: Add 0.0.0.0/0
5. Copy connection string
```

### 3. Firebase Admin SDK (1 minute)
```
1. Firebase Console → homebase-25 → Settings → Service Accounts
2. Generate new private key
3. Download JSON file
4. Keep it handy for environment variables
```

### 4. Render Deployment (2 minutes)
```
1. Go to render.com → New Web Service
2. Connect GitHub → Select your repo
3. Root Directory: backend
4. Build Command: npm install
5. Start Command: npm start
```

### 5. Environment Variables
Copy these to Render dashboard:

**Essential:**
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://oshan_prod_user:PASSWORD@cluster.mongodb.net/oshan_products_prod?retryWrites=true&w=majority
FIREBASE_PROJECT_ID=homebase-25
FIREBASE_PRIVATE_KEY_ID=[from JSON]
FIREBASE_PRIVATE_KEY=[from JSON - keep quotes and \n]
FIREBASE_CLIENT_EMAIL=[from JSON]
FIREBASE_CLIENT_ID=[from JSON]
JWT_SECRET=[generate random 32+ chars]
```

**Security:**
```
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/[your-service-account-email]
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50
```

## 🧪 Test Your Deployment

### Health Check
```bash
curl https://your-app-name.onrender.com/health
```

### API Test
```bash
curl "https://your-app-name.onrender.com/api/products/search?address=test"
```

## 📱 Update Flutter App

In `lib/config/api_config.dart`, update:
```dart
static const String productionBaseUrl = 'https://your-app-name.onrender.com/api';
```

## ✅ Production Checklist

- [ ] MongoDB Atlas cluster running
- [ ] Render service deployed successfully  
- [ ] Health endpoint responding (200 OK)
- [ ] Environment variables set correctly
- [ ] Flutter app updated with production URL
- [ ] End-to-end test successful
- [ ] CORS configured for your Flutter app domains

## 💰 Cost Summary

**Free Tier Setup:**
- MongoDB Atlas: Free (M0 cluster)
- Render: Free (750 hours/month, spins down after 15 min idle)
- Firebase: Free (Spark plan)

**Total: $0/month** for development and testing!

**Production Ready:**
- MongoDB Atlas: $57/month (M10 dedicated)
- Render: $7/month (Starter plan, no sleep)
- Firebase: Free/Pay-per-use

## 🔧 Common Issues & Fixes

**Build Fails:**
- Check Node.js version in package.json engines
- Verify all dependencies listed

**Can't Connect to MongoDB:**
- Check connection string format
- Ensure IP whitelist includes 0.0.0.0/0

**Firebase Auth Errors:**
- Verify private key format (include \n characters)
- Check all Firebase env vars are set

**CORS Errors:**
- Add your Flutter app domain to CORS_ORIGINS
- Test with curl first

## 📞 Need Help?

1. Check Render logs in dashboard
2. Test API endpoints with curl
3. Verify environment variables
4. Review PRODUCTION_DEPLOYMENT.md for details

## 🎯 Your Production URLs

After deployment:
- **API Base:** `https://your-app-name.onrender.com`
- **Health Check:** `https://your-app-name.onrender.com/health`
- **Products API:** `https://your-app-name.onrender.com/api/products`

🎉 **You're live in production with MongoDB + Render!**
