var express = require('express');
var router = express.Router();
const { findItem, requestAll, filterItem } = require('../db/services');
const { query, validationResult } = require('express-validator');

//filtra productos en base a las caracteristicas marcadas enviadas en el campo query, si no se envia info en query
//recupera todos los productos disponibles

// router.get('/', function(req, res, next) {
//   const query = req.query;
//   if (query) {
//     filterItem('products', query, (err, products) => {
//       if (err) {
//         return next(err);
//       }
//       if (!products.length) {
//         return res.json({ message: 'No products were found with the selected filters' });
//       }
//       res.status(200).json(products);
//     });
//   } else {
//     requestAll('products', (err, products) => {
//       if (err) {
//         return next(err);
//       }
//       res.status(200).json(products)
//     }); 
//   }
// });

// nuevo enfoque: no deberia filtrar productos en el backend, por ende, a las peticiones de productos, se envian todos los productos
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

module.exports = router;