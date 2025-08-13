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
    stock: Joi.number().min(0).required(),
    address: Joi.string().trim().required(),
    customNote: Joi.string().trim().max(500).allow('').default(''),
    customName: Joi.string().trim().max(100).allow(null).default(null),
    customImageUrl: Joi.string().uri().allow(null).default(null),
    customImagePath: Joi.string().allow('').default(null),
    isAvailable: Joi.boolean().default(true),
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
    stock: Joi.number().min(0),
    address: Joi.string().trim(),
    customNote: Joi.string().trim().max(500).allow(''),
    customName: Joi.string().trim().max(100).allow(null),
    customImageUrl: Joi.string().uri().allow(null),
    customImagePath: Joi.string().allow(''),
    isAvailable: Joi.boolean(),
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

module.exports = { 
  validateCatalogProduct, 
  validateSellerProduct, 
  validateSellerProductUpdate, 
  validateCatalogApproval 
};
