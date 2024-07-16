require('dotenv');
var express = require('express');
var router = express.Router();
const { getUserCredentials, insertItem } = require('../db/services');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_PASSWORD;

/* GET home page. */
router.get('/', function(req, res, next) { 
  res.send('Bienvenido a nuestro e-commerce');
});

router.post('/register',
  body('name').isLength({ min: 5 }).escape(),
  body('email').isEmail().notEmpty(),
  body('password').isLength({ min: 7 }).escape(),
  function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;

    const saltRounds = 10;
    bcrypt.genSalt(saltRounds)
      .then(salt => {
        return bcrypt.hash(password, salt)
      })
      .then(hashedPassword => {
        const userCredentials = {
          name: name,
          email: email,
          password: hashedPassword
        }
        insertItem('users', userCredentials, (err, user) => {
          if (err) {
            return next(err);
          }
          res.status(201).json(user);
        });
      })
      .catch(err => {
        next(err);
      });
  }
);

router.post('/login',
  body('email').notEmpty().isEmail(),
  body('password').isLength( { min: 7 }).escape(),
  function(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array()});
    }
    try {
      const { email, password } = req.body;
      getUserCredentials('users', email, (err, credentials) => {
        if (err) {
          return next(err);
        }
        if (!credentials) {
          return res.status(401).json({ message: 'Authentication failed' });
        }
        bcrypt.compare(password, credentials.password)
          .then(matchPassword => {
            if (email === credentials.email && matchPassword) {
              const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '3h' });
              return res.status(200).json({ token, message: 'Successful login', userId: credentials.id, userName: credentials.name });
            } else {
              return res.status(401).json({ message: 'Authentication failed' });
            }
          })
          .catch(err => {
            return res.status(401).json({ error: err});
          })
      })
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error', error: err });
    }
  }
);

module.exports = router;
