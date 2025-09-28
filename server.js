const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));

// Serve static files from the frontend
app.use(express.static(path.join(__dirname, '../')));

// Catch all handler for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mybookstore', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
