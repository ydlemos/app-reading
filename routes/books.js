const express = require('express');
const { authenticate } = require('./../services/authService'); // Import authenticate middleware

const {
    addBook,
    getAllBooks,
    getBookById,
    updateBook,
    deleteBook,
    updateBookCompletionStatus,
    adjustUserXpPoints,
} = require('../services/bookService');

const router = express.Router();

// Add a book
router.post('/', authenticate, async (req, res) => {
    const { title, author, category, totalPages, pagesRead, imageUrl } = req.body;
    
    if (!title || !author || !category || !totalPages || typeof totalPages !== 'number') {
        return res.status(400).json({ error: res.__('book.invalid_input') });
    }

    if (pagesRead !== undefined && (typeof pagesRead !== 'number' || pagesRead < 0 || pagesRead > totalPages)) {
        return res.status(400).json({ error: res.__('book.invalid_read') });
    }

    try {
        const userId = req.user.userId;
        const book = await addBook({ title, author, category, totalPages, pagesRead: pagesRead || 0, imageUrl }, userId);
        res.status(201).json(book);
    } catch (error) {
        res.status(400).json({ error: res.__('book.add_err') });
    }
});

// Get all books for the user
router.get('/', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId; // Retrieve the user ID from the authenticated request
        const books = await getAllBooks(userId); // Pass the user ID to the service
        res.json(books);
    } catch (error) {
        res.status(400).json({ error: res.__('book.fetch_err') });
    }
});

// Get a specific book by ID
router.get('/:id', authenticate, async (req, res) => { // Removed authenticate middleware
    const { id } = req.params;
    const book = await getBookById(id);
    if (!book) return res.status(404).json({ error: res.__('book.not_found') });
    res.json(book);
});

// Update a book
router.put('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { title, author, category, totalPages, pagesRead, isCompleted, imageUrl } = req.body;

    if (totalPages !== undefined && typeof totalPages !== 'number') {
        return res.status(400).json({ error: res.__('book.invalid_pages') });
    }
    if (pagesRead !== undefined && typeof pagesRead !== 'number') {
        return res.status(400).json({ error: res.__('book.invalid_read') });
    }
    if (isCompleted !== undefined && typeof isCompleted !== 'boolean') {
        return res.status(400).json({ error: res.__('book.invalid_status') });
    }
    if (pagesRead !== undefined && (typeof pagesRead !== 'number' || pagesRead < 0 || pagesRead > totalPages)) {
        return res.status(400).json({ error: res.__('book.invalid_read') });
    }

    try {
        const book = await updateBook(id, { title, author, category, totalPages, pagesRead, isCompleted, imageUrl });
        delete book.userId; // Remove userId from the response
        res.json(book);
    } catch (error) {
        res.status(400).json({ error: res.__('book.update_err') });
    }
});

// Delete a book
router.delete('/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    try {
        await deleteBook(id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: res.__('book.delete_err') });
    }
});

// Mark a book as completed
router.patch('/:id/complete', authenticate, async (req, res) => {
    const { id } = req.params;
    try {
        const book = await updateBookCompletionStatus(id, true); // Use the refactored method
        await adjustUserXpPoints(id, true); // Adjust XP points for completion
        res.json(book);
    } catch (error) {
        res.status(400).json({ error: res.__('book.complete_err') });
    }
});

module.exports = router;
