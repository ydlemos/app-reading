const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const SECRET_KEY = 'your_secret_key'; // Replace with your actual secret key

//Authenticated user middleware
async function authenticate(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Invalid token' });
        req.user = decoded;
        next();
    });
}

// Register a new user
async function registerUser(email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.user.create({
        data: { email, password: hashedPassword },
    });
}

// Login a user
async function loginUser(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
        return jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
    }
    throw new Error('Invalid credentials');
}

// Get XP and level of the authenticated user
async function getUserXpAndLevel(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { xpPoints: true },
    });
    if (!user) throw new Error('User not found');

    const { levels } = require('../config.json'); // Load levels configuration
    let level = "Inconnu";

    // Determine the user's level based on XP points
    for (const lvl of levels) {
        if (
            user.xpPoints >= lvl.minPoints &&
            (lvl.maxPoints === undefined || user.xpPoints <= lvl.maxPoints)
        ) {
            level = lvl.name;
            break;
        }
    }

    return { xpPoints: user.xpPoints, level };
}

module.exports = {
    registerUser,
    loginUser,
    authenticate,
    getUserXpAndLevel, // Updated export
};
