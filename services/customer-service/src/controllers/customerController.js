const CustomerService = require('../services/customerService');
const { validateCustomer, validateCustomerUpdate } = require('../utils/validation');

class CustomerController {
  static async create(req, res) {
    try {
      const { error, value } = validateCustomer(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: error.details.map(detail => detail.message)
        });
      }

      const customer = await CustomerService.createCustomer(value);
      
      res.status(201).json({
        success: true,
        data: customer
      });
    } catch (error) {
      console.error('Error creating customer:', error);
      
      if (error.message === 'Email já cadastrado') {
        return res.status(409).json({
          error: error.message
        });
      }
      
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          error: 'ID inválido'
        });
      }

      const customer = await CustomerService.getCustomerById(parseInt(id));
      
      res.json({
        success: true,
        data: customer
      });
    } catch (error) {
      console.error('Error fetching customer:', error);
      
      if (error.message === 'Cliente não encontrado') {
        return res.status(404).json({
          error: error.message
        });
      }
      
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  static async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 50, 100);
      
      const result = await CustomerService.getAllCustomers(page, limit);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Error fetching customers:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          error: 'ID inválido'
        });
      }

      const { error, value } = validateCustomerUpdate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: error.details.map(detail => detail.message)
        });
      }

      const customer = await CustomerService.updateCustomer(parseInt(id), value);
      
      res.json({
        success: true,
        data: customer
      });
    } catch (error) {
      console.error('Error updating customer:', error);
      
      if (error.message === 'Cliente não encontrado') {
        return res.status(404).json({
          error: error.message
        });
      }
      
      if (error.message === 'Email já cadastrado') {
        return res.status(409).json({
          error: error.message
        });
      }
      
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          error: 'ID inválido'
        });
      }

      const customer = await CustomerService.deleteCustomer(parseInt(id));
      
      res.json({
        success: true,
        message: 'Cliente removido com sucesso',
        data: customer
      });
    } catch (error) {
      console.error('Error deleting customer:', error);
      
      if (error.message === 'Cliente não encontrado') {
        return res.status(404).json({
          error: error.message
        });
      }
      
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = CustomerController;