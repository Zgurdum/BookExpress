const express = require('express');
const router = express.Router();
const narudzbaController = require('../Controllers/narudzbaController');
const authMiddleware = require('../Middleware/authMiddleware'); 

const db = require('../Models/Index');

// Ruta koja pokreće checkout
router.get('/checkout', authMiddleware.requireLogin, narudzbaController.renderCheckoutPage);

// Obradjujemo narudzbu
router.post('/process', authMiddleware.requireLogin, narudzbaController.potvrdiNarudzbu);

//Prikazujemo narudzbu
router.get('/narudzbe/:id', authMiddleware.requireLogin, narudzbaController.showOrderDetails);

// Prikazujemo stranicu sa narudzbama
router.get('/moje-narudzbe', narudzbaController.showAllOrders);

// Dohvacamo obavijesti korisniku
router.get('/obavijesti-prodavca', authMiddleware.requireLogin,narudzbaController.getObavijesti);
// Za slanje prihvati/odbij odgovora na narudzbu - prodavac

router.post('/odgovori', narudzbaController.odgovoriNaNarudzbu);

router.post('/procitano/:id', async (req, res) => {
    try {
        //NIJE MJESTO OVOM U RUTI
        await db.Obavijesti.destroy({ where: { id: req.params.id } });
        res.sendStatus(200);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;