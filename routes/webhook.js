require('dotenv').config();
var express = require('express');
var router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
const { updateDataBaseTables } = require('../db/services');

//crea un evento y lo redirecciona al servidor cuando este es un evento de confirmacion de pago
//con este evento de confirmacion se actualiza la base de datos, creando un registro en orders, orders_items,
//elimina del carrito los productos de ese usuario y actualiza el stock
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res, next) => {
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

      const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
        event.data.object.id
      );
      const lineItems = sessionWithLineItems.metadata;

      const userId = parseInt(lineItems.user_id);
      const total = parseFloat(lineItems.total / 100);

      updateDataBaseTables(userId, total, (err, updates) => {
        if (err) {
          console.log(err);
          return next(err);
        }
        console.log('Base de datos actualizada con exito');
      });

    }
    res.status(200).send('Received webhook');
});

module.exports = router;