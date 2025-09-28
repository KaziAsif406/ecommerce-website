const mongoose = require('mongoose');
const Book = require('../models/Book');
const User = require('../models/User');
require('dotenv').config();

const sampleBooks = [
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "9780743273565",
    description: "A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream through the eyes of Nick Carraway and his mysterious neighbor Jay Gatsby.",
    price: 12.99,
    originalPrice: 15.99,
    category: "fiction",
    genre: ["classic", "literature", "american"],
    rating: { average: 4.5, count: 1250 },
    images: [
      { url: "https://images.example.com/great-gatsby.jpg", alt: "The Great Gatsby Cover", isPrimary: true }
    ],
    stock: 50,
    isNew: false,
    isBestseller: true,
    isDiscounted: true,
    publicationDate: new Date("1925-04-10"),
    publisher: "Scribner",
    language: "English",
    pages: 180,
    tags: ["classic", "jazz age", "american dream", "wealth", "love"]
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "9780061120084",
    description: "A gripping tale of racial injustice and childhood innocence in the American South, told through the eyes of Scout Finch as her father defends a black man falsely accused of rape.",
    price: 14.99,
    originalPrice: 14.99,
    category: "fiction",
    genre: ["classic", "literature", "southern"],
    rating: { average: 4.8, count: 2100 },
    images: [
      { url: "https://images.example.com/mockingbird.jpg", alt: "To Kill a Mockingbird Cover", isPrimary: true }
    ],
    stock: 75,
    isNew: false,
    isBestseller: true,
    isDiscounted: false,
    publicationDate: new Date("1960-07-11"),
    publisher: "J.B. Lippincott & Co.",
    language: "English",
    pages: 281,
    tags: ["classic", "racial justice", "childhood", "southern", "courtroom drama"]
  },
  {
    title: "1984",
    author: "George Orwell",
    isbn: "9780451524935",
    description: "A dystopian social science fiction novel about totalitarian control and surveillance, following Winston Smith as he rebels against the oppressive Party in a world where independent thinking is a crime.",
    price: 13.99,
    originalPrice: 13.99,
    category: "fiction",
    genre: ["dystopian", "science fiction", "political"],
    rating: { average: 4.7, count: 1800 },
    images: [
      { url: "https://images.example.com/1984.jpg", alt: "1984 Cover", isPrimary: true }
    ],
    stock: 60,
    isNew: false,
    isBestseller: true,
    isDiscounted: false,
    publicationDate: new Date("1949-06-08"),
    publisher: "Secker & Warburg",
    language: "English",
    pages: 328,
    tags: ["dystopian", "totalitarianism", "surveillance", "rebellion", "thought control"]
  },
  {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    isbn: "9780062316097",
    description: "A fascinating exploration of how Homo sapiens came to dominate the world, examining the cognitive, agricultural, and scientific revolutions that shaped human civilization.",
    price: 18.99,
    originalPrice: 18.99,
    category: "non-fiction",
    genre: ["history", "anthropology", "science"],
    rating: { average: 4.6, count: 3200 },
    images: [
      { url: "https://images.example.com/sapiens.jpg", alt: "Sapiens Cover", isPrimary: true }
    ],
    stock: 40,
    isNew: false,
    isBestseller: false,
    isDiscounted: false,
    publicationDate: new Date("2011-01-01"),
    publisher: "Harper",
    language: "English",
    pages: 443,
    tags: ["human history", "evolution", "civilization", "anthropology", "science"]
  },
  {
    title: "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones",
    author: "James Clear",
    isbn: "9780735211292",
    description: "A comprehensive guide to building good habits and breaking bad ones, offering practical strategies for creating lasting change through small, incremental improvements.",
    price: 16.99,
    originalPrice: 16.99,
    category: "non-fiction",
    genre: ["self-help", "productivity", "psychology"],
    rating: { average: 4.9, count: 4500 },
    images: [
      { url: "https://images.example.com/atomic-habits.jpg", alt: "Atomic Habits Cover", isPrimary: true }
    ],
    stock: 80,
    isNew: false,
    isBestseller: true,
    isDiscounted: false,
    publicationDate: new Date("2018-10-16"),
    publisher: "Avery",
    language: "English",
    pages: 320,
    tags: ["habits", "productivity", "self-improvement", "behavior", "success"]
  },
  {
    title: "The Psychology of Money: Timeless Lessons on Wealth, Greed, and Happiness",
    author: "Morgan Housel",
    isbn: "9780857197689",
    description: "A collection of short stories exploring the strange ways people think about money and teaches you how to make better sense of one of life's most important topics.",
    price: 15.99,
    originalPrice: 15.99,
    category: "non-fiction",
    genre: ["finance", "psychology", "economics"],
    rating: { average: 4.5, count: 2800 },
    images: [
      { url: "https://images.example.com/psychology-money.jpg", alt: "Psychology of Money Cover", isPrimary: true }
    ],
    stock: 35,
    isNew: true,
    isBestseller: false,
    isDiscounted: false,
    publicationDate: new Date("2020-09-08"),
    publisher: "Harriman House",
    language: "English",
    pages: 256,
    tags: ["money", "psychology", "wealth", "investing", "behavioral finance"]
  },
  {
    title: "Calculus Made Easy",
    author: "Silvanus P. Thompson",
    isbn: "9780312185480",
    description: "A classic introduction to calculus that makes the subject accessible to everyone, with clear explanations and practical examples that demystify mathematical concepts.",
    price: 24.99,
    originalPrice: 24.99,
    category: "academic",
    genre: ["mathematics", "education", "textbook"],
    rating: { average: 4.3, count: 1200 },
    images: [
      { url: "https://images.example.com/calculus.jpg", alt: "Calculus Made Easy Cover", isPrimary: true }
    ],
    stock: 25,
    isNew: false,
    isBestseller: false,
    isDiscounted: false,
    publicationDate: new Date("1910-01-01"),
    publisher: "St. Martin's Press",
    language: "English",
    pages: 336,
    tags: ["calculus", "mathematics", "education", "textbook", "learning"]
  },
  {
    title: "Spider-Man: Into the Spider-Verse - The Art of the Movie",
    author: "Ramin Zahed",
    isbn: "9781785659469",
    description: "The official art book for the Academy Award-winning animated film, featuring concept art, character designs, and behind-the-scenes insights into the making of Spider-Man: Into the Spider-Verse.",
    price: 19.99,
    originalPrice: 24.99,
    category: "comics",
    genre: ["art", "animation", "superhero", "movie"],
    rating: { average: 4.8, count: 800 },
    images: [
      { url: "https://images.example.com/spiderverse.jpg", alt: "Spider-Verse Art Book Cover", isPrimary: true }
    ],
    stock: 30,
    isNew: false,
    isBestseller: false,
    isDiscounted: true,
    publicationDate: new Date("2018-12-11"),
    publisher: "Titan Books",
    language: "English",
    pages: 192,
    tags: ["spider-man", "animation", "art", "movie", "superhero"]
  },
  {
    title: "Harry Potter and the Philosopher's Stone",
    author: "J.K. Rowling",
    isbn: "9780747532699",
    description: "The first book in the magical Harry Potter series, following young Harry as he discovers he's a wizard and begins his education at Hogwarts School of Witchcraft and Wizardry.",
    price: 11.99,
    originalPrice: 11.99,
    category: "children",
    genre: ["fantasy", "magic", "adventure", "children"],
    rating: { average: 4.9, count: 5600 },
    images: [
      { url: "https://images.example.com/harry-potter.jpg", alt: "Harry Potter Cover", isPrimary: true }
    ],
    stock: 100,
    isNew: false,
    isBestseller: true,
    isDiscounted: false,
    publicationDate: new Date("1997-06-26"),
    publisher: "Bloomsbury",
    language: "English",
    pages: 223,
    tags: ["harry potter", "magic", "wizard", "hogwarts", "fantasy", "children"]
  },
  {
    title: "The Midnight Library",
    author: "Matt Haig",
    isbn: "9780525559474",
    description: "A novel about life, death, and the choices we make, following Nora Seed as she finds herself in a library between life and death where she can try out different versions of her life.",
    price: 17.99,
    originalPrice: 17.99,
    category: "fiction",
    genre: ["contemporary", "philosophical", "life"],
    rating: { average: 4.4, count: 1900 },
    images: [
      { url: "https://images.example.com/midnight-library.jpg", alt: "The Midnight Library Cover", isPrimary: true }
    ],
    stock: 45,
    isNew: true,
    isBestseller: false,
    isDiscounted: false,
    publicationDate: new Date("2020-08-13"),
    publisher: "Viking",
    language: "English",
    pages: 304,
    tags: ["life choices", "regret", "second chances", "philosophy", "contemporary fiction"]
  }
];

