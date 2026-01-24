const express = require('express');
const router = express.Router();
const adminController = require('../Controllers/adminController');
const { isAdmin } = require('../Middleware/authMiddleware');

//Middleware isAdmin stiti ove rute da ne moze nonAdmin account zalutat na njih
router.use(isAdmin);

//Admin front page
router.get('/dashboard', adminController.getDashboard);

//Upravljanje korisnicima
router.get('/korisnici', adminController.getUsersPage); 

//Crud prikaz lookup tabela
router.get('/katalog', adminController.getAdminPanel);


//Dodaj stavku u lookup tabelu
router.post('/katalog/add', adminController.addItem);

// Obrisi stavku iz lookup tabele
router.post('/katalog/delete/:tip/:id', adminController.deleteItem);

// Update stavke iz lookupa ili statusa korisnika
router.post('/katalog/update', adminController.updateItem);
router.post('/korisnici/change-status', adminController.handleStatusChange);
router.post('/korisnici/block', adminController.handleBlocking);

// DELETE ruta za arhiviranje
router.delete('/korisnici/archive/:userId', adminController.handleArchiving);

router.get('/reports', adminController.getReportsPage);
module.exports = router;