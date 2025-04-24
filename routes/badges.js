const express = require('express');
const { authenticate } = require('../services/authService');
const { getBadges } = require('../services/badgeService');

const router = express.Router();

// Get badges for the authenticated user
router.get('/', authenticate, async (req, res) => {
    try {
        const badges = await getBadges(req.user.userId);
        res.json({ badges });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
