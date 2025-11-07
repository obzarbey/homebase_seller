const Joi = require('joi');

const validateCatalogProduct = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().trim().max(100).required(),
    brand: Joi.string().trim().max(50).allow('').default(''),
    category: Joi.string().trim().required(),
    description: Joi.string().trim().max(1000).allow('').default(''),
    unit: Joi.string().trim().max(20).allow('').default('piece'),
    imageUrl: Joi.string().uri().required()
  });

  const { error, value } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }

  req.body = value;
  next();
};

const validateSellerProduct = (req, res, next) => {
  const schema = Joi.object({
    productId: Joi.string().required(),
    price: Joi.number().min(0).required(),
    offerPrice: Joi.number().min(0).default(0),
    costPrice: Joi.number().min(0).required(),
    stock: Joi.number().min(0).required(),
    address: Joi.string().trim().required(),
    customNote: Joi.string().trim().max(500).allow('').default(''),
    customName: Joi.string().trim().max(100).allow(null).default(null),
    customDescription: Joi.string().trim().max(1000).allow(null).default(null),
    customCategory: Joi.string().trim().max(50).allow(null).default(null),
    customImageUrl: Joi.string().uri().allow(null).default(null),
    customImagePath: Joi.string().allow('').default(null),
    isAvailable: Joi.boolean().default(true),
    isPreOwned: Joi.boolean().default(false),
    isWeightBased: Joi.boolean().default(false),
    status: Joi.string().valid('active', 'inactive', 'out_of_stock').default('active')
  });

  const { error, value } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }

  req.body = value;
  next();
};

const validateSellerProductUpdate = (req, res, next) => {
  const schema = Joi.object({
    price: Joi.number().min(0),
    offerPrice: Joi.number().min(0),
    costPrice: Joi.number().min(0),
    stock: Joi.number().min(0),
    address: Joi.string().trim(),
    customNote: Joi.string().trim().max(500).allow(''),
    customName: Joi.string().trim().max(100).allow(null),
    customDescription: Joi.string().trim().max(1000).allow(null),
    customCategory: Joi.string().trim().max(50).allow(null),
    customImageUrl: Joi.string().uri().allow(null),
    customImagePath: Joi.string().allow(''),
    isAvailable: Joi.boolean(),
    isPreOwned: Joi.boolean(),
    isWeightBased: Joi.boolean(),
    status: Joi.string().valid('active', 'inactive', 'out_of_stock')
  });

  const { error, value } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }

  req.body = value;
  next();
};

const validateCatalogApproval = (req, res, next) => {
  const schema = Joi.object({
    reason: Joi.string().trim().max(500).allow('').default('')
  });

  const { error, value } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }

  req.body = value;
  next();
};

const validateManualSale = (req, res, next) => {
  const schema = Joi.object({
    productId: Joi.string().required(),
    productName: Joi.string().trim().max(100).required(),
    customName: Joi.string().trim().max(100).allow('', null).default(null),
    quantity: Joi.number().min(1).required(),
    sellingPrice: Joi.number().min(0).required(),
    costPrice: Joi.number().min(0).required(),
    category: Joi.string().trim().required(),
    isWeightBased: Joi.boolean().default(false),
    unit: Joi.string().trim().max(20).default('piece'),
    imageUrl: Joi.string().uri().allow('', null).default(null),
    customerName: Joi.string().trim().max(100).allow('', null).default(null),
    customerPhone: Joi.string().trim().max(20).allow('', null).default(null),
    notes: Joi.string().trim().max(500).allow('', null).default(null),
    saleDate: Joi.date().default(() => new Date())
  });

  const { error, value } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }

  req.body = value;
  next();
};

const validateExpense = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().trim().max(100).required(),
    description: Joi.string().trim().max(1000).required(),
    amount: Joi.number().min(0).required(),
    category: Joi.string().valid(
      'inventory', 'marketing', 'utilities', 'transport', 
      'packaging', 'fees', 'maintenance', 'other'
    ).required(),
    type: Joi.string().valid('business', 'operational', 'marketing').required(),
    reference: Joi.string().trim().max(50).allow('').default(null),
    attachmentUrl: Joi.string().uri().allow('').default(null),
    expenseDate: Joi.date().default(() => new Date())
  });

  const { error, value } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }

  req.body = value;
  next();
};

const validateExpenseUpdate = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().trim().max(100),
    description: Joi.string().trim().max(1000),
    amount: Joi.number().min(0),
    category: Joi.string().valid(
      'inventory', 'marketing', 'utilities', 'transport', 
      'packaging', 'fees', 'maintenance', 'other'
    ),
    type: Joi.string().valid('business', 'operational', 'marketing'),
    reference: Joi.string().trim().max(50).allow(''),
    attachmentUrl: Joi.string().uri().allow(''),
    expenseDate: Joi.date()
  });

  const { error, value } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }

  req.body = value;
  next();
};

module.exports = { 
  validateCatalogProduct, 
  validateSellerProduct, 
  validateSellerProductUpdate, 
  validateCatalogApproval,
  validateManualSale,
  validateExpense,
  validateExpenseUpdate
};
