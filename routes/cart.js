const express = require('express');
const { body, validationResult } = require('express-validator');
const Cart = require('../models/Cart');
const Book = require('../models/Book');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.book');
    
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
      await cart.save();
    }

    res.json({ cart });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error while fetching cart' });
  }
});

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private
router.post('/add', auth, [
  body('bookId').isMongoId().withMessage('Valid book ID is required'),
  body('quantity').isInt({ min: 1, max: 10 }).withMessage('Quantity must be between 1 and 10')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookId, quantity } = req.body;

    // Check if book exists and is active
    const book = await Book.findById(bookId);
    if (!book || !book.isActive) {
      return res.status(404).json({ message: 'Book not found or not available' });
    }

    // Check stock availability
    if (book.stock < quantity) {
      return res.status(400).json({ 
        message: `Only ${book.stock} items available in stock` 
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Add item to cart
    await cart.addItem(bookId, quantity);
    await cart.populate('items.book');

    res.json({
      message: 'Item added to cart successfully',
      cart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error while adding item to cart' });
  }
});

// @route   PUT /api/cart/update
// @desc    Update item quantity in cart
// @access  Private
router.put('/update', auth, [
  body('bookId').isMongoId().withMessage('Valid book ID is required'),
  body('quantity').isInt({ min: 0, max: 10 }).withMessage('Quantity must be between 0 and 10')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookId, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Update quantity (0 removes the item)
    await cart.updateQuantity(bookId, quantity);
    await cart.populate('items.book');

    res.json({
      message: 'Cart updated successfully',
      cart
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Server error while updating cart' });
  }
});

// @route   DELETE /api/cart/remove
// @desc    Remove item from cart
// @access  Private
router.delete('/remove', auth, [
  body('bookId').isMongoId().withMessage('Valid book ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { bookId } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    await cart.removeItem(bookId);
    await cart.populate('items.book');

    res.json({
      message: 'Item removed from cart successfully',
      cart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error while removing item from cart' });
  }
});

// @route   DELETE /api/cart/clear
// @desc    Clear entire cart
// @access  Private
router.delete('/clear', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    await cart.clearCart();

    res.json({
      message: 'Cart cleared successfully',
      cart
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error while clearing cart' });
  }
});

// @route   GET /api/cart/count
// @desc    Get cart items count
// @access  Private
router.get('/count', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    const count = cart ? cart.totalItems : 0;

    res.json({ count });
  } catch (error) {
    console.error('Get cart count error:', error);
    res.status(500).json({ message: 'Server error while fetching cart count' });
  }
});

// @route   POST /api/cart/merge
// @desc    Merge guest cart with user cart
// @access  Private
router.post('/merge', auth, [
  body('guestItems').isArray().withMessage('Guest items must be an array'),
  body('guestItems.*.bookId').isMongoId().withMessage('Valid book ID is required'),
  body('guestItems.*.quantity').isInt({ min: 1, max: 10 }).withMessage('Quantity must be between 1 and 10')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { guestItems } = req.body;

    // Get or create user cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Merge guest items
    for (const item of guestItems) {
      const book = await Book.findById(item.bookId);
      if (book && book.isActive && book.stock >= item.quantity) {
        await cart.addItem(item.bookId, item.quantity);
      }
    }

    await cart.populate('items.book');

    res.json({
      message: 'Guest cart merged successfully',
      cart
    });
  } catch (error) {
    console.error('Merge cart error:', error);
    res.status(500).json({ message: 'Server error while merging cart' });
  }
});

module.exports = router;
