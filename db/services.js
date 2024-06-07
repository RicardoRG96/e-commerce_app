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

module.exports = {
    requestOne,
    insertItem,
    getUserCredentials
}