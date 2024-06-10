require('dotenv').config();
var express = require('express');
var router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const { body, validationResult } = require('express-validator');
const verifyToken = require('../utils');

router.get('/', function(req, res, next) {
    res.send('Plataforma de pagos')
    
});

// router.post('/create-payment-intent', async function(req, res, next) {
//     try {
//         const { amount } = req.body;
//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: amount,
//             currency: 'usd',
//         });
//         res.status(201).json({ clientSecret: paymentIntent.client_secret });
//     } catch (err) {
//         res.status(500).json(err)
//     }
// });

router.post('/create-checkout-session', //añadir verifyToken
    body('productName').notEmpty().escape(),
    body('productDescription').notEmpty().escape(),
    body('productPrice').escape(),
    body('quantity').escape(),
    async function(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { productName, productDescription, productPrice, quantity } = req.body;
            const paymentSession = await stripe.checkout.sessions.create({
                success_url: 'http://localhost:3000/success.html',
                cancel_url: 'http://localhost:3000/index.html',
                line_items: [
                    {
                        price_data: {
                            product_data: {
                                name: productName,
                                description: productDescription
                            },
                            currency: 'usd',
                            unit_amount: productPrice
                        },
                        quantity: quantity
                    }
                ],
                mode: 'payment'
            });
            res.status(200).json(paymentSession);
        } catch(err) {
            res.status(500).json(err)
        }
    }
);

module.exports = router;