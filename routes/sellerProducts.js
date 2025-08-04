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
  searchSellerProductsByAddress
} = require('../controllers/sellerProductController');

// Public routes (no authentication required)
router.get('/all', getAllSellerProducts);
router.get('/search', searchSellerProductsByAddress);
router.get('/:id', getSellerProductById);

// Protected routes (require Firebase authentication)
router.use(verifyFirebaseToken);

// Seller product management routes
router.post('/', validateSellerProduct, addSellerProduct);
router.put('/:id', validateSellerProductUpdate, updateSellerProduct);
router.delete('/:id', deleteSellerProduct);
router.get('/', getSellerProducts);

module.exports = router;
