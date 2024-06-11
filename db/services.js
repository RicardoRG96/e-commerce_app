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
            c.product_id,
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

function deleteItem(table, column, id, callback) {
    const sql = `DELETE FROM ${table} WHERE ${column} = ${id}`;

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

function subtractAProductFromCart(productId, userId, callback) {
    const sql = `UPDATE cart_items SET quantity = quantity - 1 WHERE product_id = ${productId} AND user_id = ${userId} RETURNING *`;

    db.any(sql)
        .then(result => {
            callback(null, result);
        })
        .catch(err => {
            callback(err);
        })
}

function addAProductToCart(productId, userId, callback) {
    const sql = `UPDATE cart_items SET quantity = quantity + 1 WHERE product_id = ${productId} AND user_id = ${userId} RETURNING *`;

    db.any(sql)
        .then(result => {
            callback(null, result);
        })
        .catch(err => {
            callback(err);
        })
}

function getOneFromCart(userId, productId, callback) {
    const sql = `SELECT * FROM cart_items WHERE user_id = ${userId} AND product_id = ${productId}`;

    db.any(sql)
        .then(result => {
            callback(null, result);
        })
        .catch(err => {
            callback(err);
        })
}

function deleteOneFromCart(userId, productId, callback) {
    const sql = `DELETE FROM cart_items WHERE user_id = ${userId} AND product_id = ${productId}`;

    db.any(sql)
        .then(() => {
            callback(null);
        })
        .catch(err => {
            callback(err);
        })
}

function createOrderRecord(userId, total, callback) {
    const sql = `INSERT INTO orders (user_id, total, status) VALUES (${userId}, ${total}, 'Pending') RETURNING *`;

    db.any(sql)
        .then(result => {
            callback(null, result);
        })
        .catch(err => {
            callback(err);
        })
}

function getOrderItems(callback) {
    const sql = `SELECT MAX(o.id) AS order_id, 
        c.product_id,
        c.quantity,
        p.price
    FROM orders o
    INNER JOIN cart_items c ON o.user_id = c.user_id
    INNER JOIN products p ON c.product_id = p.id
    GROUP BY c.product_id, c.quantity, p.price
    ORDER BY c.product_id;`

    db.any(sql)
        .then(result => {
            callback(null, result);
        })
        .catch(err => {
            callback(err);
        })
}

function updateDataBaseTables(userId, total, callback) {
    createOrderRecord(userId, total, (err, order) => {
        if (err) {
            return console.log(err);
        }
        getOrderItems((err, items) => {
            if (err) {
                return console.log(err);
            }
            const itemsValues = items.map(item => `(${item.order_id}, ${item.product_id}, ${item.quantity}, ${item.price})`).join(', ');
            const stockUpdates = items.map(item => `UPDATE products SET stock = stock - ${item.quantity} WHERE id = ${item.product_id}`).join('; ');
            const sql = `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ${itemsValues};
                DELETE FROM cart_items WHERE user_id = ${userId};
                ${stockUpdates}`;
    
            db.any(sql)
                .then(result => {
                    callback(null, result);
                })
                .catch(err => {
                    callback(err);
                })
        });
    });

    // getOrderItems((err, items) => {
    //     if (err) {
    //         return console.log(err);
    //     }
    //     const itemsValues = items.map(item => `(${item.order_id}, ${item.product_id}, ${item.quantity}, ${item.price})`).join(', ');
    //     const stockUpdates = items.map(item => `UPDATE products SET stock = stock - ${item.quantity} WHERE id = ${item.product_id}`).join('; ');
    //     const sql = `INSERT INTO orders (user_id, total, status) VALUES (${userId}, ${total}, 'Pending'); 
    //         INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ${itemsValues}; 
    //         DELETE FROM cart_items WHERE user_id = ${userId};
    //         ${stockUpdates};`;

    //     db.any(sql)
    //         .then(result => {
    //             callback(null, result);
    //         })
    //         .catch(err => {
    //             callback(err);
    //         })
    // });
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
    getOrderDetails,
    subtractAProductFromCart,
    addAProductToCart,
    getOneFromCart,
    deleteOneFromCart,
    updateDataBaseTables,
}