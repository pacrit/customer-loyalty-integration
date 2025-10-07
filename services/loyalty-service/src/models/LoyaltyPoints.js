const pool = require('../config/database');

class LoyaltyPoints {
  static async create(customerId, points = 1) {
    const query = `
      INSERT INTO loyalty_points (customer_id, points)
      VALUES ($1, $2)
      RETURNING *
    `;
    
    const result = await pool.query(query, [customerId, points]);
    return result.rows[0];
  }

  static async findByCustomerId(customerId) {
    const query = 'SELECT * FROM loyalty_points WHERE customer_id = $1';
    const result = await pool.query(query, [customerId]);
    return result.rows[0];
  }

  static async updatePoints(customerId, points) {
    const query = `
      UPDATE loyalty_points 
      SET points = $1, updated_at = CURRENT_TIMESTAMP
      WHERE customer_id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [points, customerId]);
    return result.rows[0];
  }

  static async addPoints(customerId, pointsToAdd) {
    const query = `
      UPDATE loyalty_points 
      SET points = points + $1, updated_at = CURRENT_TIMESTAMP
      WHERE customer_id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [pointsToAdd, customerId]);
    return result.rows[0];
  }

  static async delete(customerId) {
    const query = 'DELETE FROM loyalty_points WHERE customer_id = $1 RETURNING *';
    const result = await pool.query(query, [customerId]);
    return result.rows[0];
  }

  static async findAll(limit = 50, offset = 0) {
    const query = `
      SELECT * FROM loyalty_points 
      ORDER BY points DESC, created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  static async count() {
    const query = 'SELECT COUNT(*) FROM loyalty_points';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }
}

module.exports = LoyaltyPoints;