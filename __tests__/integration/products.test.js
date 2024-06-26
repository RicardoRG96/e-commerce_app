const request = require('supertest');
const fs = require('node:fs');
const path = require('node:path');
const { db, pgp } = require('../../db/config');
const app = require('../../app');

describe.skip('Product API endpoints', () => {

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
    
    describe('GET /api/products', () => {

        const endpoint = '/api/products';

        it('Should get all products', async () => {
            const response = await request(app).get(endpoint);
            
            expect(response.status).toBe(200);
            expect(response.body[0].name).toBe(correctProductName.name);
        });
    })

    describe('GET /api/products/search', () => {

        const endpoint = '/api/products/search';

        it('Should respond with a status 400 if an empty query parameter is send', async () => {
            const response = await request(app)
                .get(endpoint)
                .query(emptyProductName)
                .expect(400);
    
            expect(response.status).toBe(400);
        });
    
        it('Should respond with a status 200 if an ambiguos but similiar query parameter is send', async () => {
            const response = await request(app)
                .get(endpoint)
                .query(ambiguousProductName)
                .expect(200);
    
            expect(response.status).toBe(200);
            expect(response.body[0].name).toBe(correctProductName.name)
        });
    
        it('Should respond with a status 404 if a bad product name is send in the query parameter ', async () => {
            const response = await request(app)
                .get(endpoint)
                .query(badProductName)
                .expect(404);
    
            expect(response.status).toBe(404);
        });
    });
});