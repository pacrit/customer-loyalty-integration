const LoyaltyService = require('../../src/services/loyaltyService');
const LoyaltyPoints = require('../../src/models/LoyaltyPoints');

// Mock do modelo
jest.mock('../../src/models/LoyaltyPoints');

describe('LoyaltyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createLoyaltyPoints', () => {
    it('deve criar pontos de fidelidade com 1 ponto inicial', async () => {
      const customerId = 1;
      const mockPoints = { id: 1, customer_id: customerId, points: 1 };

      LoyaltyPoints.findByCustomerId.mockResolvedValue(null);
      LoyaltyPoints.create.mockResolvedValue(mockPoints);

      const result = await LoyaltyService.createLoyaltyPoints(customerId);

      expect(LoyaltyPoints.findByCustomerId).toHaveBeenCalledWith(customerId);
      expect(LoyaltyPoints.create).toHaveBeenCalledWith(customerId, 1);
      expect(result).toEqual(mockPoints);
    });

    it('deve retornar pontos existentes se cliente já tem registro', async () => {
      const customerId = 1;
      const existingPoints = { id: 1, customer_id: customerId, points: 5 };

      LoyaltyPoints.findByCustomerId.mockResolvedValue(existingPoints);

      const result = await LoyaltyService.createLoyaltyPoints(customerId);

      expect(LoyaltyPoints.findByCustomerId).toHaveBeenCalledWith(customerId);
      expect(LoyaltyPoints.create).not.toHaveBeenCalled();
      expect(result).toEqual(existingPoints);
    });
  });

  describe('getPointsByCustomerId', () => {
    it('deve retornar pontos do cliente', async () => {
      const customerId = 1;
      const mockPoints = { id: 1, customer_id: customerId, points: 10 };

      LoyaltyPoints.findByCustomerId.mockResolvedValue(mockPoints);

      const result = await LoyaltyService.getPointsByCustomerId(customerId);

      expect(LoyaltyPoints.findByCustomerId).toHaveBeenCalledWith(customerId);
      expect(result).toEqual(mockPoints);
    });

    it('deve lançar erro se cliente não tem pontos', async () => {
      const customerId = 999;

      LoyaltyPoints.findByCustomerId.mockResolvedValue(null);

      await expect(LoyaltyService.getPointsByCustomerId(customerId))
        .rejects.toThrow('Pontos de fidelidade não encontrados para este cliente');
    });
  });

  describe('removeLoyaltyPoints', () => {
    it('deve remover pontos do cliente', async () => {
      const customerId = 1;
      const deletedPoints = { id: 1, customer_id: customerId, points: 5 };

      LoyaltyPoints.delete.mockResolvedValue(deletedPoints);

      const result = await LoyaltyService.removeLoyaltyPoints(customerId);

      expect(LoyaltyPoints.delete).toHaveBeenCalledWith(customerId);
      expect(result).toEqual(deletedPoints);
    });

    it('deve retornar null se cliente não tinha pontos', async () => {
      const customerId = 999;

      LoyaltyPoints.delete.mockResolvedValue(null);

      const result = await LoyaltyService.removeLoyaltyPoints(customerId);

      expect(LoyaltyPoints.delete).toHaveBeenCalledWith(customerId);
      expect(result).toBeNull();
    });
  });

  describe('addPointsToCustomer', () => {
    it('deve adicionar pontos ao cliente existente', async () => {
      const customerId = 1;
      const pointsToAdd = 5;
      const existingPoints = { id: 1, customer_id: customerId, points: 10 };
      const updatedPoints = { id: 1, customer_id: customerId, points: 15 };

      LoyaltyPoints.findByCustomerId.mockResolvedValue(existingPoints);
      LoyaltyPoints.addPoints.mockResolvedValue(updatedPoints);

      const result = await LoyaltyService.addPointsToCustomer(customerId, pointsToAdd);

      expect(LoyaltyPoints.findByCustomerId).toHaveBeenCalledWith(customerId);
      expect(LoyaltyPoints.addPoints).toHaveBeenCalledWith(customerId, pointsToAdd);
      expect(result).toEqual(updatedPoints);
    });

    it('deve lançar erro se cliente não existe no programa', async () => {
      const customerId = 999;
      const pointsToAdd = 5;

      LoyaltyPoints.findByCustomerId.mockResolvedValue(null);

      await expect(LoyaltyService.addPointsToCustomer(customerId, pointsToAdd))
        .rejects.toThrow('Cliente não encontrado no programa de fidelidade');

      expect(LoyaltyPoints.addPoints).not.toHaveBeenCalled();
    });
  });

  describe('getAllLoyaltyPoints', () => {
    it('deve retornar lista paginada de pontos', async () => {
      const mockPoints = [
        { id: 1, customer_id: 1, points: 15 },
        { id: 2, customer_id: 2, points: 10 }
      ];

      LoyaltyPoints.findAll.mockResolvedValue(mockPoints);
      LoyaltyPoints.count.mockResolvedValue(2);

      const result = await LoyaltyService.getAllLoyaltyPoints(1, 50);

      expect(LoyaltyPoints.findAll).toHaveBeenCalledWith(50, 0);
      expect(LoyaltyPoints.count).toHaveBeenCalled();
      expect(result).toEqual({
        loyaltyPoints: mockPoints,
        pagination: {
          page: 1,
          limit: 50,
          total: 2,
          totalPages: 1
        }
      });
    });
  });
});