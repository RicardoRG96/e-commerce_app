var express = require('express');
var router = express.Router();
const { insertItem, getUserCredentials, requestOne } = require('../db/services');
const { query, validationResult } = require('express-validator');
const verifyToken = require('../utils');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource, account');
});

router.get('/:id', function(req, res, next) { //para obtener la informacion del usuario y mostrar datos en una pagina de 'mi perfil'
  const id = req.params.id;
  requestOne('users', id, (err, user) => {
    if (err) {
      return next(err);
    }
    res.status(200).json(user);
  });
});

module.exports = router;
