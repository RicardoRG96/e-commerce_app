var express = require('express');
var router = express.Router();
const { 
  insertItem,
  requestOne,
  deleteItem,
  getCartItems,
  subtractAProductFromCart, 
  addAProductToCart, 
  getOneFromCart,
  deleteOneFromCart
} = require('../db/services');
const { body, query, validationResult } = require('express-validator');
const verifyToken = require('../utils');

//para obtener los elementos actuales en el carrito de compras
router.get('/',
  query('user_id').isInt().escape(),
  // verifyToken,
  function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const id = req.query.user_id;
    getCartItems(id, (err, items) => {
      if (err) {
        return next(err);
      }
      res.status(200).json(items);
    });
  }
);

//para agregar un producto al carro por primera vez
router.post('/add-to-cart',
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
    const productId = req.body.product_id;
    const userId = req.body.user_id;

    insertItem('cart_items', cartItem, (err, nextCartItem) => {
      if (err) {
        return next(err);
      }
      res.status(201).json(nextCartItem);
    });
  }
);


//actualiza la columna 'quantity' de la tabla 'cart_items', pensado para cuando el usario pulse alguna tecla de '+' a un producto
router.put('/add-one-to-cart',
  body('user_id').isInt().escape(), 
  body('product_id').isInt().escape(),
  function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const userId = req.body.user_id;
    const productId = req.body.product_id;
    addAProductToCart(productId, userId, (err, product) => {
      if (err) {
        return next(err);
      }
      res.status(201).json(product);
    });
  }
);

//actualiza la columna 'quantity' de la tabla 'cart_items', pensado para cuando el usario pulse alguna tecla de '-' a un producto
router.put('/subtract-one-from-cart',
  body('user_id').isInt().escape(),
  body('product_id').isInt().escape(), 
  function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    const userId = req.body.user_id;
    const productId = req.body.product_id;
    subtractAProductFromCart(productId, userId, (err, product) => {
      if (err) {
        return next(err);
      }
      res.status(201).json(product);
    });
  }
);

//elimina totalmente un producto del carrito de compras
router.delete('/remove-product',
  body('user_id').isInt().escape(),
  body('product_id').isInt().escape(),
  verifyToken,
  function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const userId = req.body.user_id;
    const productId = req.body.product_id;
    //comprueba si el elemento existe en la tabla
    getOneFromCart(userId, productId, (err, cartItem) => {
      if (err) {
        return next(err);
      }
      if (!cartItem.length) {
        return res.sendStatus(404);
      }
      //si existe lo elimina
      deleteOneFromCart(userId, productId, err => {
        if (err) {
          return next(err);
        }
        res.sendStatus(204);
      });
    });
  }
);

// para vaciar totalmente el carrito de compras del usuario
router.delete('/clear-out-cart',
  body('user_id').isInt().escape(), 
  function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.body.user_id;
    requestOne('cart_items', 'user_id', userId, (err, items) => {
      if (err) {
        return next(err);
      }
      if (!items.length) {
        return res.sendStatus(404);
      }
      deleteItem('cart_items', 'user_id', userId, err => {
        if (err) {
          return next(err);
        }
        res.sendStatus(204);
      });
    });
  }
);

module.exports = router;
