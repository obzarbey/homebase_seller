const SaleRecord = require('../models/SaleRecord');
const ExpenseRecord = require('../models/ExpenseRecord');
const SellerProduct = require('../models/SellerProduct');

// Get sales data for a seller with filtering
const getSalesData = async (req, res) => {
  try {
    const sellerId = req.user.uid;
    const { 
      startDate, 
      endDate, 
      category, 
      productId, 
      saleType,
      page = 1, 
      limit = 20 
    } = req.query;

    // Build query
    const query = { sellerId };
    
    // Date filtering
    if (startDate || endDate) {
      query.saleDate = {};
      if (startDate) query.saleDate.$gte = new Date(startDate);
      if (endDate) query.saleDate.$lte = new Date(endDate);
    }
    
    // Additional filters
    if (category) query.category = category;
    if (productId) query.productId = productId;
    if (saleType) query.saleType = saleType;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [sales, totalCount] = await Promise.all([
      SaleRecord.find(query)
        .sort({ saleDate: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('productId', 'name brand category imageUrl'),
      SaleRecord.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        sales,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching sales data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales data',
      error: error.message
    });
  }
};

// Get expenses data for a seller with filtering
const getExpensesData = async (req, res) => {
  try {
    const sellerId = req.user.uid;
    const { 
      startDate, 
      endDate, 
      category, 
      type,
      page = 1, 
      limit = 20 
    } = req.query;

    // Build query
    const query = { sellerId };
    
    // Date filtering
    if (startDate || endDate) {
      query.expenseDate = {};
      if (startDate) query.expenseDate.$gte = new Date(startDate);
      if (endDate) query.expenseDate.$lte = new Date(endDate);
    }
    
    // Additional filters
    if (category) query.category = category;
    if (type) query.type = type;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [expenses, totalCount] = await Promise.all([
      ExpenseRecord.find(query)
        .sort({ expenseDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ExpenseRecord.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        expenses,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching expenses data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expenses data',
      error: error.message
    });
  }
};

// Add manual sale record
const addManualSale = async (req, res) => {
  try {
    const sellerId = req.user.uid;
    const { 
      productId, 
      productName, 
      customName, 
      quantity, 
      sellingPrice, 
      costPrice, 
      category, 
      isWeightBased, 
      unit, 
      imageUrl, 
      customerName, 
      customerPhone, 
      notes, 
      saleDate 
    } = req.body;

    // Calculate totals and profit
    const totalAmount = quantity * sellingPrice;
    const totalCost = quantity * costPrice;
    const profit = totalAmount - totalCost;

    const saleRecord = new SaleRecord({
      sellerId,
      orderId: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId,
      productName,
      customName,
      quantity,
      sellingPrice,
      costPrice,
      totalAmount,
      totalCost,
      profit,
      saleType: 'manual',
      category,
      isWeightBased: isWeightBased || false,
      unit: unit || 'piece',
      imageUrl,
      customerName,
      customerPhone,
      notes,
      saleDate: saleDate ? new Date(saleDate) : new Date()
    });

    const savedSale = await saleRecord.save();
    await savedSale.populate('productId', 'name brand category imageUrl');

    res.status(201).json({
      success: true,
      message: 'Manual sale record added successfully',
      data: savedSale
    });
  } catch (error) {
    console.error('Error adding manual sale:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding manual sale',
      error: error.message
    });
  }
};

// Add expense record
const addExpense = async (req, res) => {
  try {
    const sellerId = req.user.uid;
    const { 
      title, 
      description, 
      amount, 
      category, 
      type, 
      reference, 
      attachmentUrl, 
      expenseDate 
    } = req.body;

    const expenseRecord = new ExpenseRecord({
      sellerId,
      title,
      description,
      amount,
      category,
      type,
      reference,
      attachmentUrl,
      expenseDate: expenseDate ? new Date(expenseDate) : new Date()
    });

    const savedExpense = await expenseRecord.save();

    res.status(201).json({
      success: true,
      message: 'Expense record added successfully',
      data: savedExpense
    });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding expense',
      error: error.message
    });
  }
};

// Update expense record
const updateExpense = async (req, res) => {
  try {
    const sellerId = req.user.uid;
    const { id } = req.params;

    const expense = await ExpenseRecord.findOne({ _id: id, sellerId });
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found'
      });
    }

    const allowedUpdates = {
      title: req.body.title,
      description: req.body.description,
      amount: req.body.amount,
      category: req.body.category,
      type: req.body.type,
      reference: req.body.reference,
      attachmentUrl: req.body.attachmentUrl,
      expenseDate: req.body.expenseDate ? new Date(req.body.expenseDate) : undefined
    };

    // Remove undefined values
    Object.keys(allowedUpdates).forEach(key => {
      if (allowedUpdates[key] === undefined) {
        delete allowedUpdates[key];
      }
    });

    const updatedExpense = await ExpenseRecord.findByIdAndUpdate(
      id,
      allowedUpdates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Expense record updated successfully',
      data: updatedExpense
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating expense',
      error: error.message
    });
  }
};

