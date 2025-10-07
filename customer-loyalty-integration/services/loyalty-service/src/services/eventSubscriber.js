const redis = require('../config/redis');
const LoyaltyService = require('./loyaltyService');

class EventSubscriber {
  static async startListening() {
    try {
      const subscriber = redis.duplicate();
      await subscriber.connect();
      
      console.log('Loyalty Service - Started listening for customer events...');
      
      await subscriber.subscribe('customer-events', (message) => {
        this.handleCustomerEvent(message);
      });

    } catch (error) {
      console.error('Error starting event subscriber:', error);
      throw error;
    }
  }

  static async handleCustomerEvent(message) {
    try {
      const event = JSON.parse(message);
      console.log('Received event:', event.type, { customerId: event.data.id });

      switch (event.type) {
        case 'user:created':
          await this.handleUserCreated(event.data);
          break;
        case 'user:updated':
          await this.handleUserUpdated(event.data);
          break;
        case 'user:deleted':
          await this.handleUserDeleted(event.data);
          break;
        default:
          console.log('Unknown event type:', event.type);
      }
    } catch (error) {
      console.error('Error handling customer event:', error);
    }
  }

  static async handleUserCreated(customerData) {
    try {
      // Só criar pontos se o cliente optou pelo programa de fidelidade
      if (customerData.fidelity_opt_in === true) {
        await LoyaltyService.createLoyaltyPoints(customerData.id);
        console.log(`Welcome points created for customer ${customerData.id}`);
      } else {
        console.log(`Customer ${customerData.id} did not opt-in for loyalty program`);
      }
    } catch (error) {
      console.error('Error handling user created event:', error);
    }
  }

  static async handleUserUpdated(customerData) {
    try {
      // user:updated não altera pontos conforme especificação
      console.log(`Customer ${customerData.id} updated - no points change required`);
    } catch (error) {
      console.error('Error handling user updated event:', error);
    }
  }

  static async handleUserDeleted(customerData) {
    try {
      await LoyaltyService.removeLoyaltyPoints(customerData.id);
      console.log(`Loyalty points removed for deleted customer ${customerData.id}`);
    } catch (error) {
      console.error('Error handling user deleted event:', error);
    }
  }
}

module.exports = EventSubscriber;