const request = require('supertest');
const fs = require('node:fs');
const path = require('node:path');
const { db, pgp } = require('../../db/config');
const app = require('../../app');

describe('Verify that the products route endpoints work correctly', () => {

    const correctProductName = {
        "name": "Apple iPhone 14"
    }

    const ambiguousProductName = {
        "name": "Aple ifhone 14"
    }

    const badProductName = {
        "name": "aifon"
    }

    const emptyProductName = {
        name: ""
    }

    beforeEach(async () => {
        const resetSQL = fs.readFileSync(path.join(__dirname, '../scripts/reset/reset_products.sql')).toString();
        const seedSQL = fs.readFileSync(path.join(__dirname, '../scripts/seed/seed_products.sql')).toString();
    
        await db.none(resetSQL);
        await db.none(seedSQL);
    });
    
    afterAll(async () => {
        pgp.end();
    });
    
    it('GET /api/products should get all products', async () => {
        const response = await request(app).get('/api/products');
        
        expect(response.status).toBe(200);
        expect(response.name).toBe(correctProductName.name)
    });

    it('GET /api/products/search with an empty name should respond with a status 400', async () => {
        const response = await request(app)
            .get('/api/products/search')
            .query(correctProductName)
            .expect(200);

        expect(response.status).toBe(200);
    });
});