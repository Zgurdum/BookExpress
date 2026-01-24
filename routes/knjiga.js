// routes/knjige.js

const express = require('express');
const router = express.Router();

// Uvoz kontrolera i middleware-a
const knjigaController = require('../Controllers/knjigaController');
const promotionsController = require('../Controllers/promotionsController');
const authMiddleware = require('../Middleware/authMiddleware');
const uploadMiddleware = require('../Middleware/uploadMiddleware');

router.get('/add', authMiddleware.requireLogin, knjigaController.getPublishBookForm);

// POST koristi multer za sliku
router.post('/add',
    authMiddleware.requireLogin,
    uploadMiddleware,
    knjigaController.postPublishBook
);

//Search bar
router.get('/search', knjigaController.search);

// Prikaz detalja knjige
router.get('/:id', knjigaController.getBookDetails);
//Delete ruta provjerava middlewarom da li je korisnik zaista vlasnik kad proba obrisati
router.delete('/delete/:id', authMiddleware.requireLogin, authMiddleware.isOwner, knjigaController.deleteBook);
//Za editovanje
router.get('/edit/:id', authMiddleware.requireLogin, authMiddleware.isOwner, knjigaController.getEditKnjiga);

// Editovanje detalja knjige
router.put('/edit/:id',
    authMiddleware.requireLogin,
    authMiddleware.isOwner,
    uploadMiddleware, // Obrada nove slike, ako je poslana
    knjigaController.updateKnjiga
);

// Promovisanje knjige
router.get('/promote/:id', authMiddleware.requireLogin, authMiddleware.isOwner, promotionsController.getPromoteBook);

// AI mi je rekao da ovo koristim kao API rute
router.get('/api/more-books', knjigaController.getMoreBooks);

module.exports = router;