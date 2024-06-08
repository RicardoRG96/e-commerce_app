const db = require('./config');

function requestOne(table, id, callback) {
    const sql = `SELECT * FROM ${table} WHERE id = ${id}`;

    db.any(sql)
        .then(([result]) => {
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

module.exports = {
    requestOne,
    insertItem,
    getUserCredentials,
    findItem,
    requestAll,
    filterItem
}