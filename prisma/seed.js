const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
   
    const books = [
        {
            title: "La Nuit des temps",
            author: "René Barjavel",
            category: "Science-fiction",
            totalPages: 328,
            pagesRead: 0,
            isCompleted: false,
            imageUrl: "https://media.senscritique.com/media/000016623783/300/la_nuit_des_temps.jpg",
        },
        {
            title: "De bons présages",
            author: "Neil Gaiman et Terry Pratchett",
            category: "Fantasy",
            totalPages: 281,
            pagesRead: 0,
            isCompleted: false,
            imageUrl: "https://media.senscritique.com/media/000019513009/300/de_bons_presages.jpg",
        },
        {
            title: "The Great Gatsby",
            author: "F. Scott Fitzgerald",
            category: "Roman",
            totalPages: 180,
            pagesRead: 0,
            isCompleted: false,
            imageUrl: "https://m.media-amazon.com/images/I/81af+MCATTL.jpg",
        },
        {
            title: "Le Dernier des aînés",
            author: "Adrian Tchaikovsky",
            category: "Nouvelle",
            totalPages: 200,
            pagesRead: 0,
            isCompleted: false,
            imageUrl: "https://media.senscritique.com/media/000021444742/300/le_dernier_des_aines.jpg",
        },
        {
            title: "Le Nom de la rose",
            author: "Umberto Eco",
            category: "Roman",
            totalPages: 279,
            pagesRead: 0,
            isCompleted: false,
            imageUrl: "https://media.senscritique.com/media/000000064013/300/le_nom_de_la_rose.gif",
        },
        {
            title: "L'Homme qui savait la langue des serpents",
            author: "Andrus Kivirähk",
            category: "Roman",
            totalPages: 689,
            pagesRead: 0,
            isCompleted: false,
            imageUrl: "https://media.senscritique.com/media/000004398138/300/l_homme_qui_savait_la_langue_des_serpents.jpg",
        },
        {
            title: "Le Déchronologue",
            author: "Stéphane Beauverger",
            category: "Roman",
            totalPages: 455,
            pagesRead: 0,
            isCompleted: false,
            imageUrl: "https://media.senscritique.com/media/000004149052/300/le_dechronologue.jpg",
        },
        {
            title: "Samarcande",
            author: "Amin Maalouf",
            category: "Roman",
            totalPages: 250,
            pagesRead: 0,
            isCompleted: false,
            imageUrl: "https://media.senscritique.com/media/000006040222/300/samarcande.jpg",
        },
        {
            title: "L'Île au trésor",
            author: "Robert Louis Stevenson",
            category: "Roman",
            totalPages: 354,
            pagesRead: 0,
            isCompleted: false,
            imageUrl: "https://media.senscritique.com/media/000021704109/300/l_ile_au_tresor.jpg",
        },
        {
            title: "Le Goût de l'immortalité",
            author: "Catherine Dufour",
            category: "Science-fiction",
            totalPages: 354,
            pagesRead: 0,
            isCompleted: false,
            imageUrl: "https://media.senscritique.com/media/000000120122/300/le_gout_de_l_immortalite.jpg",
        },
        {
            title: "Le Comte de Monte-Cristo",
            author: "Alexandre Dumas",
            category: "Roman",
            totalPages: 1244,
            pagesRead: 0,
            isCompleted: false,
            imageUrl: "https://media.senscritique.com/media/000021955557/300/le_comte_de_monte_cristo.jpg",
        },
        {
            title: "Metro 2033",
            author: "Dmitry Glukhovsky",
            category: "Roman",
            totalPages: 541,
            pagesRead: 0,
            isCompleted: false,
            imageUrl: "https://media.senscritique.com/media/000000141654/300/metro_2033.jpg",
        },
        {
            title: "Le Parfum",
            author: "Patrick Süskind",
            category: "Roman",
            totalPages: 645,
            pagesRead: 0,
            isCompleted: false,
            imageUrl: "https://media.senscritique.com/media/000004570898/300/le_parfum.jpg",
        },
        {
            title: "La Métamorphose",
            author: "Franz Kafka",
            category: "Nouvelle",
            totalPages: 123,
            pagesRead: 0,
            isCompleted: false,
            imageUrl: "https://media.senscritique.com/media/000007433233/300/la_metamorphose.jpg",
        },
        {
            title: "Les androïdes rêvent-ils de moutons électriques ?",
            author: "Philip K. Dick",
            category: "Science-fiction",
            totalPages: 365,
            pagesRead: 0,
            isCompleted: false,
            imageUrl: "https://media.senscritique.com/media/000020083854/300/les_androides_revent_ils_de_moutons_electriques.jpg",
        },
    ];
    // Create a user
    const hashedPassword = await bcrypt.hash("hashed_password", 10); // Replace "hashed_password" with the actual password to hash

    const user = await prisma.user.create({
        data: {
            email: "user@example.com",
            password: hashedPassword,
        },
    });

    for (const book of books) {
        await prisma.book.create({
            data: {
                ...book,
                user: {
                    connect: { id: user.id }, // Use the created user's ID
                },
            },
        });
    }

    console.log("Seed data inserted successfully.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
