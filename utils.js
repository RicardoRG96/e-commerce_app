require('dotenv');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_PASSWORD;

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
      return res.status(403).json({ message: 'Token not valid' });
    }
}

module.exports = verifyToken;