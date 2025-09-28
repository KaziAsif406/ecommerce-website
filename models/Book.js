const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
    maxlength: [100, 'Author name cannot exceed 100 characters']
  },
  isbn: {
    type: String,
    unique: true,
    sparse: true,
    match: [/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9X]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/, 'Please enter a valid ISBN']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['fiction', 'non-fiction', 'academic', 'comics', 'children', 'biography', 'history', 'science', 'technology']
  },
  genre: [{
    type: String,
    trim: true
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  stock: {
    type: Number,
    required: true,
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isNew: {
    type: Boolean,
    default: false
  },
  isBestseller: {
    type: Boolean,
    default: false
  },
  isDiscounted: {
    type: Boolean,
    default: false
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  publicationDate: {
    type: Date
  },
  publisher: {
    type: String,
    trim: true
  },
  language: {
    type: String,
    default: 'English'
  },
  pages: {
    type: Number,
    min: 1
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      default: 'inches'
    }
  },
  weight: {
    value: Number,
    unit: {
      type: String,
      default: 'pounds'
    }
  },
  tags: [String],
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String]
}, {
  timestamps: true
});

// Virtual for discount calculation
bookSchema.virtual('discountedPrice').get(function() {
  if (this.isDiscounted && this.discountPercentage > 0) {
    return this.price * (1 - this.discountPercentage / 100);
  }
  return this.price;
});

// Virtual for availability status
bookSchema.virtual('availability').get(function() {
  if (this.stock === 0) return 'out-of-stock';
  if (this.stock < 10) return 'low-stock';
  return 'in-stock';
});

// Index for search functionality
bookSchema.index({ title: 'text', author: 'text', description: 'text', tags: 'text' });
bookSchema.index({ category: 1 });
bookSchema.index({ price: 1 });
bookSchema.index({ 'rating.average': -1 });
bookSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate discount
bookSchema.pre('save', function(next) {
  if (this.originalPrice && this.price < this.originalPrice) {
    this.isDiscounted = true;
    this.discountPercentage = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);
