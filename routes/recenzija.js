const express = require('express');
const router = express.Router();
const recenzijaController = require('../Controllers/recenzijaController');
const authMiddleware = require('../Middleware/authMiddleware');

router.get('/ostavi/:narudzba_id', authMiddleware.requireLogin, recenzijaController.showReviewForm);
router.get('/moji-komentari', authMiddleware.requireLogin, recenzijaController.showMyComments)
router.post('/snimi', authMiddleware.requireLogin, recenzijaController.saveReview);
router.get('/uredi/:id', authMiddleware.requireLogin, recenzijaController.showEditForm);
router.post('/uredi/:id', recenzijaController.updateReview);
module.exports = router;