const express = require('express');
const LoyaltyController = require('../controllers/loyaltyController');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting para proteção
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por 15 minutos
  message: {
    error: 'Muitas requisições. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const addPointsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // máximo 20 adições de pontos por IP por 15 minutos
  message: {
    error: 'Muitas tentativas de adição de pontos. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Aplicar rate limiting geral
router.use(generalLimiter);

// Rotas
router.get('/', LoyaltyController.getAllLoyaltyPoints);
router.get('/customer/:customerId', LoyaltyController.getPointsByCustomerId);
router.post('/customer/:customerId/add-points', addPointsLimiter, LoyaltyController.addPoints);

module.exports = router;