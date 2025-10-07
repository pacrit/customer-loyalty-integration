const LoyaltyPoints = require('../models/LoyaltyPoints');

class LoyaltyService {
  static async createLoyaltyPoints(customerId) {
    try {
      // Verificar se já existe um registro para este cliente
      const existingPoints = await LoyaltyPoints.findByCustomerId(customerId);
      if (existingPoints) {
        console.log(`Customer ${customerId} already has loyalty points`);
        return existingPoints;
      }

      // Criar com 1 ponto inicial de brinde
      const loyaltyPoints = await LoyaltyPoints.create(customerId, 1);
      console.log(`Created loyalty points for customer ${customerId} with 1 welcome point`);
      
      return loyaltyPoints;
    } catch (error) {
      console.error('Error creating loyalty points:', error);
      throw error;
    }
  }

  static async getPointsByCustomerId(customerId) {
    const points = await LoyaltyPoints.findByCustomerId(customerId);
    if (!points) {
      throw new Error('Pontos de fidelidade não encontrados para este cliente');
    }
    return points;
  }

  static async removeLoyaltyPoints(customerId) {
    try {
      const deletedPoints = await LoyaltyPoints.delete(customerId);
      if (deletedPoints) {
        console.log(`Removed loyalty points for customer ${customerId}`);
      } else {
        console.log(`No loyalty points found for customer ${customerId}`);
      }
      return deletedPoints;
    } catch (error) {
      console.error('Error removing loyalty points:', error);
      throw error;
    }
  }

  static async addPointsToCustomer(customerId, points) {
    try {
      const existingPoints = await LoyaltyPoints.findByCustomerId(customerId);
      if (!existingPoints) {
        throw new Error('Cliente não encontrado no programa de fidelidade');
      }

      const updatedPoints = await LoyaltyPoints.addPoints(customerId, points);
      console.log(`Added ${points} points to customer ${customerId}`);
      
      return updatedPoints;
    } catch (error) {
      console.error('Error adding points:', error);
      throw error;
    }
  }

  static async getAllLoyaltyPoints(page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const loyaltyPoints = await LoyaltyPoints.findAll(limit, offset);
    const total = await LoyaltyPoints.count();
    
    return {
      loyaltyPoints,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = LoyaltyService;