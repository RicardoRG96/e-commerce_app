require('dotenv').config();
var express = require('express');
var router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const { insertItem, getCartItems, requestOne, deleteItem } = require('../db/services');

router.post('/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
    let event;
  
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
      return res.sendStatus(400);
    }
  
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
  
      // Aquí puedes manejar la lógica de negocio, como actualizar el pedido en tu base de datos

      deleteItem('orders', 7, err => {
        if (err) {
            return next(err);
        }
        res.status(200)
      })
    }
  
    res.status(200).send('Received webhook');
});

module.exports = router;