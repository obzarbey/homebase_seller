# Oshan Product API Backend

A Node.js Express server for managing products with MongoDB Atlas, featuring Firebase Authentication integration.

## Features

- 🔐 Firebase Authentication integration
- 🗄️ MongoDB Atlas for product storage
- 🛡️ Security middleware (Helmet, Rate limiting)
- ✅ Input validation with Joi
- 📊 Pagination support
- 🔍 Product search by address
- 👤 Seller-specific product management

## API Endpoints

### Public Endpoints
- `GET /api/products/search?address=location` - Search products by address
- `GET /api/products/:id` - Get product by ID

### Protected Endpoints (Require Firebase Auth Token)
- `POST /api/products` - Add new product
- `PUT /api/products/:id` - Update product (owner only)
- `DELETE /api/products/:id` - Delete product (owner only)
- `GET /api/products` - Get seller's products

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
1. Copy `.env.example` to `.env`
2. Update the following variables:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/oshan_products

# Firebase Admin SDK (Get from Firebase Console > Project Settings > Service Accounts)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
```

### 3. Get Firebase Admin SDK Credentials
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (homebase-25)
3. Go to Project Settings > Service Accounts
4. Click "Generate new private key"
5. Download the JSON file and extract the values for your `.env` file

### 4. Setup MongoDB Atlas
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create a database user
4. Get connection string and update `MONGODB_URI`

### 5. Run the Server
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000`

## Request/Response Examples

### Add Product
```bash
POST /api/products
Authorization: Bearer YOUR_FIREBASE_TOKEN
Content-Type: application/json

{
  "name": "Fresh Apples",
  "description": "Red delicious apples",
  "price": 150,
  "offerPrice": 120,
  "imageUrl": "https://firebase-storage-url",
  "address": "Colombo, Sri Lanka",
  "category": "Fruits",
  "isAvailable": true
}
```

### Update Product
```bash
PUT /api/products/PRODUCT_ID
Authorization: Bearer YOUR_FIREBASE_TOKEN
Content-Type: application/json

{
  "price": 140,
  "isAvailable": false
}
```

### Get Seller Products
```bash
GET /api/products?page=1&limit=10&category=Fruits
Authorization: Bearer YOUR_FIREBASE_TOKEN
```

### Search Products by Address
```bash
GET /api/products/search?address=Colombo&page=1&limit=10
```

## Security Features

- Firebase Authentication token verification
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- Helmet.js for security headers
- CORS configuration
- Owner-only product modifications

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "details": ["Validation errors if any"]
}
```

## Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Update CORS origins in `server.js`
3. Use proper MongoDB Atlas credentials
4. Consider using PM2 for process management
5. Setup proper logging and monitoring
