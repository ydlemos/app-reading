const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const app = require('../../app'); // Adjust the path to your app.js file
const prisma = new PrismaClient();

beforeAll(async () => {
    // Set up test data if necessary
    await prisma.user.deleteMany(); // Clear users table
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe('Auth Routes', () => {
    test('POST /auth/register - Register a user', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({ email: 'test@example.com', password: 'password123' });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.email).toBe('test@example.com');
    });

    test('POST /auth/login - Login a user', async () => {
        await prisma.user.create({
            data: {
                email: 'login@example.com',
                password: await require('bcrypt').hash('password123', 10),
            },
        });
        const response = await request(app)
            .post('/auth/login')
            .send({ email: 'login@example.com', password: 'password123' });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
    });

    test('POST /auth/login - Invalid credentials', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({ email: 'invalid@example.com', password: 'wrongpassword' });
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error');
    });
});
