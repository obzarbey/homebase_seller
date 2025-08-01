const Joi = require('joi');

const validateProduct = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().trim().max(100).required(),
    description: Joi.string().trim().max(1000).allow('').default('No description provided'),
    price: Joi.number().min(0).required(),
    offerPrice: Joi.number().min(0).default(0),
    imageUrl: Joi.string().uri().required(),
    imagePath: Joi.string().allow('').default(''),
    address: Joi.string().trim().required(),
    isAvailable: Joi.boolean().default(true),
    category: Joi.string().trim().required()
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

const validateProductUpdate = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().trim().max(100),
    description: Joi.string().trim().max(1000),
    price: Joi.number().min(0),
    offerPrice: Joi.number().min(0),
    imageUrl: Joi.string().uri(),
    imagePath: Joi.string().allow(''),
    address: Joi.string().trim(),
    isAvailable: Joi.boolean(),
    category: Joi.string().trim()
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

module.exports = { validateProduct, validateProductUpdate };
