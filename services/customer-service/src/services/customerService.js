const Customer = require('../models/Customer');
const EventPublisher = require('./eventPublisher');

class CustomerService {
  static async createCustomer(customerData) {
    // Verificar se o email já existe
    const existingCustomer = await Customer.findByEmail(customerData.email);
    if (existingCustomer) {
      throw new Error('Email já cadastrado');
    }

    const customer = await Customer.create(customerData);
    await EventPublisher.publishUserCreated(customer);
    
    return customer;
  }

  static async getCustomerById(id) {
    const customer = await Customer.findById(id);
    if (!customer) {
      throw new Error('Cliente não encontrado');
    }
    return customer;
  }

  static async getAllCustomers(page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const customers = await Customer.findAll(limit, offset);
    const total = await Customer.count();
    
    return {
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async updateCustomer(id, customerData) {
    const existingCustomer = await Customer.findById(id);
    if (!existingCustomer) {
      throw new Error('Cliente não encontrado');
    }

    const updated = {
      name: customerData.name ?? existingCustomer.name,
      email: customerData.email ?? existingCustomer.email,
      fidelity_opt_in: customerData.fidelityOptIn ?? existingCustomer.fidelity_opt_in
    };

    // Verificar se o novo email já existe (se foi alterado)
    if (customerData.email !== existingCustomer.email) {
      const emailExists = await Customer.findByEmail(customerData.email);
      if (emailExists) {
        throw new Error('Email já cadastrado');
      }
    }

    const customer = await Customer.update(id, customerData);
    await EventPublisher.publishUserUpdated(customer);
    
    return customer;
  }

  static async deleteCustomer(id) {
    const customer = await Customer.findById(id);
    if (!customer) {
      throw new Error('Cliente não encontrado');
    }

    const deletedCustomer = await Customer.delete(id);
    await EventPublisher.publishUserDeleted(deletedCustomer);
    
    return deletedCustomer;
  }
}

module.exports = CustomerService;