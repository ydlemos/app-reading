const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const config = require('../config.json');

// Adds a new book to the database and associates it with a user
const addBook = async (data, userId) => {
    return prisma.book.create({
        data: { 
            ...data,
            user: {
                connect: { id: userId }, // Connect to an existing user
            },
        },
    });
};

// Retrieves all books for a specific user, excluding the userId field
const getAllBooks = async (userId) => {
    return prisma.book.findMany({
        where: { userId },
        select: {
            id: true,
            title: true,
            author: true,
            category: true,
            totalPages: true,
            pagesRead: true,
            isCompleted: true,
            imageUrl: true,
        },
    });
};

// Retrieves a specific book by its ID and userId, including detailed fields
const getBookById = async (id, userId) => {
    return prisma.book.findUnique({
        where: { id: parseInt(id), userId },
        select: {
            id: true,
            title: true,
            author: true,
            category: true,
            totalPages: true,
            pagesRead: true,
            isCompleted: true,
            imageUrl: true,
            userId: false,
        },
    });
};

// Updates a book's details and adjusts user XP points if the book's completion status changes
const updateBook = async (id, data) => {
    const book = await prisma.book.findUnique({ where: { id: parseInt(id) } });

    if (!book) {
        throw new Error('Book not found');
    }

    // Update the book with the new data
    const updatedBook = await prisma.book.update({
        where: { id: parseInt(id) },
        data: {
            ...data
        },
    });
    
    const wasCompleted = book.pagesRead === book.totalPages; // Check if the book was completed before the update
    const willBeCompleted = data.totalPages === data.pagesRead; // Check if the book is completed

    if (wasCompleted && !willBeCompleted) {
        adjustUserXpPoints(id, false); // Adjust XP points for uncompletion
    } else if (!wasCompleted && willBeCompleted) {
        adjustUserXpPoints(id, true); // Adjust XP points for completion
    }

     // Update completion status if necessary
    await updateBookCompletionStatus(id, willBeCompleted);

    return updatedBook;
};

// Deletes a book from the database by its ID
const deleteBook = async (id) => {
    await adjustUserXpPoints(id, false); // Adjust XP points for deletion
    return await prisma.book.delete({ where: { id: parseInt(id) } });
};

// Adjusts the XP points of a user based on the completion status of a book
const adjustUserXpPoints = async (id, isCompleted) => {
    const book = await prisma.book.findUnique({ where: { id: parseInt(id) } });
    const points = calculateXpPoints(book.totalPages);

    return await prisma.user.update({
        where: { id: book.userId },
        data: { xpPoints: isCompleted ? { increment: points } : { decrement: points } }, // Adjust XP points
    });
};

// Calculates XP points based on the number of pages read
const calculateXpPoints = (pagesRead) => {
    const { points } = config;
    for (const key in points) {
        const { minPagesRead, maxPagesRead, points: xp } = points[key];
        if (pagesRead >= minPagesRead && (maxPagesRead === undefined || pagesRead <= maxPagesRead)) {
            return xp;
        }
    }
    return 0;
};

// Sets the completion status of a book and adjusts user XP points accordingly
const updateBookCompletionStatus = async (id, isCompleted) => {
    const book = await prisma.book.findUnique({ where: { id: parseInt(id) } });

    if (!book) {
        throw new Error('Book not found');
    }

    const updatedBook = await prisma.book.update({
        where: { id: parseInt(id) },
        data: {
            isCompleted: isCompleted,
            completeDate: isCompleted ? new Date() : null,
            pagesRead: isCompleted ? book.totalPages : book.pagesRead, // Adjust pagesRead if completed
        },
    });

    return updatedBook;
};

module.exports = {
    addBook,
    getAllBooks,
    getBookById,
    updateBook,
    deleteBook,
    adjustUserXpPoints,
    updateBookCompletionStatus, 
};
