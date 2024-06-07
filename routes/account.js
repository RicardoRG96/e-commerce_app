var express = require('express');
var router = express.Router();
const { requestOne, insertItem, getUserCredentials } = require('../db/services');
const { body, query, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_PASSWORD;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource, account');
});

function verifyToken(req, res, next) {
  const header = req.header('Authorization') || '';
  const token = header.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token not provided'});
  }
  try {
    const payload = jwt.verify(token, SECRET_KEY);
    req.email = payload.email;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token not valid'});
  }
}

router.post('/register',
  body('name').isLength({ min: 5 }).escape(),
  body('email').isEmail(),
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
        console.log('Error: ' + err);
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
              const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '2h' });
              return res.status(200).json({ token, message: 'Successful login' });
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
