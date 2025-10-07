const pool = require('../config/database');

class Customer {
  static async create(customerData) {
    const { name, email, fidelityOptIn } = customerData;
    
    const query = `
      INSERT INTO customers (name, email, fidelity_opt_in)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await pool.query(query, [name, email, fidelityOptIn]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM customers WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM customers WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findAll(limit = 50, offset = 0) {
    const query = `
      SELECT * FROM customers 
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  static async update(id, customerData) {
    const { name, email, fidelityOptIn } = customerData;
    
    const query = `
      UPDATE customers 
      SET name = $1, email = $2, fidelity_opt_in = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;
    
    const result = await pool.query(query, [name, email, fidelityOptIn, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM customers WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async count() {
    const query = 'SELECT COUNT(*) FROM customers';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }
}

module.exports = Customer;