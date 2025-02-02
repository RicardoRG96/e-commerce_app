var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const { requestOne, getOrderDetails, updateItem, getUserOrders, getOneUserOrder } = require('../db/services');
const { query, validationResult, body } = require('express-validator');
const verifyToken = require('../utils');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.sendStatus(200);
});

//da detalles de una orden en especifico, como por ejemplo los productos comprados, el precio etc.
router.get('/orders/details',
  query('user_id').isInt().escape(),
  query('order_id').isInt().escape(),
  verifyToken, 
  function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { user_id, order_id } = req.query;
    getOrderDetails(user_id, order_id, (err, orderDetails) => {
      if (err) {
        return next(err);
      }
      res.status(200).json(orderDetails);
    });
  }
);

//para acceder a todas las ordenes de determinado cliente, necesario para mostrar un historial de pedidos
router.get('/orders/:id', function(req, res, next) {
  const id = req.params.id;
  getUserOrders(id, (err, orders) => {
    if (err) {
      return next(err);
    }
    res.status(200).json(orders);
  });
});

//obtener info del user y mostrar datos en una pagina de 'mi perfil'
router.get('/:id', verifyToken, function(req, res, next) {
  const id = req.params.id;
  requestOne('users', 'id', id, (err, user) => {
    if (err) {
      return next(err);
    }
    res.status(200).json(user);
  });
});

//para buscar una orden por su numero
router.get('/orders/search/:id',
  query('userId').notEmpty().isInt().escape(), 
  verifyToken, 
  function(req, res, next) {
    const orderId = req.params.id;
    const userId = req.query.userId;
    getOneUserOrder(userId, orderId, (err, order) => {
      if (err) {
        return next(err);
      }
      res.status(200).json(order);
    });
});

router.put('/update-user-info',
  body('userId').isInt().escape(),
  body('name').notEmpty().escape(),
  body('email').isEmail().notEmpty(),
  verifyToken,
  function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array()})
    }

    const { userId } = req.body;
    const nextUserCredentials = {
      name: req.body.name,
      email: req.body.email
    }
    requestOne('users', 'id', userId, (err, userData) => {
      if (err) {
        return next(err);
      }
      if (!userData.length) {
        return res.status(404);
      }
      updateItem('users', userId, nextUserCredentials, (err, updatedData) => {
        if (err) {
          return next(err);
        }
        res.status(200).json(updatedData);
      });
    })
  }
)

router.put('/update-password',
  body('userId').isInt().escape(),
  body('currentPassword').notEmpty().escape(),
  body('newPassword').notEmpty().escape(),
  verifyToken,
  async function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { userId, currentPassword, newPassword } = req.body;
    
      requestOne('users', 'id', userId, (err, userCredentials) => {
        if (err) {
          return next(err);
        }
        if (!userCredentials.length) {
          return res.status(404); 
        }
        bcrypt.compare(currentPassword, userCredentials[0].password)
          .then(matchPassword => {
            if (matchPassword){
              const saltRounds = 10;
              bcrypt.genSalt(saltRounds)
                .then(salt => {
                  return bcrypt.hash(newPassword, salt)
                })
                .then(hashedPassword => {
                  const nextUserPassword = {
                    password: hashedPassword
                  }
                  updateItem('users', userId, nextUserPassword, (err, updatedPassword) => {
                    if (err) {
                      return next(err);
                    }
                    return res.status(200).json({ message: 'password changed successfuly' });
                  })
                })
                .catch(err => {
                  return res.status(404).json({ error: err })
                })
            } else return res.sendStatus(404)
          })
          .catch(err => {
            return res.status(404).json({ error: err })
          })
      })  
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error', error: err });
    }
  }
)

module.exports = router;
