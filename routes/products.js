var express = require('express');
var router = express.Router();
const { findItem, 
  requestAll, 
  filterItem,
  requestProductsByCategory, 
  requestListOfProductsCategories 
} = require('../db/services');
const { query, validationResult } = require('express-validator');

router.get('/', function(req, res, next) {
  requestAll('products', (err, products) => {
    if (err) {
      return next(err);
    }
    res.status(200).json(products);
  }); 
});

//para buscar un producto en una barra de busqueda
router.get('/search',
  query('name').notEmpty().escape().trim(), 
  function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name } = req.query;
    findItem('products', 'name', name, (err, product) => {
      if (err) {
        return next(err);
      }
      if (!product.length) {
        return res.sendStatus(404);
      }
      res.status(200).json(product);
    });
  }
);

router.get('/categories', function(req, res, next) {
  requestListOfProductsCategories((err, categories) => {
    if (err) {
      return next(err);
    }
    res.status(200).json(categories);
  });
});

//filtra productos en base a las caracteristicas marcadas enviadas en el campo query
router.get('/filters',
  function(req, res, next) {
    const query = req.query;
    filterItem('products', query, (err, products) => {
      if (err) {
        return next(err);
      }
      if (!products.length) {
        return res.status(404).json({ message: 'No products were found with the selected filters' });
      }
      res.status(200).json(products);
    });
});

// envia todos los productos de determinada categoria
router.get('/:category', function(req, res, next) {
  const productCategory = req.params.category;
  requestProductsByCategory(productCategory, (err, products) => {
    if (err) {
      return next(err);
    }
    res.status(200).json(products);
  })
});

module.exports = router;