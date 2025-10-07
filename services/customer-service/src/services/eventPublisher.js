const redis = require('../config/redis');

class EventPublisher {
  static async publishEvent(eventType, data) {
    try {
      const event = {
        type: eventType,
        data,
        timestamp: new Date().toISOString(),
        service: 'customer-service'
      };

      await redis.publish('customer-events', JSON.stringify(event));
      console.log(`Event published: ${eventType}`, { customerId: data.id });
    } catch (error) {
      console.error('Error publishing event:', error);
      throw error;
    }
  }

  static async publishUserCreated(customer) {
    await this.publishEvent('user:created', customer);
  }

  static async publishUserUpdated(customer) {
    await this.publishEvent('user:updated', customer);
  }

  static async publishUserDeleted(customer) {
    await this.publishEvent('user:deleted', customer);
  }
}

module.exports = EventPublisher;