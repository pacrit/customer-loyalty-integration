const express = require('express');
const CustomerController = require('../controllers/customerController');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting para proteção
const createAccountLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 criações por IP por 15 minutos
  message: {
    error: 'Muitas tentativas de criação de conta. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por 15 minutos
  message: {
    error: 'Muitas requisições. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Aplicar rate limiting geral
router.use(generalLimiter);

// Rotas CRUD
router.post('/', createAccountLimiter, CustomerController.create);
router.get('/', CustomerController.getAll);
router.get('/:id', CustomerController.getById);
router.put('/:id', CustomerController.update);
router.delete('/:id', CustomerController.delete);

module.exports = router;