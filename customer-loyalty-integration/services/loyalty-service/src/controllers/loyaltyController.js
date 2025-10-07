const LoyaltyService = require('../services/loyaltyService');
const { validateCustomerId, validateAddPoints } = require('../utils/validation');

class LoyaltyController {
  static async getPointsByCustomerId(req, res) {
    try {
      const { customerId } = req.params;
      
      const { error } = validateCustomerId({ customerId: parseInt(customerId) });
      if (error) {
        return res.status(400).json({
          error: 'ID do cliente inválido',
          details: error.details.map(detail => detail.message)
        });
      }

      const points = await LoyaltyService.getPointsByCustomerId(parseInt(customerId));
      
      res.json({
        success: true,
        data: points
      });
    } catch (error) {
      console.error('Error fetching loyalty points:', error);
      
      if (error.message === 'Pontos de fidelidade não encontrados para este cliente') {
        return res.status(404).json({
          error: error.message
        });
      }
      
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  static async getAllLoyaltyPoints(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 50, 100);
      
      const result = await LoyaltyService.getAllLoyaltyPoints(page, limit);
      
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Error fetching all loyalty points:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }

  static async addPoints(req, res) {
    try {
      const { customerId } = req.params;
      
      const customerValidation = validateCustomerId({ customerId: parseInt(customerId) });
      if (customerValidation.error) {
        return res.status(400).json({
          error: 'ID do cliente inválido',
          details: customerValidation.error.details.map(detail => detail.message)
        });
      }

      const pointsValidation = validateAddPoints(req.body);
      if (pointsValidation.error) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: pointsValidation.error.details.map(detail => detail.message)
        });
      }

      const updatedPoints = await LoyaltyService.addPointsToCustomer(
        parseInt(customerId), 
        pointsValidation.value.points
      );
      
      res.json({
        success: true,
        message: 'Pontos adicionados com sucesso',
        data: updatedPoints
      });
    } catch (error) {
      console.error('Error adding points:', error);
      
      if (error.message === 'Cliente não encontrado no programa de fidelidade') {
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

module.exports = LoyaltyController;