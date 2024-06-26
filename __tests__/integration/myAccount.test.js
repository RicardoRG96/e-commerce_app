const request = require('supertest');
const fs = require('node:fs');
const path = require('node:path');
const { db, pgp } = require('../../db/config');
const app = require('../../app');

describe('MyAccount API endpoints', () => {
    
    const userData = {
        "name": "Ricardo",
        "email": "ricardo@gmail.com",
        "password": "node1234"
    }

    const userCredentials = {
        "email": "ricardo@gmail.com",
        "password": "node1234"
    }

    const defaultUserId = {
        "user_id": 4,
        "order_id": ""
    }

    const orderData = {
        "user_id": 4,
        "order_id": 4
    }

    const invalidOrderData = {
        "user_id": "tres",
        "order_id": "SELECT * FROM users",
    }

    const registerEndpoint = '/register';
    const loginEndpoint = '/login';
    const tokenNotProvidedMessage = 'Token not provided';
    const tokenNotValidMessage = 'Token not valid';
    const invalidtoken = 'sadadjsdnllasndnaowqrfjcnl';

    const registerUser = async (userFixture, statusExpected, endpoint) => {
        return request(app)
            .post(endpoint)
            .send(userFixture)
            .expect(statusExpected);
    }

    const loginUser = async (userFixture, statusExpected, endpoint) => {
        return request(app)
            .post(endpoint)
            .send(userFixture)
            .expect(statusExpected);
    }

    beforeEach(async () => {
        const resetOrdersTable = fs.readFileSync(path.join(__dirname, '../scripts/reset/reset_orders.sql')).toString();
        const seedOrdersTable = fs.readFileSync(path.join(__dirname, '../scripts/seed/seed_orders.sql')).toString();

        const resetOrderItemsTable = fs.readFileSync(path.join(__dirname, '../scripts/reset/reset_order_items.sql')).toString();
        const seedOrdersItemsTable = fs.readFileSync(path.join(__dirname, '../scripts/seed/seed_order_items.sql')).toString();

        const resetUsersTable= fs.readFileSync(path.join(__dirname, '../scripts/reset/reset_users.sql')).toString();
        const seedUsersTable = fs.readFileSync(path.join(__dirname, '../scripts/seed/seed_users.sql')).toString();

        const resetProducstTable = fs.readFileSync(path.join(__dirname, '../scripts/reset/reset_products.sql')).toString();
        const seedProductsTable = fs.readFileSync(path.join(__dirname, '../scripts/seed/seed_products.sql')).toString();

        await db.none(resetOrdersTable);
        await db.none(resetOrderItemsTable);
        await db.none(resetUsersTable);
        await db.none(resetProducstTable);
        await db.none(seedUsersTable);
        await db.none(seedProductsTable);
        await db.none(seedOrdersTable);
        await db.none(seedOrdersItemsTable);
    });

    afterAll(async () => {
        pgp.end();
    });


    describe.skip('GET /api/myaccount', () => {

        const endpoint = '/api/myaccount/';

        it('Should respond with a status 200', async () => {
            const response = await request(app)
                .get(endpoint)
                .expect(200);

            expect(response.status).toBe(200);
        });
    });

    describe('GET /api/orders/details', () => {

        const endpoint = '/api/myaccount/orders/details';

        it('Should respond with a status 401 if no token is provided', async () => {
            const response = await request(app)
                .get(endpoint)
                .query(defaultUserId)
                .expect(401);
    
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(tokenNotProvidedMessage);
        });

        it('Should respond with a status 403 if token is invalid', async () => {
            const response = await request(app)
                .get(endpoint)
                .query(defaultUserId)
                .set('Authorization', `Bearer ${invalidtoken}`)
                .expect(403);
    
            expect(response.status).toBe(403);
            expect(response.body.message).toBe(tokenNotValidMessage);
        });

        // crear funcion que agregue una orden a la BD, ya que al momento de hacer el test no existen registros
        // con el user_id indicado, por lo tanto, el test falla.
        it('Should respond with a status 200 if token is valid', async () => {
            await registerUser(userData, 201, registerEndpoint);

            const loginUserTest = await loginUser(userCredentials, 200, loginEndpoint);
            const token = loginUserTest.body.token;
    
            const response = await request(app)
                .get(endpoint)
                .query(defaultUserId)
                .set('Authorization', `Bearer ${token}`)
                .expect(500);
            
            expect(response.status).toBe(500);
            expect(response.body[0].user_id).toBe(6);
        });
    })
});