var express = require('express');
var router = express.Router();
const knjigaController = require ('../Controllers/knjigaController');
/* Front page */
router.get('/', knjigaController.getHomepage);

module.exports = router;
