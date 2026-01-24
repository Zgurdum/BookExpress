// routes/payment.js

const express = require('express');
const authMiddleware = require('../Middleware/authMiddleware');

const router = express.Router();

// Uvoz kontrolera i middleware-a
const promotionsController = require('../Controllers/promotionsController');

router.post('/process-promotion', authMiddleware.requireLogin, promotionsController.processPromotionPayment);

module.exports = router;