// Delete expense record
const deleteExpense = async (req, res) => {
  try {
    const sellerId = req.user.uid;
    const { id } = req.params;

    const expense = await ExpenseRecord.findOne({ _id: id, sellerId });
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense record not found'
      });
    }

    await ExpenseRecord.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Expense record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting expense',
      error: error.message
    });
  }
};

// Generate profit/loss report
const getProfitLossReport = async (req, res) => {
  try {
    const sellerId = req.user.uid;
    const { 
      startDate, 
      endDate, 
      period = 'monthly' 
    } = req.query;

    // Set default date range if not provided
    let start = startDate ? new Date(startDate) : new Date();
    let end = endDate ? new Date(endDate) : new Date();
    
    if (!startDate && !endDate) {
      switch (period) {
        case 'daily':
          start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'weekly':
          start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'yearly':
          start = new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
      }
    }

    // Get sales data
    const sales = await SaleRecord.find({
      sellerId,
      saleDate: { $gte: start, $lte: end }
    }).populate('productId', 'name brand category imageUrl');

    // Get expenses data
    const expenses = await ExpenseRecord.find({
      sellerId,
      expenseDate: { $gte: start, $lte: end }
    });

  // Calculate sales metrics
  const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalCosts = sales.reduce((sum, sale) => sum + sale.totalCost, 0);
    const grossProfit = totalSales - totalCosts;
    const totalOrdersCount = sales.filter(s => s.saleType === 'order').length;
    const totalItemsSold = sales.reduce((sum, sale) => sum + sale.quantity, 0);

    // Calculate expense metrics
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const expensesByCategory = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    // Calculate net profit
    const netProfit = grossProfit - totalExpenses;
    const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

    // Calculate top products
    const productMap = {};
    sales.forEach(sale => {
      // Use productId if available; otherwise key by product name for manual entries
      const key = sale.productId && sale.productId._id
        ? sale.productId._id.toString()
        : `manual:${(sale.productName || 'Unknown').toLowerCase()}:${(sale.customName || '')}`;

      if (productMap[key]) {
        productMap[key].totalQuantity += sale.quantity;
        productMap[key].totalRevenue += sale.totalAmount;
        productMap[key].totalCost += sale.totalCost;
        productMap[key].totalProfit += sale.profit;
        productMap[key].salesCount += 1;
      } else {
        productMap[key] = {
          productId: sale.productId && sale.productId._id ? sale.productId._id : null,
          productName: sale.productName,
          customName: sale.customName,
          category: sale.category,
          imageUrl: sale.imageUrl || (sale.productId && sale.productId.imageUrl) || null,
          totalQuantity: sale.quantity,
          totalRevenue: sale.totalAmount,
          totalCost: sale.totalCost,
          totalProfit: sale.profit,
          salesCount: 1
        };
      }
    });

    const topProducts = Object.values(productMap)
      .map(product => ({
        ...product,
        profitMargin: product.totalRevenue > 0 ? (product.totalProfit / product.totalRevenue) * 100 : 0
      }))
      .sort((a, b) => b.totalProfit - a.totalProfit)
      .slice(0, 10);

    // Calculate category performance
    const categoryMap = {};
    sales.forEach(sale => {
      const category = sale.category;
      if (categoryMap[category]) {
        categoryMap[category].totalQuantity += sale.quantity;
        categoryMap[category].totalRevenue += sale.totalAmount;
        categoryMap[category].totalCost += sale.totalCost;
        categoryMap[category].totalProfit += sale.profit;
        categoryMap[category].productsCount += 1;
      } else {
        categoryMap[category] = {
          category,
          totalQuantity: sale.quantity,
          totalRevenue: sale.totalAmount,
          totalCost: sale.totalCost,
          totalProfit: sale.profit,
          productsCount: 1
        };
      }
    });

    const categoryPerformance = Object.values(categoryMap)
      .map(category => ({
        ...category,
        profitMargin: category.totalRevenue > 0 ? (category.totalProfit / category.totalRevenue) * 100 : 0
      }))
      .sort((a, b) => b.totalProfit - a.totalProfit);

    // Additional metrics
    const averageOrderValue = totalOrdersCount > 0 ? totalSales / totalOrdersCount : 0;
    const daysInPeriod = Math.ceil((end - start) / (24 * 60 * 60 * 1000)) + 1;
    const dailyAverageProfit = daysInPeriod > 0 ? netProfit / daysInPeriod : 0;

    const report = {
      sellerId,
      startDate: start,
      endDate: end,
      period,
      
      // Sales Data
      totalSales,
      totalCosts,
      grossProfit,
      totalOrdersCount,
      totalItemsSold,
      
      // Expense Data
      totalExpenses,
      expensesByCategory,
      
      // Net Profit/Loss
      netProfit,
      profitMargin,
      
      // Top Products
      topProducts,
      categoryPerformance,
      
      // Additional Metrics
      averageOrderValue,
      dailyAverageProfit,
      daysInPeriod
    };

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error generating profit/loss report:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating profit/loss report',
      error: error.message
    });
  }
};

