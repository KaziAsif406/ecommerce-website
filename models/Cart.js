const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 10 // Maximum 10 items per book
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  sessionId: String, // For guest users
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  }
}, {
  timestamps: true
});

// Virtual for total items count
cartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for total price
cartSchema.virtual('totalPrice').get(function() {
  return this.items.reduce((total, item) => {
    return total + (item.book.price * item.quantity);
  }, 0);
});

// Method to add item to cart
cartSchema.methods.addItem = async function(bookId, quantity = 1) {
  const existingItem = this.items.find(item => item.book.toString() === bookId);
  
  if (existingItem) {
    existingItem.quantity = Math.min(existingItem.quantity + quantity, 10);
  } else {
    this.items.push({ book: bookId, quantity });
  }
  
  return this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = function(bookId) {
  this.items = this.items.filter(item => item.book.toString() !== bookId);
  return this.save();
};

// Method to update item quantity
cartSchema.methods.updateQuantity = function(bookId, quantity) {
  const item = this.items.find(item => item.book.toString() === bookId);
  
  if (item) {
    if (quantity <= 0) {
      return this.removeItem(bookId);
    } else {
      item.quantity = Math.min(quantity, 10);
    }
  }
  
  return this.save();
};

// Method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  return this.save();
};

// Index for efficient queries
cartSchema.index({ user: 1 });
cartSchema.index({ sessionId: 1 });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Cart', cartSchema);
