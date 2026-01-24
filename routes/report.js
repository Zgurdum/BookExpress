const express = require('express');
const router = express.Router();
const reportController = require('../Controllers/reportController');
const authMiddleware = require('../Middleware/authMiddleware'); 
router.get('/:id', authMiddleware.requireLogin, reportController.getReportForm);


router.post('/:id', authMiddleware.requireLogin, reportController.submitReport);

module.exports = router;