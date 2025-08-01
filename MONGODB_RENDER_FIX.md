# 🔧 MongoDB Atlas Configuration for Render

## The Problem
Render uses dynamic IP addresses, so you can't whitelist specific IPs. You need to allow all IPs or use MongoDB's built-in security.

## ✅ Solution 1: Allow All IPs (Recommended for Render)

### Step 1: MongoDB Atlas Dashboard
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Select your cluster
3. Click **"Network Access"** in the left sidebar
4. Click **"Add IP Address"**
5. Click **"Allow Access from Anywhere"**
6. Or manually add: `0.0.0.0/0`
7. Click **"Confirm"**

### Step 2: Verify Connection String Format
Your `MONGODB_URI` should look like:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database_name?retryWrites=true&w=majority
```

### Step 3: Test Connection
```bash
# Test locally first
node -e "
const mongoose = require('mongoose');
mongoose.connect('YOUR_MONGODB_URI')
  .then(() => console.log('✅ Connected!'))
  .catch(err => console.error('❌ Error:', err.message));
"
```

## ✅ Solution 2: Use MongoDB Atlas with VPC Peering (Advanced)

If you have a paid Render plan, you can set up VPC peering for more security.

## 🔍 Debugging Steps

### 1. Check Environment Variables in Render
In your Render dashboard:
- Go to your service
- Click **"Environment"**
- Verify `MONGODB_URI` is set correctly
- Make sure there are no extra spaces or quotes

### 2. Test Connection String Format
```javascript
// Add this temporarily to your server.js for debugging
console.log('🔧 Debug Info:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI set:', !!process.env.MONGODB_URI);
console.log('MONGODB_URI length:', process.env.MONGODB_URI?.length);

// Don't log the full URI in production for security
if (process.env.NODE_ENV !== 'production') {
  console.log('MONGODB_URI:', process.env.MONGODB_URI);
}
```

### 3. MongoDB Atlas Checklist
- [ ] Cluster is running (not paused)
- [ ] Database user exists with correct password
- [ ] Database user has read/write permissions
- [ ] Network access allows 0.0.0.0/0
- [ ] Connection string format is correct
- [ ] Database name in connection string matches your intended database

### 4. Common Connection String Issues

**❌ Wrong:**
```
mongodb://username:password@cluster.mongodb.net/database
```

**✅ Correct:**
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**❌ Wrong (missing database name):**
```
mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

**✅ Correct (with database name):**
```
mongodb+srv://username:password@cluster.mongodb.net/oshan_products?retryWrites=true&w=majority
```

## 🛠️ Quick Fix Commands

### Reset MongoDB Atlas Network Access
```bash
# If you have MongoDB CLI installed
mongocli atlas clusters describe YOUR_CLUSTER_NAME
mongocli atlas accessLists create --type ipAddress --value "0.0.0.0/0"
```

### Test from Render Service
Add this temporary endpoint to your server.js:
```javascript
// Temporary debug endpoint - REMOVE after fixing
app.get('/debug-mongo', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const connectionState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    res.json({
      mongoState: states[connectionState],
      hasMongoUri: !!process.env.MONGODB_URI,
      nodeEnv: process.env.NODE_ENV,
      renderUrl: process.env.RENDER_EXTERNAL_URL
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

Then visit: `https://your-app.onrender.com/debug-mongo`

## 🔒 Security Best Practices

### For Production:
1. **Use Strong Passwords**: Generate random passwords for database users
2. **Principle of Least Privilege**: Create database users with only necessary permissions
3. **Monitor Access**: Use MongoDB Atlas monitoring to watch for unusual activity
4. **Rotate Credentials**: Regularly update database passwords

### Environment Variables Security:
```bash
# In Render dashboard, set these as environment variables:
MONGODB_URI=mongodb+srv://prod_user:STRONG_PASSWORD@cluster.mongodb.net/oshan_products_prod?retryWrites=true&w=majority
NODE_ENV=production
```

## 🆘 Emergency Fixes

### If Nothing Works:
1. **Create New Cluster**: Sometimes starting fresh helps
2. **Create New Database User**: With a simple password (no special characters)
3. **Use MongoDB Compass**: Test connection from your local machine first
4. **Contact Render Support**: They can help with network connectivity issues

### Render-Specific Environment Variables:
```bash
# These are automatically set by Render
RENDER_EXTERNAL_URL=https://your-app.onrender.com
RENDER_INTERNAL_HOSTNAME=your-app
RENDER_SERVICE_ID=srv-xxxxx
```

## 📞 Still Having Issues?

1. **Check Render Logs**: Look for detailed error messages
2. **MongoDB Atlas Logs**: Check the cluster metrics and logs
3. **Test Locally**: Ensure your connection string works locally first
4. **Simplified Connection**: Try without query parameters first

Example minimal connection string:
```
mongodb+srv://username:password@cluster.mongodb.net/database_name
```

## ✅ Success Indicators

You should see these messages in Render logs:
```
🔄 Connecting to MongoDB...
Environment: production
✅ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
📊 Database: oshan_products_prod
🚀 Server running on port 10000 in production mode
```

Once you see these messages, your MongoDB connection is working correctly!
