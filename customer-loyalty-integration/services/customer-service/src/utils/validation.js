const Joi = require('joi');

const customerSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  fidelityOptIn: Joi.boolean().default(false)
});

const updateCustomerSchema = Joi.object({
  name: Joi.string().min(2).max(255),
  email: Joi.string().email(),
  fidelityOptIn: Joi.boolean()
}).min(1);

const validateCustomer = (data) => {
  return customerSchema.validate(data);
};

const validateCustomerUpdate = (data) => {
  return updateCustomerSchema.validate(data);
};

module.exports = {
  validateCustomer,
  validateCustomerUpdate
};