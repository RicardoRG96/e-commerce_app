require('dotenv').config();
const initOptions = {};
const pgp = require('pg-promise')(initOptions);

const cn = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: 'localhost',
    port: 5432,
    database: process.env.NODE_ENV === 'test' ? 'e-commerce_test' : 'e-commerce_project'
};

const db = pgp(cn);

module.exports = {
    db,
    pgp
};