const Joi = require('joi');

const citiesValidation = (req, res, next) => {
  const schema = Joi.object({
    countryCode: Joi.string().valid('PL', 'DE', 'ES', 'FR').required(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10)
  });

  const { error, value } = schema.validate({
    countryCode: req.params.countryCode,
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10
  });

  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }

  // Update req.params and req.query with validated values
  req.params.countryCode = value.countryCode;
  req.query.page = value.page;
  req.query.limit = value.limit;

  next();
};

module.exports = {
  citiesValidation
};
