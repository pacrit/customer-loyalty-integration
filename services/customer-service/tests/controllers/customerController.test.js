const request = require('supertest');
const express = require('express');
const CustomerController = require('../../src/controllers/customerController');
const CustomerService = require('../../src/services/customerService');

// Mock do service
jest.mock('../../src/services/customerService');

const app = express();
app.use(express.json());

// Configurar rotas de teste
app.post('/customers', CustomerController.create);
app.get('/customers/:id', CustomerController.getById);
app.get('/customers', CustomerController.getAll);
app.put('/customers/:id', CustomerController.update);
app.delete('/customers/:id', CustomerController.delete);

describe('CustomerController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /customers', () => {
    it('deve criar cliente com dados válidos', async () => {
      const customerData = {
        name: 'João Silva',
        email: 'joao@email.com',
        fidelityOptIn: true
      };

      const mockCustomer = { id: 1, ...customerData };
      CustomerService.createCustomer.mockResolvedValue(mockCustomer);

      const response = await request(app)
        .post('/customers')
        .send(customerData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockCustomer);
      expect(CustomerService.createCustomer).toHaveBeenCalledWith(customerData);
    });

    it('deve retornar erro 400 com dados inválidos', async () => {
      const invalidData = {
        name: 'A', // muito curto
        email: 'email-inválido',
        fidelityOptIn: 'não-booleano'
      };

      const response = await request(app)
        .post('/customers')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Dados inválidos');
      expect(response.body.details).toBeDefined();
      expect(CustomerService.createCustomer).not.toHaveBeenCalled();
    });

    it('deve retornar erro 409 se email já existe', async () => {
      const customerData = {
        name: 'João Silva',
        email: 'joao@email.com',
        fidelityOptIn: true
      };

      CustomerService.createCustomer.mockRejectedValue(new Error('Email já cadastrado'));

      const response = await request(app)
        .post('/customers')
        .send(customerData);

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Email já cadastrado');
    });
  });

  describe('GET /customers/:id', () => {
    it('deve retornar cliente existente', async () => {
      const mockCustomer = { id: 1, name: 'João Silva', email: 'joao@email.com' };
      CustomerService.getCustomerById.mockResolvedValue(mockCustomer);

      const response = await request(app)
        .get('/customers/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockCustomer);
      expect(CustomerService.getCustomerById).toHaveBeenCalledWith(1);
    });

    it('deve retornar erro 400 com ID inválido', async () => {
      const response = await request(app)
        .get('/customers/abc');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('ID inválido');
      expect(CustomerService.getCustomerById).not.toHaveBeenCalled();
    });

    it('deve retornar erro 404 se cliente não encontrado', async () => {
      CustomerService.getCustomerById.mockRejectedValue(new Error('Cliente não encontrado'));

      const response = await request(app)
        .get('/customers/999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Cliente não encontrado');
    });
  });

  describe('PUT /customers/:id', () => {
    it('deve atualizar cliente com sucesso', async () => {
      const updateData = { name: 'João Silva Atualizado' };
      const updatedCustomer = { id: 1, ...updateData, email: 'joao@email.com' };

      CustomerService.updateCustomer.mockResolvedValue(updatedCustomer);

      const response = await request(app)
        .put('/customers/1')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(updatedCustomer);
      expect(CustomerService.updateCustomer).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe('DELETE /customers/:id', () => {
    it('deve deletar cliente com sucesso', async () => {
      const deletedCustomer = { id: 1, name: 'João Silva', email: 'joao@email.com' };
      CustomerService.deleteCustomer.mockResolvedValue(deletedCustomer);

      const response = await request(app)
        .delete('/customers/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Cliente removido com sucesso');
      expect(response.body.data).toEqual(deletedCustomer);
      expect(CustomerService.deleteCustomer).toHaveBeenCalledWith(1);
    });
  });
});