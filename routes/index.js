var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('Bienvenido a nuestro e-commerce');
});

module.exports = router;
