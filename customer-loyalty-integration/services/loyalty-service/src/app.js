require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const redis = require('./config/redis');
const EventSubscriber = require('./services/eventSubscriber');

const loyaltyRoutes = require('./routes/loyaltyRoutes');

const app = express();
const PORT = process.env.PORT || 3002;

// Middlewares de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

// Middlewares básicos
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'loyalty-service',
    timestamp: new Date().toISOString()
  });
});

// Rotas
app.use('/api/loyalty', loyaltyRoutes);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Erro interno do servidor'
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada'
  });
});

// Inicialização do servidor
async function startServer() {
  try {
    await redis.connect();
    console.log('Loyalty Service - Connected to Redis');
    
    // Iniciar subscriber de eventos
    await EventSubscriber.startListening();
    
    app.listen(PORT, () => {
      console.log(`Loyalty Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start loyalty service:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;