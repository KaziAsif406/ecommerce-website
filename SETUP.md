# MyBookStore - Full-Stack Setup Guide

This guide will help you set up the complete full-stack MyBookStore e-commerce application with both frontend and backend functionality.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Or install specific packages
npm install express mongoose bcryptjs jsonwebtoken cors dotenv express-validator multer nodemailer stripe
```

### 2. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Update `config.env` with your local MongoDB URI:
```
MONGODB_URI=mongodb://localhost:27017/mybookstore
```

#### Option B: MongoDB Atlas (Recommended)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `config.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mybookstore
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/mybookstore

# JWT Secret (generate a strong secret)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Server
PORT=5000
NODE_ENV=development

# Email Configuration (optional - for order confirmations)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Stripe (optional - for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 4. Seed the Database

```bash
# Run the database seeder to populate with sample data
node scripts/seedDatabase.js
```

This will create:
- 10 sample books across different categories
- 3 sample users (2 regular users + 1 admin)
- Sample accounts:
  - User: `john@example.com` / `password123`
  - User: `jane@example.com` / `password123`
  - Admin: `admin@mybookstore.com` / `admin123`

### 5. Start the Application

```bash
# Start the backend server
npm start

# Or for development with auto-restart
npm run dev
```

The backend will run on `http://localhost:5000`

### 6. Access the Application

Open your browser and navigate to:
- Frontend: `http://localhost:5000` (served by Express)
- API Documentation: `http://localhost:5000/api`

## 📁 Project Structure

```
mybookstore/
├── 📁 models/              # Database models
│   ├── User.js
│   ├── Book.js
│   ├── Order.js
│   └── Cart.js
├── 📁 routes/              # API routes
│   ├── auth.js
│   ├── books.js
│   ├── cart.js
│   ├── orders.js
│   └── users.js
├── 📁 middleware/          # Custom middleware
│   └── auth.js
├── 📁 scripts/            # Database utilities
│   └── seedDatabase.js
├── 📄 server.js           # Main server file
├── 📄 package.json        # Dependencies
├── 📄 config.env          # Environment variables
├── 📄 api.js              # Frontend API client
├── 📄 script.js           # Frontend JavaScript
├── 📄 styles.css          # Frontend styles
└── 📄 *.html              # Frontend pages
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password

### Books
- `GET /api/books` - Get all books (with filtering/pagination)
- `GET /api/books/:id` - Get single book
- `GET /api/books/featured/new` - Get new arrivals
- `GET /api/books/featured/bestsellers` - Get bestsellers
- `GET /api/books/featured/discounted` - Get discounted books
- `POST /api/books` - Create book (Admin only)
- `PUT /api/books/:id` - Update book (Admin only)
- `DELETE /api/books/:id` - Delete book (Admin only)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update item quantity
- `DELETE /api/cart/remove` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart
- `GET /api/cart/count` - Get cart items count
- `POST /api/cart/merge` - Merge guest cart

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/cancel` - Cancel order
- `GET /api/orders/stats/summary` - Get order statistics

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/change-password` - Change password
- `GET /api/users/orders` - Get user's orders
- `GET /api/users/dashboard` - Get dashboard data
- `DELETE /api/users/account` - Delete account

## 🛠️ Development

### Running in Development Mode

```bash
# Install nodemon for auto-restart
npm install -g nodemon

# Start with auto-restart
npm run dev
```

### Database Management

```bash
# Seed database with sample data
node scripts/seedDatabase.js

# Clear database (be careful!)
# Connect to MongoDB and run:
# db.dropDatabase()
```

### Testing the API

You can test the API using tools like:
- Postman
- Insomnia
- curl commands
- Browser developer tools

Example API test:
```bash
# Test book listing
curl http://localhost:5000/api/books

# Test user registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

## 🚀 Deployment

### Option 1: Heroku

1. Install Heroku CLI
2. Create Heroku app:
```bash
heroku create mybookstore-app
```
3. Set environment variables:
```bash
heroku config:set MONGODB_URI=your_mongodb_atlas_uri
heroku config:set JWT_SECRET=your_jwt_secret
```
4. Deploy:
```bash
git push heroku main
```

### Option 2: DigitalOcean

1. Create a Droplet
2. Install Node.js and MongoDB
3. Clone your repository
4. Set up environment variables
5. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start server.js --name "mybookstore"
```

### Option 3: AWS/GCP/Azure

Similar process with cloud-specific configurations.

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Rate limiting (can be added)
- SQL injection protection (MongoDB)
- XSS protection

## 📊 Features Implemented

### Backend Features
- ✅ User authentication & authorization
- ✅ JWT token management
- ✅ Password hashing
- ✅ Input validation
- ✅ Database models (User, Book, Order, Cart)
- ✅ RESTful API endpoints
- ✅ Error handling
- ✅ Data pagination
- ✅ Search and filtering
- ✅ Order management
- ✅ Cart persistence
- ✅ Admin functionality

### Frontend Features
- ✅ Responsive design
- ✅ API integration
- ✅ Authentication flow
- ✅ Shopping cart
- ✅ Order management
- ✅ Search and filtering
- ✅ User dashboard
- ✅ Error handling
- ✅ Loading states
- ✅ Notifications

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify connection string
   - Check network connectivity

2. **JWT Token Errors**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Clear browser storage

3. **CORS Errors**
   - Check CORS configuration
   - Verify frontend URL
   - Check API endpoints

4. **Port Already in Use**
   - Change PORT in .env
   - Kill existing processes
   - Use different port

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm start

# Or specific debug
DEBUG=mybookstore:* npm start
```

## 📈 Performance Optimization

- Database indexing
- API response caching
- Image optimization
- CDN integration
- Database query optimization
- Frontend code splitting

## 🔄 Updates and Maintenance

- Regular dependency updates
- Security patches
- Database backups
- Performance monitoring
- Error logging
- User feedback integration

---

**MyBookStore** - A complete full-stack e-commerce solution! 📚✨

For support or questions, please check the documentation or create an issue in the repository.
