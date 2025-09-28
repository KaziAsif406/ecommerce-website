const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Book = require('../models/Book');
const { auth, adminAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/books
// @desc    Get all books with filtering, sorting, and pagination
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().isIn(['fiction', 'non-fiction', 'academic', 'comics', 'children', 'biography', 'history', 'science', 'technology']),
  query('sort').optional().isIn(['title', 'author', 'price', 'rating', 'newest', 'oldest']),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be non-negative'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be non-negative')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 12,
      category,
      sort = 'newest',
      minPrice,
      maxPrice,
      search,
      isNew,
      isBestseller,
      isDiscounted
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (isNew === 'true') filter.isNew = true;
    if (isBestseller === 'true') filter.isBestseller = true;
    if (isDiscounted === 'true') filter.isDiscounted = true;

    // Search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'title':
        sortObj = { title: 1 };
        break;
      case 'author':
        sortObj = { author: 1 };
        break;
      case 'price':
        sortObj = { price: 1 };
        break;
      case 'rating':
        sortObj = { 'rating.average': -1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'newest':
      default:
        sortObj = { createdAt: -1 };
        break;
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const books = await Book.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-seoTitle -seoDescription -seoKeywords');

    const total = await Book.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      books,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalBooks: total,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ message: 'Server error while fetching books' });
  }
});

// @route   GET /api/books/:id
// @desc    Get single book by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).select('-seoTitle -seoDescription -seoKeywords');
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (!book.isActive) {
      return res.status(404).json({ message: 'Book not available' });
    }

    res.json({ book });
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({ message: 'Server error while fetching book' });
  }
});

// @route   POST /api/books
// @desc    Create new book
// @access  Private (Admin only)
router.post('/', adminAuth, [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('author').trim().isLength({ min: 1, max: 100 }).withMessage('Author is required and must be less than 100 characters'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('category').isIn(['fiction', 'non-fiction', 'academic', 'comics', 'children', 'biography', 'history', 'science', 'technology']).withMessage('Invalid category'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const book = new Book(req.body);
    await book.save();

    res.status(201).json({
      message: 'Book created successfully',
      book
    });
  } catch (error) {
    console.error('Create book error:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Book with this ISBN already exists' });
    } else {
      res.status(500).json({ message: 'Server error while creating book' });
    }
  }
});

// @route   PUT /api/books/:id
// @desc    Update book
// @access  Private (Admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({
      message: 'Book updated successfully',
      book
    });
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({ message: 'Server error while updating book' });
  }
});

// @route   DELETE /api/books/:id
// @desc    Delete book (soft delete)
// @access  Private (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ message: 'Server error while deleting book' });
  }
});

// @route   GET /api/books/featured/new
// @desc    Get new arrivals
// @access  Public
router.get('/featured/new', async (req, res) => {
  try {
    const books = await Book.find({ isActive: true, isNew: true })
      .sort({ createdAt: -1 })
      .limit(8)
      .select('-seoTitle -seoDescription -seoKeywords');

    res.json({ books });
  } catch (error) {
    console.error('Get new arrivals error:', error);
    res.status(500).json({ message: 'Server error while fetching new arrivals' });
  }
});

// @route   GET /api/books/featured/bestsellers
// @desc    Get bestsellers
// @access  Public
router.get('/featured/bestsellers', async (req, res) => {
  try {
    const books = await Book.find({ isActive: true, isBestseller: true })
      .sort({ 'rating.average': -1 })
      .limit(8)
      .select('-seoTitle -seoDescription -seoKeywords');

    res.json({ books });
  } catch (error) {
    console.error('Get bestsellers error:', error);
    res.status(500).json({ message: 'Server error while fetching bestsellers' });
  }
});

// @route   GET /api/books/featured/discounted
// @desc    Get discounted books
// @access  Public
router.get('/featured/discounted', async (req, res) => {
  try {
    const books = await Book.find({ isActive: true, isDiscounted: true })
      .sort({ discountPercentage: -1 })
      .limit(8)
      .select('-seoTitle -seoDescription -seoKeywords');

    res.json({ books });
  } catch (error) {
    console.error('Get discounted books error:', error);
    res.status(500).json({ message: 'Server error while fetching discounted books' });
  }
});

module.exports = router;