// Get seller products with profit calculations
const getProductsWithProfitability = async (req, res) => {
  try {
    const sellerId = req.user.uid;
    
    const products = await SellerProduct.find({ sellerId })
      .populate('productId', 'name brand category imageUrl unit')
      .sort({ createdAt: -1 });

    const productsWithProfitability = products.map(product => ({
      ...product.toJSON(),
      profitPerUnit: product.price - product.costPrice,
      profitMarginPercentage: product.price > 0 ? ((product.price - product.costPrice) / product.price) * 100 : 0,
      effectivePrice: product.offerPrice > 0 ? product.offerPrice : product.price,
      profitStatus: product.price - product.costPrice > 0 ? 'Profitable' : 
                   product.price - product.costPrice === 0 ? 'Break-even' : 'Loss'
    }));

    res.json({
      success: true,
      data: productsWithProfitability
    });
  } catch (error) {
    console.error('Error fetching products with profitability:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products with profitability',
      error: error.message
    });
  }
};

// Create sales records from completed orders
const createSalesFromOrder = async (req, res) => {
  try {
    const sellerId = req.user.uid;
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'orderId is required'
      });
    }

    // Fetch the order from Firestore using Firebase Admin SDK
    const admin = require('firebase-admin');
    const firestore = admin.firestore();
    
    const orderRef = await firestore.collection('orders').doc(orderId).get();
    
    if (!orderRef.exists) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const orderData = orderRef.data();

    // Verify this order belongs to the current seller
    if (orderData.sellerId !== sellerId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: This order does not belong to your shop'
      });
    }

    // Check if order is already converted to sales records
    const existingSales = await SaleRecord.find({ orderId });
    if (existingSales.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Sales records already created for this order'
      });
    }

    // Get customer info from order or users collection
    let customerName = orderData.buyerName || 'Unknown';
    let customerPhone = orderData.buyerPhone || null;
    
    if (!customerName && orderData.userId) {
      try {
        const userRef = await firestore.collection('users').doc(orderData.userId).get();
        if (userRef.exists) {
          const userData = userRef.data();
          customerName = userData.name || 'Unknown';
          customerPhone = userData.phone || null;
        }
      } catch (err) {
        console.log('Could not fetch buyer info:', err.message);
      }
    }

    // Create sales records for each product in the order
    const products = orderData.products || [];
    const createdSales = [];

    for (const product of products) {
      // Get product details from MongoDB
      let productData = null;
      try {
        if (product.productId) {
          const ProductCatalog = require('../models/Product');
          productData = await ProductCatalog.findById(product.productId).select('name brand category imageUrl');
        }
      } catch (err) {
        console.log('Could not fetch product details:', err.message);
      }

      const totalAmount = (product.quantity || 0) * (product.price || 0);
      // Estimate cost price from current SellerProduct if available
      let costPrice = product.price || 0; // Default to selling price
      try {
        const sellerProd = await SellerProduct.findOne({
          sellerId,
          productId: product.productId
        });
        if (sellerProd) {
          costPrice = sellerProd.costPrice || product.price;
        }
      } catch (err) {
        console.log('Could not fetch cost price:', err.message);
      }

      const totalCost = (product.quantity || 0) * costPrice;
      const profit = totalAmount - totalCost;

      const saleRecord = new SaleRecord({
        sellerId,
        orderId,
        productId: product.productId,
        productName: product.name || 'Unknown Product',
        customName: product.customName || null,
        quantity: product.quantity || 0,
        sellingPrice: product.price || 0,
        costPrice,
        totalAmount,
        totalCost,
        profit,
        saleType: 'order',
        category: productData?.category || product.category || 'Uncategorized',
        isWeightBased: product.isWeightBased || false,
        unit: product.unit || 'piece',
        imageUrl: product.imageUrl || productData?.imageUrl || null,
        customerName,
        customerPhone,
        saleDate: orderData.date ? new Date(orderData.date.toDate?.() || orderData.date) : new Date()
      });

      const savedSale = await saleRecord.save();
      createdSales.push(savedSale);
    }

    res.status(201).json({
      success: true,
      message: `Sales records created successfully for ${createdSales.length} product(s)`,
      data: {
        orderId,
        salesCreated: createdSales.length,
        sales: createdSales
      }
    });
  } catch (error) {
    console.error('Error creating sales from order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating sales records from order',
      error: error.message
    });
  }
};

