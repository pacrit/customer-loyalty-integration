const Joi = require('joi');

const addPointsSchema = Joi.object({
  points: Joi.number().integer().min(1).max(1000).required()
});

const customerIdSchema = Joi.object({
  customerId: Joi.number().integer().min(1).required()
});

const validateAddPoints = (data) => {
  return addPointsSchema.validate(data);
};

const validateCustomerId = (data) => {
  return customerIdSchema.validate(data);
};

module.exports = {
  validateAddPoints,
  validateCustomerId
};