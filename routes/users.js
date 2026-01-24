var express = require('express');
var router = express.Router();


const authMiddleware = require('../Middleware/authMiddleware'); 
const userController = require('../Controllers/userController'); 
const profilUpload = require('../Middleware/multerProfili');

// Provjera vlasnistva na ruti /profil
router.get('/profil', authMiddleware.requireLogin, userController.showMyProfile);

//Editovanje profila - MORA BITI PRIJE TUdjih profila
router.get('/profil/edit', userController.renderEditProfilePage);
router.post('/profil/edit', profilUpload, userController.handleUpdateProfile);

//Tudji profili
router.get('/profil/:id', userController.showProfile);
module.exports = router;