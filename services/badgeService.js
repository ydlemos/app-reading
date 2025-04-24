const { PrismaClient } = require('@prisma/client');
const config = require('../config.json');

const prisma = new PrismaClient();

const getBadges = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { books: true },
    });

    if (!user) throw new Error('User not found');

    const completedBooks = user.books.filter((book) => book.isCompleted);
    const badges = [];

    //get quantity of books read
    config.badges.quantity.forEach((badge) => {
        if (parseInt(badge.quantity, 10) <= completedBooks.length) {
            badges.push(badge);
        }
    });

    // Genre badges
    const distinctCategoryCount = await countDistinctByKey(completedBooks, 'category');
    config.badges.genres.forEach((badge) => {
        if (distinctCategoryCount >= badge.quantity) {
            badges.push(badge);
        }
    });

    // Specific badges
    // Check if at least 5 books were completed within a two-week period    
    const specificBadges = config.badges.specific;

    const booksInTwoWeeks = filterBooksByTimePeriod(completedBooks, 14);
    if (booksInTwoWeeks.length >= 5) {
        badges.push(specificBadges.find((badge) => badge.id === '1'));
    }

    // Get completed books with more than 300 pages
    if (completedBooks.some((book) => book.totalPages > 300)) {
        badges.push(specificBadges.find((badge) => badge.id === '2'));
    }

    // Check if at least 10 books were completed within a one-month period
    const booksInOneMonth = filterBooksByTimePeriod(completedBooks, 30);
    if (booksInOneMonth.length >= 10) {
        badges.push(specificBadges.find((badge) => badge.id === '3'));
    }

    // Check if at least 30 books were completed within a one-year period
    const booksInOneYear = filterBooksByTimePeriod(completedBooks, 365);
    if (booksInOneYear.length >= 30) {
        badges.push(specificBadges.find((badge) => badge.id === '4'));
    }

    return badges;
};

const countDistinctByKey = async(arr, key) => {
    if (!Array.isArray(arr) || typeof key !== 'string') return 0;
    const uniqueValues = new Set();
    for (const obj of arr) {
      if (obj && obj.hasOwnProperty(key)) {
        uniqueValues.add(obj[key]);
      }
    }
    return uniqueValues.size;
}

const filterBooksByTimePeriod = (books, days) => {
    return books.filter((book) => {
        if (!book.completeDate) return false;
        const completedDate = new Date(book.completeDate);
        const timeDifference = Math.abs(new Date() - completedDate);
        const daysDifference = timeDifference / (1000 * 60 * 60 * 24);
        return daysDifference <= days;
    });
};

module.exports = {
    getBadges,
};
