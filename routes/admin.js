var express = require('express');
var router = express.Router();
const { requestAll, insertItem, updateItem, deleteOrders, requestOne } = require('../db/services');
const { body, validationResult } = require('express-validator');
const verifyToken = require('../utils');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource, account');
});

//obtiene todas las ordenes en el sistema
router.get('/orders', verifyToken, function(req, res, next) {
    requestAll('orders', (err, orders) => {
        if (err) {
            return next(err);
        }
        res.status(200).json(orders);
    });
});

//añade un nuevo producto a la base de datos
router.post('/add-new-product',
    verifyToken,
    body('name').notEmpty().escape(),
    body('description').notEmpty().escape(),
    body('price').isNumeric().escape(),
    body('stock').isInt().escape(),
    body('category').notEmpty().escape(),
    function(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array()});
        }

        const nextProduct = req.body;
        insertItem('products', nextProduct, (err, addedProduct) => {
            if (err) {
                return next(err);
            }
            res.status(201).json(addedProduct);
        });
    }
);

//actualiza datos de los productos
router.put('/update-product-data/:id',
    verifyToken,
    body('id').isInt().escape(),
    body('price').isNumeric().escape(),
    body('stock').isInt().escape(),
    body('category').notEmpty().escape(), 
    function(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const productId = req.params.id;
        const updatedData = req.body;
        if (+updatedData.id !== +productId) {
            return res.sendStatus(409)
        }
        requestOne('products', 'id', productId, (err, product) => {
            if (err) {
                return next(err);
            }
            if (!product.length) {
                return res.sendStatus(404);
            }
            updateItem('products', productId, updatedData, (err, updates) => {
                if (err) {
                    return next(err);
                }
                res.status(200).json(updates);
            })
        });
    }
)

//actualiza el estado de una orden en especifico
router.put('/update-order-status/:id',
    verifyToken,
    body('id').isInt().escape(),
    body('status').notEmpty().escape(), 
    function(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const orderId = req.params.id;
        const updatedOrder = req.body;
        if (+updatedOrder.id !== +orderId) {
            return res.sendStatus(409);
        }
        updateItem('orders', orderId, updatedOrder, (err, update) => {
            if (err) {
                return next(err);
            }
            res.status(200).json(update);
        });
    }
);

//elimina una orden y repone automaticamente el stock de productos
router.delete('/delete-order',
    verifyToken,
    body('orderId').isInt().escape(), 
    function(req, res, next) { 
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { orderId } = req.body;
        requestOne('orders', 'id', orderId, (err, order) => {
            if (err) {
                return next(err);
            }
            if (!order.length) {
                return res.sendStatus(404);
            }
            deleteOrders(orderId, err => {
                if (err) {
                    return next(err);
                }
                res.sendStatus(204);
            });
        });
    }
);

module.exports = router;