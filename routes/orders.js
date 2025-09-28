const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Book = require('../models/Book');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', auth, [
  body('shippingAddress.fullName').trim().isLength({ min: 2 }).withMessage('Full name is required'),
  body('shippingAddress.street').trim().isLength({ min: 5 }).withMessage('Street address is required'),
  body('shippingAddress.city').trim().isLength({ min: 2 }).withMessage('City is required'),
  body('shippingAddress.state').trim().isLength({ min: 2 }).withMessage('State is required'),
  body('shippingAddress.zipCode').trim().isLength({ min: 5 }).withMessage('Valid ZIP code is required'),
  body('shippingAddress.phone').matches(/^\+?[\d\s\-\(\)]+$/).withMessage('Valid phone number is required'),
  body('paymentMethod.type').isIn(['card', 'cod', 'paypal', 'stripe']).withMessage('Valid payment method is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.book');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate stock availability
    for (const item of cart.items) {
      if (item.book.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for "${item.book.title}". Only ${item.book.stock} available.` 
        });
      }
    }

    // Calculate pricing
    const subtotal = cart.items.reduce((total, item) => {
      return total + (item.book.price * item.quantity);
    }, 0);

    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
    const total = subtotal + tax + shipping;

    // Create order
    const orderData = {
      user: req.user._id,
      items: cart.items.map(item => ({
        book: item.book._id,
        title: item.book.title,
        author: item.book.author,
        price: item.book.price,
        quantity: item.quantity,
        image: item.book.images[0]?.url || ''
      })),
      shippingAddress: req.body.shippingAddress,
      billingAddress: req.body.billingAddress || req.body.shippingAddress,
      paymentMethod: {
        type: req.body.paymentMethod.type,
        cardLast4: req.body.paymentMethod.cardLast4,
        cardBrand: req.body.paymentMethod.cardBrand,
        paymentIntentId: req.body.paymentMethod.paymentIntentId
      },
      pricing: {
        subtotal,
        tax,
        shipping,
        discount: 0,
        total
      },
      notes: req.body.notes
    };

    const order = new Order(orderData);
    await order.save();

    // Update stock
    for (const item of cart.items) {
      await Book.findByIdAndUpdate(
        item.book._id,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Clear cart
    await cart.clearCart();

    // Populate order for response
    await order.populate('items.book');

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error while creating order' });
  }
});

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20'),
  query('status').optional().isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { page = 1, limit = 10, status } = req.query;

    // Build filter
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('items.book');

    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalOrders: total,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    }).populate('items.book');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error while fetching order' });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.put('/:id/cancel', auth, [
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason must be less than 500 characters')
], async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ 
        message: 'Order cannot be cancelled at this stage' 
      });
    }

    // Update order status
    order.status = 'cancelled';
    order.cancellationReason = req.body.reason;
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Book.findByIdAndUpdate(
        item.book,
        { $inc: { stock: item.quantity } }
      );
    }

    res.json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error while cancelling order' });
  }
});

// @route   PUT /api/orders/:id/tracking
// @desc    Update tracking information (Admin only)
// @access  Private (Admin)
router.put('/:id/tracking', auth, [
  body('trackingNumber').trim().isLength({ min: 1 }).withMessage('Tracking number is required'),
  body('trackingUrl').optional().isURL().withMessage('Valid tracking URL is required'),
  body('estimatedDelivery').optional().isISO8601().withMessage('Valid delivery date is required')
], async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { trackingNumber, trackingUrl, estimatedDelivery } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.trackingNumber = trackingNumber;
    if (trackingUrl) order.trackingUrl = trackingUrl;
    if (estimatedDelivery) order.estimatedDelivery = new Date(estimatedDelivery);
    order.status = 'shipped';

    await order.save();

    res.json({
      message: 'Tracking information updated successfully',
      order
    });
  } catch (error) {
    console.error('Update tracking error:', error);
    res.status(500).json({ message: 'Server error while updating tracking' });
  }
});

// @route   GET /api/orders/stats/summary
// @desc    Get order statistics for user
// @access  Private
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const stats = await Order.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$pricing.total' },
          averageOrderValue: { $avg: '$pricing.total' }
        }
      }
    ]);

    const statusCounts = await Order.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      summary: stats[0] || { totalOrders: 0, totalSpent: 0, averageOrderValue: 0 },
      statusCounts
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ message: 'Server error while fetching order statistics' });
  }
});

module.exports = router;
