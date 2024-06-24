// const fs = require('node:fs');
// const path = require('node:path');
// const db = require('../../db/config');

// beforeEach(async () => {
//     const resetSQL = fs.readFileSync(path.join(__dirname, '../scripts/reset/reset_users.sql')).toString();
//     const seedSQL = fs.readFileSync(path.join(__dirname, '../scripts/reset/reset_users.sql')).toString();

//     await db.none(resetSQL);
//     await db.none(seedSQL);
// });

console.log(__dirname);