var express = require('express');
var router = express.Router();
const { requestOne, getOrderDetails } = require('../db/services');
const { query, validationResult } = require('express-validator');
const verifyToken = require('../utils');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource, account');
});

router.get('/orders/details',
  query('userId').isInt().escape(),
  query('orderId').isInt().escape(),
  // verifyToken, 
  function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { userId, orderId } = req.query;
    getOrderDetails(userId, orderId, (err, orderDetails) => {
      if (err) {
        return next(err);
      }
      res.status(200).json(orderDetails);
    });
  }
);

router.get('/orders/:id', verifyToken, function(req, res, next) {
  const id = req.params.id;
  requestOne('orders', 'user_id', id, (err, orders) => {
    if (err) {
      return next(err);
    }
    res.status(200).json(orders);
  });
});

router.get('/:id', verifyToken, function(req, res, next) { //obtener infor del user y mostrar datos en una pagina de 'mi perfil'
  const id = req.params.id;
  requestOne('users', 'id', id, (err, user) => {
    if (err) {
      return next(err);
    }
    res.status(200).json(user);
  });
});

module.exports = router;
