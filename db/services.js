const db = require('./config');

function requestOne(table, column, id, callback) {
    const sql = `SELECT * FROM ${table} WHERE ${column} = ${id}`;

    db.any(sql)
        .then(result => {
            callback(null, result);
        })
        .catch(err => {
            callback(err);
        })
}

function getUserCredentials(table, email, callback) {
    const sql = `SELECT email, password FROM ${table} WHERE email = '${email}'`;

    db.any(sql)
        .then(([result]) => {
            callback(null, result);
        })
        .catch(err => {
            callback(err);
        })
}

function insertItem(table, item, callback) {
    const keys = Object.keys(item);
    const properties = keys.join(', ');
    const values = keys.map(key => `'${item[key]}'`).join(', ');
    const sql = `INSERT INTO ${table} (${properties}) VALUES(${values}) RETURNING *`;

    db.any(sql)
        .then(([result]) => {
            callback(null, result);
        })
        .catch(err => {
            callback(err);
        })
}

function findItem(table, column, itemName, callback) {
    const sql = `SELECT * FROM ${table} WHERE LEVENSHTEIN(${column}, '${itemName}') <= 7
        OR SIMILARITY(${column}, '${itemName}') > 0.2`;

    db.any(sql)
        .then(result => {
            callback(null, result);
        })
        .catch(err => {
            callback(err);
        })
}

function requestAll(table, callback) {
    const sql = `SELECT * FROM ${table}`;

    db.any(sql)
        .then(result => {
            callback(null, result);
        })
        .catch(err => {
            callback(err);
        })
}

function filterItem(table, item, callback) {
    const { minPrice, maxPrice, category } = item;
    let whereClause = [];
    if (minPrice) {
        whereClause.push(`price >= ${minPrice}`);
    }
    if (maxPrice) {
        whereClause.push(`price <= ${maxPrice}`);
    }
    if (category) {
        whereClause.push(`category = '${category}'`);
    }
    let where = whereClause.length > 0 ? `WHERE ${whereClause.join(' AND ')}` : '';

    const sql = `SELECT * FROM ${table} ${where}`;

    db.any(sql)
        .then(result => {
            callback(null, result);
        })
        .catch(err => {
            callback(err);
        })
}

function getCartItems(id, callback) {
    const sql = `SELECT c.id AS cart_id, 
            c.user_id, 
            u.name AS user_name, 
            p.name AS product_name,
            p.category AS product_description,
            p.price AS product_price, 
            c.quantity
        FROM cart_items c
        INNER JOIN users u ON c.user_id = u.id
        INNER JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ${id}`;

    db.any(sql)
        .then(result => {
            callback(null, result);
        })
        .catch(err => {
            callback(err);
        })
}

function deleteItem(table, id, callback) {
    const sql = `DELETE FROM ${table} WHERE id = ${id}`;

    db.any(sql)
        .then(() => {
            callback(null);
        })
        .catch(err => {
            callback(err);
        })
}

function getOrderDetails(userId, orderId, callback) {
    const sql = `SELECT o.user_id, 
        oi.order_id, 
        oi.product_id, 
        p.name AS product_name, 
        p.price AS product_price, 
        oi.quantity, 
        o.status AS order_status, 
        o.created_at AS order_date
    FROM orders o
    INNER JOIN order_items oi ON o.id = oi.order_id
    INNER JOIN products p ON oi.product_id = p.id
    WHERE user_id = ${userId} AND order_id = ${orderId}`;

    db.any(sql)
        .then(result => {
            callback(null, result);
        })
        .catch(err => {
            callback(err);
        })
}

module.exports = {
    requestOne,
    insertItem,
    getUserCredentials,
    findItem,
    requestAll,
    filterItem,
    getCartItems,
    deleteItem,
    getOrderDetails
}