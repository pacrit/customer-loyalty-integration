const request = require('supertest');
const express = require('express');
const LoyaltyController = require('../../src/controllers/loyaltyController');
const LoyaltyService = require('../../src/services/loyaltyService');

// Mock do service
jest.mock('../../src/services/loyaltyService');

const app = express();
app.use(express.json());

// Configurar rotas de teste
app.get('/loyalty', LoyaltyController.getAllLoyaltyPoints);
app.get('/loyalty/customer/:customerId', LoyaltyController.getPointsByCustomerId);
app.post('/loyalty/customer/:customerId/add-points', LoyaltyController.addPoints);

describe('LoyaltyController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /loyalty/customer/:customerId', () => {
    it('deve retornar pontos do cliente', async () => {
      const mockPoints = { id: 1, customer_id: 1, points: 10 };
      LoyaltyService.getPointsByCustomerId.mockResolvedValue(mockPoints);

      const response = await request(app)
        .get('/loyalty/customer/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockPoints);
      expect(LoyaltyService.getPointsByCustomerId).toHaveBeenCalledWith(1);
    });

    it('deve retornar erro 400 com ID inválido', async () => {
      const response = await request(app)
        .get('/loyalty/customer/abc');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('ID do cliente inválido');
      expect(LoyaltyService.getPointsByCustomerId).not.toHaveBeenCalled();
    });

    it('deve retornar erro 404 se cliente não encontrado', async () => {
      LoyaltyService.getPointsByCustomerId.mockRejectedValue(
        new Error('Pontos de fidelidade não encontrados para este cliente')
      );

      const response = await request(app)
        .get('/loyalty/customer/999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Pontos de fidelidade não encontrados para este cliente');
    });
  });

  describe('POST /loyalty/customer/:customerId/add-points', () => {
    it('deve adicionar pontos com sucesso', async () => {
      const pointsData = { points: 5 };
      const updatedPoints = { id: 1, customer_id: 1, points: 15 };

      LoyaltyService.addPointsToCustomer.mockResolvedValue(updatedPoints);

      const response = await request(app)
        .post('/loyalty/customer/1/add-points')
        .send(pointsData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Pontos adicionados com sucesso');
      expect(response.body.data).toEqual(updatedPoints);
      expect(LoyaltyService.addPointsToCustomer).toHaveBeenCalledWith(1, 5);
    });

    it('deve retornar erro 400 com dados inválidos', async () => {
      const invalidData = { points: -1 }; // pontos negativos

      const response = await request(app)
        .post('/loyalty/customer/1/add-points')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Dados inválidos');
      expect(LoyaltyService.addPointsToCustomer).not.toHaveBeenCalled();
    });

    it('deve retornar erro 404 se cliente não encontrado', async () => {
      const pointsData = { points: 5 };

      LoyaltyService.addPointsToCustomer.mockRejectedValue(
        new Error('Cliente não encontrado no programa de fidelidade')
      );

      const response = await request(app)
        .post('/loyalty/customer/999/add-points')
        .send(pointsData);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Cliente não encontrado no programa de fidelidade');
    });
  });

  describe('GET /loyalty', () => {
    it('deve retornar lista paginada de pontos', async () => {
      const mockResult = {
        loyaltyPoints: [
          { id: 1, customer_id: 1, points: 15 },
          { id: 2, customer_id: 2, points: 10 }
        ],
        pagination: {
          page: 1,
          limit: 50,
          total: 2,
          totalPages: 1
        }
      };

      LoyaltyService.getAllLoyaltyPoints.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/loyalty');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.loyaltyPoints).toEqual(mockResult.loyaltyPoints);
      expect(response.body.pagination).toEqual(mockResult.pagination);
    });
  });
});