const { Pool } = require('pg');
const redis = require('redis');

// Configuração do banco de teste
const testPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'customer_service_test',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Configuração do Redis de teste
const testRedis = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

beforeAll(async () => {
  // Conectar ao Redis
  await testRedis.connect();
  
  // Criar tabelas de teste
  await testPool.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      fidelity_opt_in BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

beforeEach(async () => {
  // Limpar dados entre os testes
  await testPool.query('DELETE FROM customers');
  await testRedis.flushDb();
});

afterAll(async () => {
  // Fechar conexões
  await testPool.end();
  await testRedis.quit();
});

module.exports = {
  testPool,
  testRedis
};