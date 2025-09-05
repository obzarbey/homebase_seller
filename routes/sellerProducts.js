const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const { validateSellerProduct, validateSellerProductUpdate } = require('../middleware/catalogValidation');
const {
  addSellerProduct,
  updateSellerProduct,
  deleteSellerProduct,
  getSellerProducts,
  getAllSellerProducts,
  getSellerProductById,
  searchSellerProductsByAddress,
  checkSellerProductExists,
  getProductsBySeller,
  updateAllSellerProductsAddress,
  updateStockForOrder
} = require('../controllers/sellerProductController');

// Public routes (no authentication required)
router.get('/all', getAllSellerProducts);
router.get('/search', searchSellerProductsByAddress);
router.get('/seller/:sellerId', getProductsBySeller);
router.get('/:id', getSellerProductById);

// Stock update for order processing (temporarily public for testing)
router.post('/update-stock-for-order', updateStockForOrder);

// Protected routes (require Firebase authentication)
router.use(verifyFirebaseToken);

// Check if seller already has a catalog product
router.get('/check/:productId', checkSellerProductExists);

// Seller product management routes
router.post('/', validateSellerProduct, addSellerProduct);
router.put('/:id', validateSellerProductUpdate, updateSellerProduct);
router.put('/update-address/all', updateAllSellerProductsAddress);
router.delete('/:id', deleteSellerProduct);
router.get('/', getSellerProducts);

module.exports = router;
