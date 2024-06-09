var express = require('express');
var router = express.Router();
const { insertItem, getCartItems, requestOne, deleteItem } = require('../db/services');
const { body, query, validationResult } = require('express-validator');
const verifyToken = require('../utils');

router.get('/',//para obtener los elementos actuales en el carrito de compras
  query('id').isInt().escape(),
  verifyToken,
  function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const id = req.query.id;
    getCartItems(id, (err, items) => {
      if (err) {
        return next(err);
      }
      res.status(200).json(items);
    });
  }
);

router.post('/',
  body('user_id').isInt().escape(),
  body('product_id').isInt().escape(),
  body('quantity').isInt().escape(),
  verifyToken, 
  function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const cartItem = req.body;

    insertItem('cart_items', cartItem, (err, nextCartItem) => {
      if (err) {
        return next(err);
      }
      res.status(201).json(nextCartItem);
    });
  }
);

router.delete('/item',
  body('id').isInt().escape(),
  verifyToken,
  function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const cartItemId = req.body.id;
    requestOne('cart_items', 'id', cartItemId, (err, cartItem) => {
      if (err) {
        return next(err);
      }
      if (!cartItem.length) {
        return res.sendStatus(404);
      }
      deleteItem('cart_items', id, err => {
        if (err) {
          return next(err);
        }
        res.sendStatus(204);
      });
    });
  }
);

module.exports = router;
