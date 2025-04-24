const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const badgeRoutes = require('./routes/badges');
const i18n  = require('i18n');

const app = express();

i18n.configure({
    locales: ['en', 'fr'],
    directory: __dirname + '/i18n/locales',
    defaultLocale: 'en',
    autoReload: true,
    syncFiles: true,
    queryParameter: 'lang',
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(i18n.init); // Initialisation de i18n
app.use((req, res, next) => {
    // Set the locale based on the request header or query parameter
    const locale = req.headers['accept-language'] || req.query.lang || 'en';
    i18n.setLocale(req, locale);
    next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/books', bookRoutes);
app.use('/badges', badgeRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