const sampleUsers = [
  {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    role: "user",
    address: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA"
    },
    phone: "+1-555-0123",
    isEmailVerified: true
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "password123",
    role: "user",
    address: {
      street: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210",
      country: "USA"
    },
    phone: "+1-555-0456",
    isEmailVerified: true
  },
  {
    name: "Admin User",
    email: "admin@mybookstore.com",
    password: "admin123",
    role: "admin",
    address: {
      street: "789 Admin Blvd",
      city: "San Francisco",
      state: "CA",
      zipCode: "94102",
      country: "USA"
    },
    phone: "+1-555-0789",
    isEmailVerified: true
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mybookstore', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await Book.deleteMany({});
    await User.deleteMany({});

    console.log('Cleared existing data');

    // Insert sample books
    const books = await Book.insertMany(sampleBooks);
    console.log(`Inserted ${books.length} books`);

    // Insert sample users
    const users = await User.insertMany(sampleUsers);
    console.log(`Inserted ${users.length} users`);

    console.log('Database seeded successfully!');
    console.log('\nSample accounts created:');
    console.log('User: john@example.com / password123');
    console.log('User: jane@example.com / password123');
    console.log('Admin: admin@mybookstore.com / admin123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeder
if (require.main === module) {
  seedDatabase();
}

module.exports = { sampleBooks, sampleUsers, seedDatabase };
