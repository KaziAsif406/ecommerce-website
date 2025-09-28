# MyBookStore - E-commerce Bookstore Website

A modern, responsive e-commerce website for an online bookstore built with HTML, CSS, and JavaScript.

## 🚀 Features

### 📚 Core Pages
- **Homepage** - Welcome page with featured books, hero section, and navigation
- **Product Listing** - Browse all books with filtering and sorting options
- **Book Details** - Individual book pages with full information
- **Shopping Cart** - Add, remove, and manage items in cart
- **Checkout** - Complete order process with form validation
- **User Authentication** - Login and signup functionality
- **Order History** - View past orders and their status

### 🛍️ E-commerce Features
- **Shopping Cart System** - Add/remove items, quantity management
- **Search Functionality** - Search books by title or author
- **Filtering & Sorting** - Filter by category, price range, and sort options
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Local Storage** - Cart and user data persistence
- **Order Management** - Complete order tracking system

### 📖 Book Categories
- Fiction
- Non-Fiction
- Academic
- Comics
- Children's Books

### 🎨 Design Features
- Modern, clean UI design
- Responsive grid layouts
- Interactive hover effects
- Book badges (New, Bestseller, Discounted)
- Star rating system
- Smooth animations and transitions

## 📁 Project Structure

```
ecommerce-website/
├── index.html          # Homepage
├── products.html       # Product listing page
├── book-details.html   # Individual book details
├── cart.html          # Shopping cart page
├── checkout.html      # Checkout process
├── login.html         # User authentication
├── orders.html        # Order history
├── styles.css         # Main stylesheet
├── script.js          # JavaScript functionality
└── README.md          # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server setup required - runs entirely in the browser

### Installation
1. Clone or download the project files
2. Open `index.html` in your web browser
3. Start browsing and shopping!

## 💻 Usage

### Navigation
- **Home** - Browse featured books and new arrivals
- **Categories** - View all books with filtering options
- **Cart** - Manage your shopping cart
- **Login/Signup** - Create account or sign in

### Shopping Process
1. Browse books on the homepage or products page
2. Click on a book to view details
3. Add books to your cart
4. Review items in your cart
5. Proceed to checkout
6. Fill out order information
7. Complete your purchase

### Features in Action
- **Search**: Use the search bar to find specific books
- **Filter**: Use category filters and price range sliders
- **Sort**: Sort books by price, title, or newest first
- **Cart**: Add multiple items and adjust quantities
- **Orders**: View your order history after checkout

## 🛠️ Technical Details

### Technologies Used
- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling with Flexbox and Grid
- **JavaScript (ES6+)** - Interactive functionality
- **Local Storage** - Data persistence
- **Font Awesome** - Icons

### Key JavaScript Features
- Object-oriented design with BookStore class
- Event delegation for dynamic content
- Local storage for data persistence
- Form validation and error handling
- Responsive navigation and filtering

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📱 Responsive Design

The website is fully responsive and works on:
- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)
- **Mobile** (320px - 767px)

## 🎯 Sample Books Included

The website includes 10 sample books across different categories:
- Classic literature (The Great Gatsby, 1984)
- Modern fiction (The Midnight Library)
- Non-fiction (Sapiens, Atomic Habits)
- Academic (Calculus Made Easy)
- Comics (Spider-Man)
- Children's books (Harry Potter)

## 🔧 Customization

### Adding New Books
Edit the `getBooks()` method in `script.js` to add new books:

```javascript
{
    id: 11,
    title: "Your Book Title",
    author: "Author Name",
    price: 19.99,
    originalPrice: 24.99,
    category: "fiction",
    rating: 4.5,
    description: "Book description...",
    image: "📚",
    isNew: true,
    isBestseller: false,
    isDiscounted: true
}
```

### Styling Customization
- Modify `styles.css` for design changes
- Update color scheme in CSS variables
- Adjust responsive breakpoints as needed

## 🚀 Future Enhancements

Potential improvements for the bookstore:
- Backend integration with real database
- Payment gateway integration
- User reviews and ratings
- Wishlist functionality
- Book recommendations
- Advanced search filters
- Inventory management
- Admin dashboard

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## 📞 Support

For support or questions, please open an issue in the project repository.

---

**MyBookStore** - Your one-stop destination for all your reading needs! 📚✨