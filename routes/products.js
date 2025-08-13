const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const { validateProduct, validateProductUpdate } = require('../middleware/validation');
const {
  addProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  getAllProducts,
  getProductById,
  searchProductsByAddress,
  
  getProductsBySellerIdPublic
} = require('../controllers/productController');

// Public routes (no authentication required)
router.get('/all', getAllProducts); // New public endpoint for all products
router.get('/search', searchProductsByAddress);
router.get('/:id', getProductById);
router.get('/seller/:sellerId', getProductsBySellerIdPublic); // Public: Get all products for a specific seller

// Protected routes (require Firebase authentication)
router.use(verifyFirebaseToken);

// Seller product management routes
router.post('/', validateProduct, addProduct);
router.put('/:id', validateProductUpdate, updateProduct);
router.delete('/:id', deleteProduct);
router.get('/', getSellerProducts);

module.exports = router;
