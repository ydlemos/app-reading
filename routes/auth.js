const express = require('express');
const { registerUser, loginUser, authenticate, getUserXpAndLevel } = require('../services/authService'); // Import authService

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
        return res.status(400).json({ error: res.__('auth.missing_fields') });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: res.__('auth.invalid_email') });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: res.__('auth.weak_password') });
    }

    try {
        const user = await registerUser(email, password);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: res.__('auth.exists') });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
        return res.status(400).json({ error: res.__('auth.missing_fields') });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: res.__('auth.invalid_email') });
    }

    try {
        const token = await loginUser(email, password);
        res.json({ token });
    } catch (error) {
        res.status(401).json({ error: res.__('auth.invalid_creds') });
    }
});

// Get XP of the authenticated user
router.get('/xp', authenticate, async (req, res) => {
    try {
        const userStats = await getUserXpAndLevel(req.user.userId); // Renamed variable
        res.json(userStats);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
