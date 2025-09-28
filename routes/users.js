const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Order = require('../models/Order');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        address: req.user.address,
        phone: req.user.phone,
        isEmailVerified: req.user.isEmailVerified,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('phone').optional().matches(/^\+?[\d\s\-\(\)]+$/).withMessage('Please enter a valid phone number'),
  body('address.street').optional().trim().isLength({ min: 5 }).withMessage('Street address must be at least 5 characters'),
  body('address.city').optional().trim().isLength({ min: 2 }).withMessage('City must be at least 2 characters'),
  body('address.state').optional().trim().isLength({ min: 2 }).withMessage('State must be at least 2 characters'),
  body('address.zipCode').optional().trim().isLength({ min: 5 }).withMessage('ZIP code must be at least 5 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, address } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
});

// @route   POST /api/users/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', auth, [
  body('currentPassword').exists().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id);
    
    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error while changing password' });
  }
});

// @route   GET /api/users/orders
// @desc    Get user's order history
// @access  Private
router.get('/orders', auth, async (req, res) => {
  try {
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
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
});

// @route   GET /api/users/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    // Get order statistics
    const orderStats = await Order.aggregate([
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

    // Get recent orders
    const recentOrders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('items.book')
      .select('orderNumber status pricing.total createdAt');

    // Get order status counts
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
      stats: orderStats[0] || { totalOrders: 0, totalSpent: 0, averageOrderValue: 0 },
      recentOrders,
      statusCounts
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard data' });
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', auth, [
  body('password').exists().withMessage('Password is required for account deletion')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { password } = req.body;

    // Verify password
    const user = await User.findById(req.user._id);
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    // Check for pending orders
    const pendingOrders = await Order.countDocuments({ 
      user: req.user._id, 
      status: { $in: ['pending', 'confirmed', 'processing', 'shipped'] } 
    });

    if (pendingOrders > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete account with pending orders. Please cancel or wait for completion.' 
      });
    }

    // Delete user account
    await User.findByIdAndDelete(req.user._id);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error while deleting account' });
  }
});

// @route   GET /api/users/admin/all
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;

    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) filter.role = role;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers: total,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// @route   PUT /api/users/admin/:id/role
// @desc    Update user role (Admin only)
// @access  Private (Admin)
router.put('/admin/:id/role', adminAuth, [
  body('role').isIn(['user', 'admin']).withMessage('Role must be either user or admin')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error while updating user role' });
  }
});

module.exports = router;
