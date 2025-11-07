const express = require('express');
const router = express.Router();
const { verifyFirebaseToken } = require('../middleware/auth');
const { 
  validateManualSale, 
  validateExpense, 
  validateExpenseUpdate 
} = require('../middleware/catalogValidation');
const {
  getSalesData,
  getExpensesData,
  addManualSale,
  addExpense,
  updateExpense,
  deleteExpense,
  getProfitLossReport,
  getProductsWithProfitability,
  createSalesFromOrder,
  syncDeliveredOrdersToSales
} = require('../controllers/shopManagementController');

// Health check endpoint (no auth required)
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Shop Management API is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      sales: '/sales',
      expenses: '/expenses',
      reports: '/report/profit-loss',
      sync: '/sales/from-order',
      bulkSync: '/sales/sync-delivered-orders'
    }
  });
});

// All routes below require Firebase authentication
router.use(verifyFirebaseToken);

// Sales management routes
router.get('/sales', getSalesData);
router.post('/sales/manual', validateManualSale, addManualSale);

// Order to Sales sync routes
router.post('/sales/from-order', createSalesFromOrder);
router.post('/sales/sync-delivered-orders', syncDeliveredOrdersToSales);

// Expenses management routes
router.get('/expenses', getExpensesData);
router.post('/expenses', validateExpense, addExpense);
router.put('/expenses/:id', validateExpenseUpdate, updateExpense);
router.delete('/expenses/:id', deleteExpense);

// Reports and analytics routes
router.get('/report/profit-loss', getProfitLossReport);
router.get('/products/profitability', getProductsWithProfitability);

module.exports = router;