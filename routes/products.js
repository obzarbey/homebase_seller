const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const { validateProduct, validateProductUpdate } = require('../middleware/validation');
const {
  addProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  getProductById,
  searchProductsByAddress
} = require('../controllers/productController');


// Public routes (no authentication required)
router.get('/search', searchProductsByAddress);
router.get('/:id', getProductById);
router.get('/', require('../controllers/productController').getAllProducts); // Public: all products

// Protected routes (require Firebase authentication)
router.use(verifyFirebaseToken);

// Seller product management routes
router.post('/', validateProduct, addProduct);
router.put('/:id', validateProductUpdate, updateProduct);
router.delete('/:id', deleteProduct);
router.get('/seller', getSellerProducts); // Authenticated: seller's own products

module.exports = router;
