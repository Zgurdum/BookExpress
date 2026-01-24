const express = require('express');
const router = express.Router();
const cartController = require('../Controllers/cartController');
const authMiddleware = require('../Middleware/authMiddleware');

// Ruta za dodavanje u korpu
router.post('/add', authMiddleware.requireLogin, cartController.addToCart);

router.get('/items', cartController.getCartItems); //za vracanje svih stavki u korpi - bez middleware jer je fetch zahtjev

router.delete('/remove/:id', cartController.removeFromCart); //za uklanjanje stavke iz korpe - bez middleware jer je fetch zahtjev

module.exports = router;