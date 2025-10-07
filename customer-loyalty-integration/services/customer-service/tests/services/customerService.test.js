const CustomerService = require('../../src/services/customerService');
const Customer = require('../../src/models/Customer');
const EventPublisher = require('../../src/services/eventPublisher');

// Mock dos módulos
jest.mock('../../src/models/Customer');
jest.mock('../../src/services/eventPublisher');

describe('CustomerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCustomer', () => {
    it('deve criar um cliente com sucesso', async () => {
      const customerData = {
        name: 'João Silva',
        email: 'joao@email.com',
        fidelityOptIn: true
      };

      const mockCustomer = { id: 1, ...customerData };

      Customer.findByEmail.mockResolvedValue(null);
      Customer.create.mockResolvedValue(mockCustomer);
      EventPublisher.publishUserCreated.mockResolvedValue();

      const result = await CustomerService.createCustomer(customerData);

      expect(Customer.findByEmail).toHaveBeenCalledWith(customerData.email);
      expect(Customer.create).toHaveBeenCalledWith(customerData);
      expect(EventPublisher.publishUserCreated).toHaveBeenCalledWith(mockCustomer);
      expect(result).toEqual(mockCustomer);
    });

    it('deve lançar erro se email já existe', async () => {
      const customerData = {
        name: 'João Silva',
        email: 'joao@email.com',
        fidelityOptIn: true
      };

      Customer.findByEmail.mockResolvedValue({ id: 1, email: 'joao@email.com' });

      await expect(CustomerService.createCustomer(customerData))
        .rejects.toThrow('Email já cadastrado');

      expect(Customer.create).not.toHaveBeenCalled();
      expect(EventPublisher.publishUserCreated).not.toHaveBeenCalled();
    });
  });

  describe('getCustomerById', () => {
    it('deve retornar cliente existente', async () => {
      const mockCustomer = { id: 1, name: 'João Silva', email: 'joao@email.com' };
      Customer.findById.mockResolvedValue(mockCustomer);

      const result = await CustomerService.getCustomerById(1);

      expect(Customer.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCustomer);
    });

    it('deve lançar erro se cliente não encontrado', async () => {
      Customer.findById.mockResolvedValue(null);

      await expect(CustomerService.getCustomerById(999))
        .rejects.toThrow('Cliente não encontrado');
    });
  });

  describe('updateCustomer', () => {
    it('deve atualizar cliente com sucesso', async () => {
      const existingCustomer = { id: 1, name: 'João', email: 'joao@email.com' };
      const updateData = { name: 'João Silva', email: 'joao@email.com', fidelityOptIn: true };
      const updatedCustomer = { id: 1, ...updateData };

      Customer.findById.mockResolvedValue(existingCustomer);
      Customer.findByEmail.mockResolvedValue(null);
      Customer.update.mockResolvedValue(updatedCustomer);
      EventPublisher.publishUserUpdated.mockResolvedValue();

      const result = await CustomerService.updateCustomer(1, updateData);

      expect(Customer.findById).toHaveBeenCalledWith(1);
      expect(Customer.update).toHaveBeenCalledWith(1, updateData);
      expect(EventPublisher.publishUserUpdated).toHaveBeenCalledWith(updatedCustomer);
      expect(result).toEqual(updatedCustomer);
    });

    it('deve lançar erro se tentar atualizar para email já existente', async () => {
      const existingCustomer = { id: 1, name: 'João', email: 'joao@email.com' };
      const updateData = { email: 'outro@email.com' };

      Customer.findById.mockResolvedValue(existingCustomer);
      Customer.findByEmail.mockResolvedValue({ id: 2, email: 'outro@email.com' });

      await expect(CustomerService.updateCustomer(1, updateData))
        .rejects.toThrow('Email já cadastrado');

      expect(Customer.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteCustomer', () => {
    it('deve deletar cliente com sucesso', async () => {
      const mockCustomer = { id: 1, name: 'João Silva', email: 'joao@email.com' };

      Customer.findById.mockResolvedValue(mockCustomer);
      Customer.delete.mockResolvedValue(mockCustomer);
      EventPublisher.publishUserDeleted.mockResolvedValue();

      const result = await CustomerService.deleteCustomer(1);

      expect(Customer.findById).toHaveBeenCalledWith(1);
      expect(Customer.delete).toHaveBeenCalledWith(1);
      expect(EventPublisher.publishUserDeleted).toHaveBeenCalledWith(mockCustomer);
      expect(result).toEqual(mockCustomer);
    });

    it('deve lançar erro se cliente não encontrado', async () => {
      Customer.findById.mockResolvedValue(null);

      await expect(CustomerService.deleteCustomer(999))
        .rejects.toThrow('Cliente não encontrado');

      expect(Customer.delete).not.toHaveBeenCalled();
    });
  });

  describe('getAllCustomers', () => {
    it('deve retornar lista paginada de clientes', async () => {
      const mockCustomers = [
        { id: 1, name: 'João', email: 'joao@email.com' },
        { id: 2, name: 'Maria', email: 'maria@email.com' }
      ];

      Customer.findAll.mockResolvedValue(mockCustomers);
      Customer.count.mockResolvedValue(2);

      const result = await CustomerService.getAllCustomers(1, 50);

      expect(Customer.findAll).toHaveBeenCalledWith(50, 0);
      expect(Customer.count).toHaveBeenCalled();
      expect(result).toEqual({
        customers: mockCustomers,
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