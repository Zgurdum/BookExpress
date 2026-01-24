const express = require('express');
const router = express.Router();
const messagesController = require('../Controllers/messagesController');
const authMiddleware = require('../Middleware/authMiddleware'); 

// Glavna stranica za poruke
router.get('/', authMiddleware.requireLogin, messagesController.renderMessagesPage);

router.get('/:receiverId', authMiddleware.requireLogin, messagesController.openChat);

module.exports = router;