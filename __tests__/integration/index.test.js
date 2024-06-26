const request = require('supertest');
const fs = require('node:fs');
const path = require('node:path');
const { db, pgp } = require('../../db/config');
const app = require('../../app');

describe.skip('Index API endpoints', () => {

    const userData = {
        "name": "Ricardo",
        "email": "ricardo@gmail.com",
        "password": "node1234"
    }

    const invalidUserData = {
        "name": "Ricardo",
        "email": "ricardo@gmail.com",
        "password": "node"
    }

    const userCredentials = {
        "email": "ricardo@gmail.com",
        "password": "node1234"
    }

    const invalidUserCredentials = {
        "email": "ricardo@gmail.com",
        "password": "node1"
    }

    const incorrectUserCredentials = {
        "email": "ricardo@gmail.com",
        "password": "node4321"
    }

    const authenticationFailedMessage = 'Authentication failed';
    const successfulLoginMessage = 'Successful login';
    const registerEndpoint = '/register';
    const loginEndpoint = '/login';
    const defaultUserId = 4;

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
        const resetSQL = fs.readFileSync(path.join(__dirname, '../scripts/reset/reset_users.sql')).toString();
        const seedSQL = fs.readFileSync(path.join(__dirname, '../scripts/seed/seed_users.sql')).toString();
    
        await db.none(resetSQL);
        await db.none(seedSQL);
    });
    
    afterAll(async () => {
        pgp.end();
    });

    describe('GET /index', () => {

        const endpoint = '/'

        it('Should get the index page', async () => {
            const response = await request(app).get(endpoint);
            expect(response.status).toBe(200);
        });
    });

    describe('POST /register', () => {

        it('Should respond with status 400 if a invalid user data is send', async () => {
            const response = await registerUser(invalidUserData, 400, registerEndpoint)
    
            expect(response.status).toBe(400);
        });
    
        it('Should register a new user in the database if a valid user data is send', async () => {
            const response = await registerUser(userData, 201, registerEndpoint);
    
            expect(response.status).toBe(201);
            expect(response.body.id).toEqual(defaultUserId);
            expect(response.body.name).toEqual(userData.name);
            expect(response.body.email).toEqual(userData.email);
        });
    });

    describe('POST /login', () => {

        it('Should respond with status 400 if an invalid user credentials are send', async () => {
            const response = await loginUser(invalidUserCredentials, 400, loginEndpoint);
    
            expect(response.status).toBe(400);
        });
    
        it('Should respond with status 401 if an incorrect user credentials are send', async () => {
            const response = await loginUser(incorrectUserCredentials, 401, loginEndpoint);
    
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(authenticationFailedMessage);
        });    
    
        it('Should respond with status 200 if the correct user credentials are send', async () => {
            const registerUserTest = await registerUser(userData, 201, registerEndpoint);
    
            expect(registerUserTest.status).toBe(201);
            expect(registerUserTest.body.id).toEqual(defaultUserId);
            expect(registerUserTest.body.name).toEqual(userData.name);
            expect(registerUserTest.body.email).toEqual(userData.email);
    
            const response = await loginUser(userCredentials, 200, loginEndpoint);
    
            expect(response.status).toBe(200);
            expect(response.body.message).toBe(successfulLoginMessage);
        });
    });
});