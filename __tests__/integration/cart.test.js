const request = require('supertest');
const fs = require('node:fs');
const path = require('node:path');
const { db, pgp } = require('../../db/config');
const app = require('../../app');

describe.skip('Cart API enpoints', () => {

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
        "user_id": 4
    }

    const invalidUserId = {
        "user_id": "SELECT * FROM users"
    }

    const cartData = {
        "user_id": 4,
        "product_id": 3,
        "quantity": 2
    }

    const invalidCartData = {
        "user_id": "cuatro",
        "product_id": "SELECT * FROM users",
        "quantity": 2
    }

    const dataToUpdateCartProductsQuantity = {
        "user_id": 4,
        "product_id": 3,
    }

    const invalidDataToUpdateCartProductsQuantity = {
        "user_id": "cuatro",
        "product_id": "SELECT * FROM users",
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

    const addToCart = async (cartData, token, statusExpected) => {
        return request(app)
            .post('/api/cart/add-to-cart')
            .send(cartData)
            .set('Authorization', `Bearer ${token}`)
            .expect(statusExpected);
    }

    beforeEach(async () => {
        const resetCartItemsTable = fs.readFileSync(path.join(__dirname, '../scripts/reset/reset_cart_items.sql')).toString();
        const seedCartItemsTable = fs.readFileSync(path.join(__dirname, '../scripts/seed/seed_cart_items.sql')).toString();
        const resetUsersTable = fs.readFileSync(path.join(__dirname, '../scripts/reset/reset_users.sql')).toString();
        const seedUsersTable = fs.readFileSync(path.join(__dirname, '../scripts/seed/seed_users.sql')).toString();

        await db.none(resetCartItemsTable);
        await db.none(resetUsersTable);
        await db.none(seedUsersTable);
        await db.none(seedCartItemsTable);
    });

    afterAll(async () => {
        pgp.end();
    });

    describe('GET /api/cart', () => {

        const endpoint = '/api/cart/';

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
    
        it('Should respond with a status 200 if token is valid', async () => {
            await registerUser(userData, 201, registerEndpoint);

            const loginUserTest = await loginUser(userCredentials, 200, loginEndpoint);
            const token = loginUserTest.body.token;
            await addToCart(cartData, token, 201);
    
            const response = await request(app)
                .get(endpoint)
                .query(defaultUserId)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
            
            expect(response.status).toBe(200);
            expect(response.body[0].user_id).toBe(defaultUserId.user_id);
        });
    
        it('Should respond with a status 400 if query parameter is invalid', async () => {
            await registerUser(userData, 201, registerEndpoint);

            const loginUserTest = await loginUser(userCredentials, 200, loginEndpoint);
            const token = loginUserTest.body.token;
    
            const response = await request(app)
                .get(endpoint)
                .query(invalidUserId)
                .set('Authorization', `Bearer ${token}`)
                .expect(400);
    
            expect(response.status).toBe(400);
        });
    })

    describe('POST /api/cart/add-to-cart', () => {

        const endpoint = '/api/cart/add-to-cart';

        it('Should respond with a status 401 if no token is provided', async () => {
            const response = await request(app)
                .post(endpoint)
                .send(cartData)
                .expect(401);
    
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(tokenNotProvidedMessage);
        }); 
    
        it('Should respond with a status 403 if token is invalid', async () => {
            const response = await request(app)
                .post(endpoint)
                .send(cartData)
                .set('Authorization', `Bearer ${invalidtoken}`)
                .expect(403);
    
            expect(response.status).toBe(403);
            expect(response.body.message).toBe(tokenNotValidMessage);
        });
    
        it('Should respond with a status 201 if token is valid', async () => {
            await registerUser(userData, 201, registerEndpoint);

            const loginUserTest = await loginUser(userCredentials, 200, loginEndpoint);
            const token = loginUserTest.body.token;
            const response = await addToCart(cartData, token, 201);
            // const response = await request(app)
            //     .post(endpoint)
            //     .send(cartData)
            //     .set('Authorization', `Bearer ${token}`)
            //     .expect(201);
            
            expect(response.status).toBe(201);
            expect(response.body.user_id).toBe(defaultUserId.user_id);
        });
    
        it('Should respond with a status 400 if cart data is invalid', async () => {
            await registerUser(userData, 201, registerEndpoint);

            const loginUserTest = await loginUser(userCredentials, 200, loginEndpoint);
            const token = loginUserTest.body.token;
    
            const response = await request(app)
                .post(endpoint)
                .send(invalidCartData)
                .set('Authorization', `Bearer ${token}`)
                .expect(400);
    
            expect(response.status).toBe(400);
        });
    });

    describe('PUT /api/cart/add-one-to-cart', () => {

        const endpoint = '/api/cart/add-one-to-cart';

        it('Should respond with a status 401 if no token is provided', async () => {
            const response = await request(app)
                .put(endpoint)
                .send(dataToUpdateCartProductsQuantity)
                .expect(401)

            expect(response.status).toBe(401);
            expect(response.body.message).toBe(tokenNotProvidedMessage);
        });

        it('Should respond with a status 403 if token is invalid', async () => {
            const response = await request(app)
                .put(endpoint)
                .send(dataToUpdateCartProductsQuantity)
                .set('Authorization', `Bearer ${invalidtoken}`)
                .expect(403);
    
            expect(response.status).toBe(403);
            expect(response.body.message).toBe(tokenNotValidMessage);
        });
        
        it('Should respond with a status 201 if token is valid', async () => {
            await registerUser(userData, 201, registerEndpoint);

            const loginUserTest = await loginUser(userCredentials, 200, loginEndpoint);
            const token = loginUserTest.body.token;
            await addToCart(cartData, token, 201);
    
            const response = await request(app)
                .put(endpoint)
                .send(dataToUpdateCartProductsQuantity)
                .set('Authorization', `Bearer ${token}`)
                .expect(201);
            
            expect(response.status).toBe(201);
            expect(response.body[0].user_id).toBe(defaultUserId.user_id);
        });

        it('Should respond with a status 400 if data to update the cart products quantity is invalid', async () => {
            await registerUser(userData, 201, registerEndpoint);

            const loginUserTest = await loginUser(userCredentials, 200, loginEndpoint);
            const token = loginUserTest.body.token;
    
            const response = await request(app)
                .put(endpoint)
                .send(invalidDataToUpdateCartProductsQuantity)
                .set('Authorization', `Bearer ${token}`)
                .expect(400);
    
            expect(response.status).toBe(400);
        });
    });
    
    describe('PUT /api/cart/subtract-one-from-cart', () => {

        const endpoint = '/api/cart/subtract-one-from-cart';

        it('Should respond with a status 401 if no token is provided', async () => {
            const response = await request(app)
                .put(endpoint)
                .send(dataToUpdateCartProductsQuantity)
                .expect(401);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe(tokenNotProvidedMessage);
        });

        it('Should respond with a status 403 if token is invalid', async () => {
            const response = await request(app)
                .put(endpoint)
                .send(dataToUpdateCartProductsQuantity)
                .set('Authorization', `Bearer ${invalidtoken}`)
                .expect(403);
    
            expect(response.status).toBe(403);
            expect(response.body.message).toBe(tokenNotValidMessage);
        });

        it('Should respond with a status 201 if token is valid', async () => {
            await registerUser(userData, 201, registerEndpoint);

            const loginUserTest = await loginUser(userCredentials, 200, loginEndpoint);
            const token = loginUserTest.body.token;
            await addToCart(cartData, token, 201);
    
            const response = await request(app)
                .put(endpoint)
                .send(dataToUpdateCartProductsQuantity)
                .set('Authorization', `Bearer ${token}`)
                .expect(201);
            
            expect(response.status).toBe(201);
            expect(response.body[0].user_id).toBe(defaultUserId.user_id);
        });

        it('Should respond with a status 400 if data to update the cart products quantity is invalid', async () => {
            await registerUser(userData, 201, registerEndpoint);

            const loginUserTest = await loginUser(userCredentials, 200, loginEndpoint);
            const token = loginUserTest.body.token;
    
            const response = await request(app)
                .put(endpoint)
                .send(invalidDataToUpdateCartProductsQuantity)
                .set('Authorization', `Bearer ${token}`)
                .expect(400);
    
            expect(response.status).toBe(400);
        });
    });

    describe('DELETE /api/cart/remove-product', () => {

        const endpoint = '/api/cart/remove-product';

        it('Should respond with a status 401 if no token is provided', async () => {
            const response = await request(app)
                .delete(endpoint)
                .send(dataToUpdateCartProductsQuantity)
                .expect(401);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe(tokenNotProvidedMessage);
        });
        
        it('Should respond with a status 403 if token is invalid', async () => {
            const response = await request(app)
                .delete(endpoint)
                .send(dataToUpdateCartProductsQuantity)
                .set('Authorization', `Bearer ${invalidtoken}`)
                .expect(403);
    
            expect(response.status).toBe(403);
            expect(response.body.message).toBe(tokenNotValidMessage);
        });

        it('Should respond with a status 204 if token is valid', async () => {
            await registerUser(userData, 201, registerEndpoint);

            const loginUserTest = await loginUser(userCredentials, 200, loginEndpoint);
            const token = loginUserTest.body.token;
            await addToCart(cartData, token, 201);
    
            const response = await request(app)
                .delete(endpoint)
                .send(dataToUpdateCartProductsQuantity)
                .set('Authorization', `Bearer ${token}`)
                .expect(204);
            
            expect(response.status).toBe(204);
        });

        it('Should respond with a status 400 if a invalid data is send', async () => {
            await registerUser(userData, 201, registerEndpoint);

            const loginUserTest = await loginUser(userCredentials, 200, loginEndpoint);
            const token = loginUserTest.body.token;
    
            const response = await request(app)
                .delete(endpoint)
                .send(invalidDataToUpdateCartProductsQuantity)
                .set('Authorization', `Bearer ${token}`)
                .expect(400);
    
            expect(response.status).toBe(400);
        });

        it('Should respond with a status 404 if data to be deleted does not exist', async () => {
            await registerUser(userData, 201, registerEndpoint);

            const loginUserTest = await loginUser(userCredentials, 200, loginEndpoint);
            const token = loginUserTest.body.token;

            const response = await request(app)
                .delete(endpoint)
                .send({ ...dataToUpdateCartProductsQuantity, "user_id": 6 })
                .set('Authorization', `Bearer ${token}`)
                .expect(404);

            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /api/cart/empty-the-cart', () => {

        const endpoint = '/api/cart/empty-the-cart';

        it('Should respond with a status 401 if no token is provided', async () => {
            const response = await request(app)
                .delete(endpoint)
                .send(dataToUpdateCartProductsQuantity)
                .expect(401);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe(tokenNotProvidedMessage);
        }); 
        
        it('Should respond with a status 403 if token is invalid', async () => {
            const response = await request(app)
                .delete(endpoint)
                .send(dataToUpdateCartProductsQuantity)
                .set('Authorization', `Bearer ${invalidtoken}`)
                .expect(403);
    
            expect(response.status).toBe(403);
            expect(response.body.message).toBe(tokenNotValidMessage);
        });

        it('Should respond with a status 204 if token is valid', async () => {
            await registerUser(userData, 201, registerEndpoint);

            const loginUserTest = await loginUser(userCredentials, 200, loginEndpoint);
            const token = loginUserTest.body.token;
            await addToCart(cartData, token, 201);
    
            const response = await request(app)
                .delete(endpoint)
                .send(dataToUpdateCartProductsQuantity)
                .set('Authorization', `Bearer ${token}`)
                .expect(204);
            
            expect(response.status).toBe(204);
        });

        it('Should respond with a status 400 if a invalid data is send', async () => {
            await registerUser(userData, 201, registerEndpoint);

            const loginUserTest = await loginUser(userCredentials, 200, loginEndpoint);
            const token = loginUserTest.body.token;
    
            const response = await request(app)
                .delete(endpoint)
                .send(invalidDataToUpdateCartProductsQuantity)
                .set('Authorization', `Bearer ${token}`)
                .expect(400);
    
            expect(response.status).toBe(400);
        });

        it('Should respond with a status 404 if data to be deleted does not exist', async () => {
            await registerUser(userData, 201, registerEndpoint);

            const loginUserTest = await loginUser(userCredentials, 200, loginEndpoint);
            const token = loginUserTest.body.token;

            const response = await request(app)
                .delete(endpoint)
                .send({ ...dataToUpdateCartProductsQuantity, "user_id": 6 })
                .set('Authorization', `Bearer ${token}`)
                .expect(404);

            expect(response.status).toBe(404);
        });
    });
});