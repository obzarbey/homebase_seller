# 🔧 MongoDB Cluster Migration - Products Not Showing

## Problem
After changing MONGODB_URI from Cluster 0 to Cluster 1, products are not displaying in the app.

## Root Cause Analysis

### ✅ What We Found:
- **Cluster 0 (Old)**: No longer accessible
- **Cluster 1 (New)**: Has 3 products in database ✅
- **Products in Cluster 1**:
  - Seller ID: `6I0wfBYzoAX61tEtoM4VGkQ3hDv1`
  - Products: Black Shirt, and 2 others
  - Status: Available and active

### ❌ Why Products Might Not Show:

1. **Seller ID Mismatch** (Most Likely)
   - The 3 products belong to seller `6I0wfBYzoAX61tEtoM4VGkQ3hDv1`
   - Your current logged-in seller might have a different Firebase UID
   - Products are filtered by seller ID in the app

2. **App Cache**
   - Flutter app caches products in memory/disk
   - Old product list from Cluster 0 might still be cached

3. **Profile Not Verified**
   - Seller profile must be complete and verified to see products
   - Unverified sellers can't browse their products

4. **Server Not Restarted**
   - Backend server still connected to old cluster
   - Need to restart after changing MONGODB_URI

## 🛠️ Step-by-Step Fix

### Step 1: Restart Backend Server
```bash
cd backend
npm start
# or if using PM2: pm2 restart oshan-backend
```

### Step 2: Clear Flutter App Cache (On Test Device)
```bash
# Android
adb shell pm clear com.oshan.oshan  # or your app package name

# iOS
Settings > General > iPhone Storage > [App Name] > Offload App
Then reinstall the app
```

### Step 3: Verify Seller Profile
1. Login to the seller app with your account
2. Go to Profile > Complete Profile
3. Ensure ALL fields are filled and verified
4. Screenshot the seller ID (Firebase UID) - it should match `6I0wfBYzoAX61tEtoM4VGkQ3hDv1` OR use a different seller account

### Step 4: Test API Directly
```bash
# Test if API can fetch products
curl "https://your-backend-url/api/products/all?page=1&limit=20"

# Should return:
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "...",
        "name": "Black Shirt",
        "sellerId": "6I0wfBYzoAX61tEtoM4VGkQ3hDv1",
        ...
      }
    ]
  }
}
```

### Step 5: Test Adding New Product
1. Login as seller with UID: `6I0wfBYzoAX61tEtoM4VGkQ3hDv1`
2. Go to Add Product
3. Add a test product
4. Check if it appears immediately
5. If yes, data flow is working ✅

## 📋 Troubleshooting Checklist

- [ ] MongoDB URI correctly points to Cluster 1
- [ ] Backend server restarted (Check: `node server.js` or `npm start`)
- [ ] App cache cleared on device
- [ ] Seller profile is complete and verified
- [ ] Seller UID matches one of the product sellers
- [ ] Network connectivity is working (can you reach the API?)
- [ ] No filtering is hiding the products (check filters/category)

## 🚀 Quick Verification Script

Run this to diagnose the issue:
```bash
cd backend
node diagnostics-products.js
```

This will show:
- Total products in Cluster 1
- Seller breakdown
- Which APIs are responding

## 💡 Data Migration (If Needed)

If you had products in Cluster 0 that you need in Cluster 1:

### Option A: Migrate Data
```bash
# Export from old cluster (if still accessible)
mongoexport --uri "mongodb+srv://user:pass@cluster0..." --collection products --out products.json

# Import to new cluster
mongoimport --uri "mongodb+srv://user:pass@cluster1..." --collection products --file products.json
```

### Option B: Re-add Products Manually
Since Cluster 1 already has 3 products, you only need to add missing ones:
1. Login as the same seller
2. Go to Add Product
3. Fill in details and upload images
4. Products will be saved to Cluster 1

## ⚠️ Common Issues

### Issue: "Connection failed"
→ Check MONGODB_URI syntax in .env
→ Verify IP whitelist in MongoDB Atlas (allow 0.0.0.0/0 for Render)

### Issue: "Products empty but API returns data"
→ Clear app cache
→ Check if filters are hiding products
→ Verify seller UID in localStorage

### Issue: "Can write but can't read"
→ Check read permissions on collection
→ Verify index creation: `db.products.createIndex({ "sellerId": 1 })`

## 📞 Need More Help?

1. Run diagnostics: `node diagnostics-products.js`
2. Check backend logs: Look for "MongoDB Connected" message
3. Verify cluster URL: Log into MongoDB Atlas and confirm URIs match
4. Test with different seller accounts to isolate the issue

---

**Note**: After fixing, products should appear immediately on refresh. If not, try:
- Hard refresh in browser (Ctrl+Shift+R on desktop)
- Reinstall app on mobile
- Clear all local storage
