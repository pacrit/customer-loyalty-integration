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

    it('deve criar cliente sem fidelityOptIn', async () => {
      const customerData = {
        name: 'Maria Santos',
        email: 'maria@email.com'
      };

      const mockCustomer = { id: 2, ...customerData };

      Customer.findByEmail.mockResolvedValue(null);
      Customer.create.mockResolvedValue(mockCustomer);
      EventPublisher.publishUserCreated.mockResolvedValue();

      const result = await CustomerService.createCustomer(customerData);

      expect(result).toEqual(mockCustomer);
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

    it('deve lidar com ID inválido', async () => {
      Customer.findById.mockResolvedValue(null);

      await expect(CustomerService.getCustomerById('invalid'))
        .rejects.toThrow('Cliente não encontrado');
    });
  });

  describe('updateCustomer', () => {
    it('deve atualizar cliente com sucesso', async () => {
      const existingCustomer = { id: 1, name: 'João', email: 'joao@email.com', fidelity_opt_in: false };
      const updateData = { name: 'João Silva', email: 'joao@email.com', fidelityOptIn: true };
      const expectedUpdateData = { 
        name: 'João Silva', 
        email: 'joao@email.com', 
        fidelity_opt_in: true 
      };
      const updatedCustomer = { id: 1, ...expectedUpdateData };

      Customer.findById.mockResolvedValue(existingCustomer);
      Customer.findByEmail.mockResolvedValue(null);
      Customer.update.mockResolvedValue(updatedCustomer);
      EventPublisher.publishUserUpdated.mockResolvedValue();

      const result = await CustomerService.updateCustomer(1, updateData);

      expect(Customer.findById).toHaveBeenCalledWith(1);
      expect(Customer.update).toHaveBeenCalledWith(1, expectedUpdateData);
      expect(EventPublisher.publishUserUpdated).toHaveBeenCalledWith(updatedCustomer);
      expect(result).toEqual(updatedCustomer);
    });

    it('deve atualizar apenas nome', async () => {
      const existingCustomer = { id: 1, name: 'João', email: 'joao@email.com', fidelity_opt_in: false };
      const updateData = { name: 'João Silva' };
      const expectedUpdateData = { 
        name: 'João Silva', 
        email: 'joao@email.com', 
        fidelity_opt_in: false 
      };
      const updatedCustomer = { id: 1, ...expectedUpdateData };

      Customer.findById.mockResolvedValue(existingCustomer);
      Customer.update.mockResolvedValue(updatedCustomer);
      EventPublisher.publishUserUpdated.mockResolvedValue();

      const result = await CustomerService.updateCustomer(1, updateData);

      expect(Customer.update).toHaveBeenCalledWith(1, expectedUpdateData);
      expect(result).toEqual(updatedCustomer);
    });

    it('deve atualizar apenas fidelityOptIn', async () => {
      const existingCustomer = { id: 1, name: 'João', email: 'joao@email.com', fidelity_opt_in: false };
      const updateData = { fidelityOptIn: true };
      const expectedUpdateData = { 
        name: 'João', 
        email: 'joao@email.com', 
        fidelity_opt_in: true 
      };
      const updatedCustomer = { id: 1, ...expectedUpdateData };

      Customer.findById.mockResolvedValue(existingCustomer);
      Customer.update.mockResolvedValue(updatedCustomer);
      EventPublisher.publishUserUpdated.mockResolvedValue();

      const result = await CustomerService.updateCustomer(1, updateData);

      expect(Customer.update).toHaveBeenCalledWith(1, expectedUpdateData);
      expect(result).toEqual(updatedCustomer);
    });

    it('deve lançar erro se cliente não encontrado', async () => {
      Customer.findById.mockResolvedValue(null);

      await expect(CustomerService.updateCustomer(999, { name: 'Novo Nome' }))
        .rejects.toThrow('Cliente não encontrado');

      expect(Customer.update).not.toHaveBeenCalled();
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

    it('deve permitir manter o mesmo email', async () => {
      const existingCustomer = { id: 1, name: 'João', email: 'joao@email.com', fidelity_opt_in: false };
      const updateData = { name: 'João Silva', email: 'joao@email.com' };
      const expectedUpdateData = { 
        name: 'João Silva', 
        email: 'joao@email.com', 
        fidelity_opt_in: false 
      };
      const updatedCustomer = { id: 1, ...expectedUpdateData };

      Customer.findById.mockResolvedValue(existingCustomer);
      Customer.update.mockResolvedValue(updatedCustomer);
      EventPublisher.publishUserUpdated.mockResolvedValue();

      const result = await CustomerService.updateCustomer(1, updateData);

      expect(Customer.findByEmail).not.toHaveBeenCalled();
      expect(result).toEqual(updatedCustomer);
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

    it('deve lançar erro se EventPublisher falhar', async () => {
      const mockCustomer = { id: 1, name: 'João Silva', email: 'joao@email.com' };

      Customer.findById.mockResolvedValue(mockCustomer);
      Customer.delete.mockResolvedValue(mockCustomer);
      EventPublisher.publishUserDeleted.mockRejectedValue(new Error('Event publishing failed'));

      await expect(CustomerService.deleteCustomer(1))
        .rejects.toThrow('Event publishing failed');
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

    it('deve retornar lista vazia quando não há clientes', async () => {
      Customer.findAll.mockResolvedValue([]);
      Customer.count.mockResolvedValue(0);

      const result = await CustomerService.getAllCustomers(1, 50);

      expect(result).toEqual({
        customers: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0
        }
      });
    });

    it('deve calcular páginas corretamente', async () => {
      const mockCustomers = [
        { id: 1, name: 'João', email: 'joao@email.com' }
      ];

      Customer.findAll.mockResolvedValue(mockCustomers);
      Customer.count.mockResolvedValue(25);

      const result = await CustomerService.getAllCustomers(2, 10);

      expect(Customer.findAll).toHaveBeenCalledWith(10, 10);
      expect(result.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3
      });
    });

    it('deve usar valores padrão para page e limit', async () => {
      const mockCustomers = [];
      Customer.findAll.mockResolvedValue(mockCustomers);
      Customer.count.mockResolvedValue(0);

      const result = await CustomerService.getAllCustomers();

      expect(Customer.findAll).toHaveBeenCalledWith(50, 0);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(50);
    });

    it('deve lidar com página maior que o total de páginas', async () => {
      Customer.findAll.mockResolvedValue([]);
      Customer.count.mockResolvedValue(5);

      const result = await CustomerService.getAllCustomers(10, 10);

      expect(result.pagination.totalPages).toBe(1);
      expect(result.customers).toEqual([]);
    });
  });

  describe('Error handling', () => {
    it('deve propagar erro do Customer.create', async () => {
      const customerData = { name: 'João', email: 'joao@email.com' };
      
      Customer.findByEmail.mockResolvedValue(null);
      Customer.create.mockRejectedValue(new Error('Database error'));

      await expect(CustomerService.createCustomer(customerData))
        .rejects.toThrow('Database error');
    });

    it('deve propagar erro do Customer.update', async () => {
      const existingCustomer = { id: 1, name: 'João', email: 'joao@email.com' };
      
      Customer.findById.mockResolvedValue(existingCustomer);
      Customer.update.mockRejectedValue(new Error('Update failed'));

      await expect(CustomerService.updateCustomer(1, { name: 'Novo Nome' }))
        .rejects.toThrow('Update failed');
    });

    it('deve propagar erro do EventPublisher no create', async () => {
      const customerData = { name: 'João', email: 'joao@email.com' };
      const mockCustomer = { id: 1, ...customerData };

      Customer.findByEmail.mockResolvedValue(null);
      Customer.create.mockResolvedValue(mockCustomer);
      EventPublisher.publishUserCreated.mockRejectedValue(new Error('Event error'));

      await expect(CustomerService.createCustomer(customerData))
        .rejects.toThrow('Event error');
    });
  });
});