const express = require('express');
const router = express.Router();
const profilUpload = require('../Middleware/multerProfili');
const authController = require('../Controllers/authController');

//Get login ruta
router.get('/login', authController.getLoginForm);

//Register ruta
router.get('/register', authController.getRegisterForm);


router.post('/login', authController.login);
router.post('/register', profilUpload, authController.register);

router.post('/logout', authController.logout);
module.exports = router;