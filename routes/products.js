var express = require('express');
var router = express.Router();
const { findItem, requestAll } = require('../db/services');
const { query, validationResult } = require('express-validator');

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource products');
// });

router.get('/', function(req, res, next) {
  requestAll('products', (err, products) => {
    if (err) {
      return next(err);
    }
    res.status(200).json(products)
  });
});

router.get('/search',
  query('name').notEmpty().escape().trim(), 
  function(req, res, next) {
    const errors = validationResult(req.query);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name } = req.query;
    findItem('products', 'name', name, (err, product) => {
      if (err) {
        return next(err);
      }
      res.status(200).json(product);
    });
  }
);

module.exports = router;