// Auto-sync: Create sales records from all delivered orders
const syncDeliveredOrdersToSales = async (req, res) => {
  try {
    const sellerId = req.user.uid;
    const admin = require('firebase-admin');
    const firestore = admin.firestore();

    // Get all delivered orders for this seller that don't have sales records yet
    const ordersRef = await firestore.collection('orders')
      .where('sellerId', '==', sellerId)
      .where('deliveryStatus', '==', 6) // 6 = delivered (from DeliveryStatus enum)
      .get();

    let syncedCount = 0;
    const results = [];

    for (const orderDoc of ordersRef.docs) {
      const orderId = orderDoc.id;
      const orderData = orderDoc.data();

      // Check if sales records already exist
      const existingSales = await SaleRecord.find({ orderId });
      if (existingSales.length > 0) {
        results.push({
          orderId,
          status: 'skipped',
          reason: 'Sales records already exist'
        });
        continue;
      }

      try {
        // Create sales records for this order
        const products = orderData.products || [];
        let customerName = orderData.buyerName || 'Unknown';
        let customerPhone = orderData.buyerPhone || null;

        if (!customerName && orderData.userId) {
          try {
            const userRef = await firestore.collection('users').doc(orderData.userId).get();
            if (userRef.exists) {
              const userData = userRef.data();
              customerName = userData.name || 'Unknown';
              customerPhone = userData.phone || null;
            }
          } catch (err) {
            console.log('Could not fetch buyer info:', err.message);
          }
        }

        for (const product of products) {
          let productData = null;
          let costPrice = product.price || 0;

          try {
            const ProductCatalog = require('../models/Product');
            productData = await ProductCatalog.findById(product.productId).select('name brand category imageUrl');
            
            const sellerProd = await SellerProduct.findOne({
              sellerId,
              productId: product.productId
            });
            if (sellerProd) {
              costPrice = sellerProd.costPrice || product.price;
            }
          } catch (err) {
            console.log('Could not fetch product details:', err.message);
          }

          const totalAmount = (product.quantity || 0) * (product.price || 0);
          const totalCost = (product.quantity || 0) * costPrice;
          const profit = totalAmount - totalCost;

          const saleRecord = new SaleRecord({
            sellerId,
            orderId,
            productId: product.productId,
            productName: product.name || 'Unknown Product',
            customName: product.customName || null,
            quantity: product.quantity || 0,
            sellingPrice: product.price || 0,
            costPrice,
            totalAmount,
            totalCost,
            profit,
            saleType: 'order',
            category: productData?.category || product.category || 'Uncategorized',
            isWeightBased: product.isWeightBased || false,
            unit: product.unit || 'piece',
            imageUrl: product.imageUrl || productData?.imageUrl || null,
            customerName,
            customerPhone,
            saleDate: orderData.date ? new Date(orderData.date.toDate?.() || orderData.date) : new Date()
          });

          await saleRecord.save();
        }

        syncedCount++;
        results.push({
          orderId,
          status: 'synced',
          productsCount: products.length
        });
      } catch (err) {
        console.error('Error syncing order:', orderId, err);
        results.push({
          orderId,
          status: 'failed',
          error: err.message
        });
      }
    }

    res.json({
      success: true,
      message: `Synced ${syncedCount} delivered orders to sales records`,
      data: {
        totalProcessed: ordersRef.size,
        synced: syncedCount,
        results
      }
    });
  } catch (error) {
    console.error('Error syncing orders to sales:', error);
    res.status(500).json({
      success: false,
      message: 'Error syncing orders to sales',
      error: error.message
    });
  }
};

module.exports = {
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
};