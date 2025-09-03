const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const { validateCatalogProduct, validateCatalogApproval } = require('../middleware/catalogValidation');
const {
  searchCatalog,
  getCatalogProductById,
  createCatalogProduct,
  getCategories,
  getPendingCatalogProducts,
  approveCatalogProduct,
  rejectCatalogProduct
} = require('../controllers/catalogController');

// Public routes (no authentication required)
router.get('/search', searchCatalog);
router.get('/categories', getCategories);
router.get('/:id', getCatalogProductById);

// Protected routes (require Firebase authentication)
router.use(verifyFirebaseToken);

// Seller routes
router.post('/', validateCatalogProduct, createCatalogProduct);

// Admin routes (TODO: Add admin role verification middleware)
router.get('/admin/pending', getPendingCatalogProducts);
router.patch('/admin/:id/approve', approveCatalogProduct);
router.patch('/admin/:id/reject', validateCatalogApproval, rejectCatalogProduct);

module.exports = router;
