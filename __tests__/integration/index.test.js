const request = require('supertest');
const fs = require('node:fs');
const path = require('node:path');
const { db, pgp } = require('../../db/config');
const app = require('../../app');

describe.skip('Verify that the index route endpoints work correctly', () => {

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

    const defaultUserId = 4;

    const registerUser = async (userFixture, statusExpected) => {
        return request(app)
            .post('/register')
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

    it('GET /index should get the index page', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
    });

    it('POST /register with invalid user data should respond with status 400', async () => {
        const response = await registerUser(invalidUserData, 400)

        expect(response.status).toBe(400);
    });

    it('POST /register with valid user data should register a new user in the database', async () => {
        const response = await registerUser(userData, 201);

        expect(response.status).toBe(201);
        expect(response.body.id).toEqual(defaultUserId);
        expect(response.body.name).toEqual(userData.name);
        expect(response.body.email).toEqual(userData.email);
    });

    it('POST /login with invalid user credentials should respond with status 400', async () => {
        const response = await request(app)
            .post('/login')
            .send(invalidUserCredentials)
            .expect(400);

            expect(response.status).toBe(400);
    });

    it('POST /login with incorrect user credentials should respond with status 401', async () => {
        const response = await request(app)
            .post('/login')
            .send(incorrectUserCredentials) 
            .expect(401);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Authentication failed');
    });    

    it('POST /login with the right user credentials should respond with status 200', async () => {
        const registerUserTest = await registerUser(userData, 201)

        expect(registerUserTest.status).toBe(201);
        expect(registerUserTest.body.id).toEqual(defaultUserId);
        expect(registerUserTest.body.name).toEqual(userData.name);
        expect(registerUserTest.body.email).toEqual(userData.email);

        const response = await request(app)
            .post('/login')
            .send(userCredentials)
            .expect(200);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Successful login');
    })
});