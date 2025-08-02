const Joi = require('joi');

const Joi = require('joi');

const validateProduct = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.empty': 'Product name cannot be empty',
        'string.min': 'Product name must be at least 1 character long',
        'string.max': 'Product name must not exceed 100 characters',
        'any.required': 'Product name is required'
      }),
    description: Joi.string()
      .trim()
      .max(1000)
      .allow('')
      .default('No description provided')
      .messages({
        'string.max': 'Description must not exceed 1000 characters'
      }),
    price: Joi.number()
      .min(0)
      .max(999999)
      .precision(2)
      .required()
      .messages({
        'number.min': 'Price must be a positive number',
        'number.max': 'Price must not exceed 999,999',
        'any.required': 'Product price is required'
      }),
    offerPrice: Joi.number()
      .min(0)
      .max(999999)
      .precision(2)
      .default(0)
      .messages({
        'number.min': 'Offer price must be a positive number',
        'number.max': 'Offer price must not exceed 999,999'
      }),
    imageUrl: Joi.string()
      .uri({ scheme: ['http', 'https'] })
      .required()
      .messages({
        'string.uri': 'Image URL must be a valid HTTP or HTTPS URL',
        'any.required': 'Product image URL is required'
      }),
    imagePath: Joi.string()
      .allow('')
      .default(''),
    address: Joi.string()
      .trim()
      .min(1)
      .max(200)
      .required()
      .messages({
        'string.empty': 'Address cannot be empty',
        'string.min': 'Address must be at least 1 character long',
        'string.max': 'Address must not exceed 200 characters',
        'any.required': 'Product address is required'
      }),
    isAvailable: Joi.boolean()
      .default(true),
    category: Joi.string()
      .trim()
      .min(1)
      .max(50)
      .required()
      .messages({
        'string.empty': 'Category cannot be empty',
        'string.min': 'Category must be at least 1 character long',
        'string.max': 'Category must not exceed 50 characters',
        'any.required': 'Product category is required'
      })
  });

  const { error, value } = schema.validate(req.body, { 
    abortEarly: false,
    stripUnknown: true 
  });
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Product validation failed',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  // Additional business logic validation
  if (value.offerPrice > value.price) {
    return res.status(400).json({
      success: false,
      message: 'Offer price cannot be greater than regular price'
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
