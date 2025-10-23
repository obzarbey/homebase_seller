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
  getProductsWithProfitability
} = require('../controllers/shopManagementController');

// All routes require Firebase authentication
router.use(verifyFirebaseToken);

// Sales management routes
router.get('/sales', getSalesData);
router.post('/sales/manual', validateManualSale, addManualSale);

// Expenses management routes
router.get('/expenses', getExpensesData);
router.post('/expenses', validateExpense, addExpense);
router.put('/expenses/:id', validateExpenseUpdate, updateExpense);
router.delete('/expenses/:id', deleteExpense);

// Reports and analytics routes
router.get('/report/profit-loss', getProfitLossReport);
router.get('/products/profitability', getProductsWithProfitability);

module.exports = router;