require('dotenv').config();
var express = require('express');
var router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const { body, validationResult } = require('express-validator');
const verifyToken = require('../utils');

router.get('/', function(req, res, next) {
    res.send('Plataforma de pagos')
    
});

//redirecciona a una plataforma de pago de stripe
router.post('/create-checkout-session',
    verifyToken, 
    body('userId').isInt().escape(),
    body('products').notEmpty().escape(),
    body('description').notEmpty().escape(),
    body('total').isInt().escape(),
    async function(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { userId, products, description, total } = req.body;
            const paymentSession = await stripe.checkout.sessions.create({
                success_url: 'http://localhost:3000/success.html',
                cancel_url: 'http://localhost:3000/index.html',
                metadata: {
                    user_id: userId,
                    total: total,
                    status: 'Pending'
                },
                line_items: [
                    {
                        price_data: {
                            product_data: {
                                name: products,
                                description: description
                            },
                            currency: 'usd',
                            unit_amount: total
                        },
                        quantity: 1
                    },
                ],
                mode: 'payment',
            });
            res.status(200).json(paymentSession);
        } catch(err) {
            res.status(500).json(err)
        }
    }
);

module.exports = router;