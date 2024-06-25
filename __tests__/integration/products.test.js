const request = require('supertest');
const fs = require('node:fs');
const path = require('node:path');
const { db, pgp } = require('../../db/config');
const app = require('../../app');

describe.skip('Verify that the products route endpoints work correctly', () => {

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
        "name": ""
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
        expect(response.body[0].name).toBe(correctProductName.name);
    });

    it('GET /api/products/search with an empty query parameter should respond with a status 400', async () => {
        const response = await request(app)
            .get('/api/products/search')
            .query(emptyProductName)
            .expect(400);

        expect(response.status).toBe(400);
    });

    it('GET /api/products/search with an ambiguos but similiar query parameter should respond with a status 200', async () => {
        const response = await request(app)
            .get('/api/products/search')
            .query(ambiguousProductName)
            .expect(200);

        expect(response.status).toBe(200);
        expect(response.body[0].name).toBe(correctProductName.name)
    });

    it('GET /api/products/search with a bad product name in the query parameter should respond with a status 404', async () => {
        const response = await request(app)
            .get('/api/products/search')
            .query(badProductName)
            .expect(404);

        expect(response.status).toBe(404);
    });
});