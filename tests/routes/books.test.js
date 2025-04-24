const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const app = require('../../app'); // Adjust the path to your app.js file
const prisma = new PrismaClient();

beforeAll(async () => {
    // Set up test data if necessary
    await prisma.book.deleteMany(); // Clear books table
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe('Books Routes', () => {
    test('POST /books - Add a book', async () => {
        const response = await request(app)
            .post('/books')
            .send({
                title: 'Test Book',
                author: 'Test Author',
                category: 'Fiction',
                totalPages: 300,
            });
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe('Test Book');
    });

    test('GET /books - Get all books', async () => {
        const response = await request(app).get('/books');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET /books/:id - Get a specific book by ID', async () => {
        const book = await prisma.book.create({
            data: {
                title: 'Specific Book',
                author: 'Author',
                category: 'Non-Fiction',
                totalPages: 200,
            },
        });
        const response = await request(app).get(`/books/${book.id}`);
        expect(response.status).toBe(200);
        expect(response.body.title).toBe('Specific Book');
    });

    test('PUT /books/:id - Update a book', async () => {
        const book = await prisma.book.create({
            data: {
                title: 'Old Title',
                author: 'Author',
                category: 'Fiction',
                totalPages: 150,
            },
        });
        const response = await request(app)
            .put(`/books/${book.id}`)
            .send({ title: 'Updated Title' });
        expect(response.status).toBe(200);
        expect(response.body.title).toBe('Updated Title');
    });

    test('DELETE /books/:id - Delete a book', async () => {
        const book = await prisma.book.create({
            data: {
                title: 'To Be Deleted',
                author: 'Author',
                category: 'Fiction',
                totalPages: 100,
            },
        });
        const response = await request(app).delete(`/books/${book.id}`);
        expect(response.status).toBe(204);
    });

    test('PATCH /books/:id/complete - Mark a book as completed', async () => {
        const book = await prisma.book.create({
            data: {
                title: 'Incomplete Book',
                author: 'Author',
                category: 'Fiction',
                totalPages: 250,
                isCompleted: false,
            },
        });
        const response = await request(app).patch(`/books/${book.id}/complete`);
        expect(response.status).toBe(200);
        expect(response.body.isCompleted).toBe(true);
    });
});
