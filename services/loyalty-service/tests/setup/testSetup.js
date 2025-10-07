const { Pool } = require('pg');
const redis = require('redis');

// Configuração do banco de teste
const testPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'loyalty_service_test',
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
    CREATE TABLE IF NOT EXISTS loyalty_points (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER NOT NULL UNIQUE,
      points INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

beforeEach(async () => {
  // Limpar dados entre os testes
  await testPool.query('DELETE FROM loyalty_points');
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