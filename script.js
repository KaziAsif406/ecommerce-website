// Bookstore E-commerce System with Backend Integration
class BookStore {
    constructor() {
        this.cart = [];
        this.orders = [];
        this.currentUser = null;
        this.isOnline = true;
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.checkAuth();
        await this.loadCart();
        this.updateCartDisplay();
        this.renderCurrentPage();
    }

    bindEvents() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.handleSearch(searchInput.value));
        }

        // Cart functionality
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                const bookId = parseInt(e.target.dataset.bookId);
                this.addToCart(bookId);
            }
            if (e.target.classList.contains('remove-from-cart')) {
                const bookId = parseInt(e.target.dataset.bookId);
                this.removeFromCart(bookId);
            }
            if (e.target.classList.contains('update-quantity')) {
                const bookId = parseInt(e.target.dataset.bookId);
                const change = parseInt(e.target.dataset.change);
                this.updateQuantity(bookId, change);
            }
        });

        // Filter functionality
        const filterInputs = document.querySelectorAll('.filter-options input, #sortSelect, #priceRange');
        filterInputs.forEach(input => {
            input.addEventListener('change', () => this.applyFilters());
        });

        // View toggle
        const viewBtns = document.querySelectorAll('.view-btn');
        viewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleView(e.target.id));
        });

        // Auth forms
        const loginForm = document.getElementById('loginFormElement');
        const signupForm = document.getElementById('signupFormElement');
        const checkoutForm = document.getElementById('checkoutForm');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => this.handleCheckout(e));
        }

        // Auth toggle
        const showSignup = document.getElementById('showSignup');
        const showLogin = document.getElementById('showLogin');
        
        if (showSignup) {
            showSignup.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleAuthForm('signup');
            });
        }
        if (showLogin) {
            showLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleAuthForm('login');
            });
        }

        // Payment method toggle
        const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
        paymentMethods.forEach(method => {
            method.addEventListener('change', (e) => this.togglePaymentMethod(e.target.value));
        });
    }

    // Authentication Methods
    async checkAuth() {
        try {
            const response = await api.getCurrentUser();
            this.currentUser = response.user;
            this.updateAuthUI();
        } catch (error) {
            console.log('User not authenticated');
            this.currentUser = null;
        }
    }

    async login(credentials) {
        try {
            const response = await api.login(credentials);
            this.currentUser = response.user;
            this.updateAuthUI();
            this.showNotification('Login successful!');
            return response;
        } catch (error) {
            this.showNotification(error.message, 'error');
            throw error;
        }
    }

    async register(userData) {
        try {
            const response = await api.register(userData);
            this.currentUser = response.user;
            this.updateAuthUI();
            this.showNotification('Registration successful!');
            return response;
        } catch (error) {
            this.showNotification(error.message, 'error');
            throw error;
        }
    }

    logout() {
        api.clearToken();
        this.currentUser = null;
        this.cart = [];
        this.updateAuthUI();
        this.showNotification('Logged out successfully');
        window.location.href = 'index.html';
    }

    updateAuthUI() {
        const loginLink = document.querySelector('a[href="login.html"]');
        if (loginLink) {
            if (this.currentUser) {
                loginLink.textContent = `Welcome, ${this.currentUser.name}`;
                loginLink.href = '#';
                loginLink.onclick = () => this.logout();
            } else {
                loginLink.textContent = 'Login / Signup';
                loginLink.href = 'login.html';
                loginLink.onclick = null;
            }
        }
    }


    // Book data - always use local data
    getBooks(params = {}) {
        return this.getLocalBooks();
    }

    getLocalBooks() {
        return [
            {
                _id: 1,
                title: "The Great Gatsby",
                author: "F. Scott Fitzgerald",
                price: 12.99,
                originalPrice: 15.99,
                category: "fiction",
                rating: { average: 4.5 },
                description: "A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream.",
                images: [{ url: "📚", alt: "The Great Gatsby" }],
                isNew: false,
                isBestseller: true,
                isDiscounted: true
            },
            {
                id: 2,
                title: "To Kill a Mockingbird",
                author: "Harper Lee",
                price: 14.99,
                originalPrice: 14.99,
                category: "fiction",
                rating: 4.8,
                description: "A gripping tale of racial injustice and childhood innocence in the American South.",
                image: "📖",
                isNew: false,
                isBestseller: true,
                isDiscounted: false
            },
            {
                id: 3,
                title: "1984",
                author: "George Orwell",
                price: 13.99,
                originalPrice: 13.99,
                category: "fiction",
                rating: 4.7,
                description: "A dystopian social science fiction novel about totalitarian control and surveillance.",
                image: "📕",
                isNew: false,
                isBestseller: true,
                isDiscounted: false
            },
            {
                id: 4,
                title: "Sapiens",
                author: "Yuval Noah Harari",
                price: 18.99,
                originalPrice: 18.99,
                category: "non-fiction",
                rating: 4.6,
                description: "A brief history of humankind, exploring how Homo sapiens came to dominate the world.",
                image: "📗",
                isNew: false,
                isBestseller: false,
                isDiscounted: false
            },
            {
                id: 5,
                title: "Atomic Habits",
                author: "James Clear",
                price: 16.99,
                originalPrice: 16.99,
                category: "non-fiction",
                rating: 4.9,
                description: "An easy and proven way to build good habits and break bad ones.",
                image: "📘",
                isNew: false,
                isBestseller: true,
                isDiscounted: false
            },
            {
                id: 6,
                title: "The Psychology of Money",
                author: "Morgan Housel",
                price: 15.99,
                originalPrice: 15.99,
                category: "non-fiction",
                rating: 4.5,
                description: "Timeless lessons on wealth, greed, and happiness through short stories.",
                image: "📙",
                isNew: true,
                isBestseller: false,
                isDiscounted: false
            },
            {
                id: 7,
                title: "Calculus Made Easy",
                author: "Silvanus P. Thompson",
                price: 24.99,
                originalPrice: 24.99,
                category: "academic",
                rating: 4.3,
                description: "A classic introduction to calculus that makes the subject accessible to everyone.",
                image: "📐",
                isNew: false,
                isBestseller: false,
                isDiscounted: false
            },
            {
                id: 8,
                title: "Spider-Man: Into the Spider-Verse",
                author: "Various",
                price: 19.99,
                originalPrice: 24.99,
                category: "comics",
                rating: 4.8,
                description: "The official graphic novel adaptation of the Academy Award-winning animated film.",
                image: "🕷️",
                isNew: false,
                isBestseller: false,
                isDiscounted: true
            },
            {
                id: 9,
                title: "Harry Potter and the Philosopher's Stone",
                author: "J.K. Rowling",
                price: 11.99,
                originalPrice: 11.99,
                category: "children",
                rating: 4.9,
                description: "The first book in the magical Harry Potter series.",
                image: "⚡",
                isNew: false,
                isBestseller: true,
                isDiscounted: false
            },
            {
                id: 10,
                title: "The Midnight Library",
                author: "Matt Haig",
                price: 17.99,
                originalPrice: 17.99,
                category: "fiction",
                rating: 4.4,
                description: "A novel about life, death, and the choices we make.",
                image: "🌙",
                isNew: true,
                isBestseller: false,
                isDiscounted: false
            }
        ];
    }

    // Cart Management with Backend Integration
    async addToCart(bookId) {
        try {
            if (this.currentUser) {
                // Use backend API for authenticated users
                const response = await api.addToCart(bookId, 1);
                this.cart = response.cart.items;
                this.showNotification('Book added to cart!');
            } else {
                // Use local storage for guest users
                const books = this.getBooks();
                const book = books.find(b => (b._id || b.id) == bookId);
                if (!book) return;

                const itemId = book._id || book.id;
                const existingItem = this.cart.find(item => (item._id || item.id) == itemId);

                if (existingItem) {
                    existingItem.quantity += 1;
                } else {
                    this.cart.push({
                        ...book,
                        quantity: 1,
                        id: itemId // always set id for cart items
                    });
                }

                this.saveLocalData();
                this.showNotification(`${book.title} added to cart!`);
            }
            this.updateCartDisplay();
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    async removeFromCart(bookId) {
        try {
            if (this.currentUser) {
                const response = await api.removeFromCart(bookId);
                this.cart = response.cart.items;
            } else {
                this.cart = this.cart.filter(item => (item._id || item.id) != bookId);
                this.saveLocalData();
                this.renderCartPage();
            }
            this.updateCartDisplay();
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    async updateQuantity(bookId, change) {
        try {
            const item = this.cart.find(item => (item._id || item.id) == bookId);
            if (!item) return;

            const newQuantity = item.quantity + change;
            if (newQuantity <= 0) {
                await this.removeFromCart(bookId);
                if (!this.currentUser) this.renderCartPage();
            } else {
                if (this.currentUser) {
                    const response = await api.updateCartItem(bookId, newQuantity);
                    this.cart = response.cart.items;
                } else {
                    item.quantity = newQuantity;
                    this.saveLocalData();
                    this.renderCartPage();
                }
                this.updateCartDisplay();
            }
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    async loadCart() {
        try {
            if (this.currentUser) {
                const response = await api.getCart();
                this.cart = response.cart.items || [];
            } else {
                this.loadLocalData();
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            this.loadLocalData();
        }
    }

    updateCartDisplay() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }

    // Page Rendering
    renderCurrentPage() {
        const currentPage = this.getCurrentPage();
        
        switch(currentPage) {
            case 'home':
                this.renderHomePage();
                break;
            case 'products':
                this.renderProductsPage();
                break;
            case 'book-details':
                this.renderBookDetailsPage();
                break;
            case 'cart':
                this.renderCartPage();
                break;
            case 'checkout':
                this.renderCheckoutPage();
                break;
            case 'login':
                this.renderLoginPage();
                break;
            case 'orders':
                this.renderOrdersPage();
                break;
        }
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().split('.')[0];
        
        if (filename === 'index' || filename === '') return 'home';
        if (filename === 'products') return 'products';
        if (filename === 'book-details') return 'book-details';
        if (filename === 'cart') return 'cart';
        if (filename === 'checkout') return 'checkout';
        if (filename === 'login') return 'login';
        if (filename === 'orders') return 'orders';
        
        return 'home';
    }

    async renderHomePage() {
        // Always use local data for featured books
        const books = this.getBooks();
        this.renderFeaturedBooks('newArrivals', books.filter(book => book.isNew));
        this.renderFeaturedBooks('bestSellers', books.filter(book => book.isBestseller));
        this.renderFeaturedBooks('discountedBooks', books.filter(book => book.isDiscounted));
    }

    renderFeaturedBooks(containerId, books) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = books.slice(0, 4).map(book => this.createBookCard(book)).join('');
    }

    async renderProductsPage() {
        const books = this.getBooks();
        const filteredBooks = this.getFilteredBooks(books);
        const container = document.getElementById('productsGrid');
        if (container) {
            container.innerHTML = filteredBooks.map(book => this.createBookCard(book)).join('');
        }
    }

    createBookCard(book) {
        const bookId = book._id || book.id;
        const bookImage = this.getBookImage(book);
        const rating = book.rating?.average || book.rating || 0;
        const discountBadge = book.isDiscounted ? `<span class="discount-badge">${Math.round((1 - book.price / book.originalPrice) * 100)}% OFF</span>` : '';
        const newBadge = book.isNew ? `<span class="new-badge">NEW</span>` : '';
        const bestsellerBadge = book.isBestseller ? `<span class="bestseller-badge">BESTSELLER</span>` : '';
        
        return `
            <div class="book-card" onclick="bookStore.viewBookDetails('${bookId}')">
                <div class="book-cover">
                    <img src="${bookImage}" alt="${book.title}" class="book-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="book-image-fallback" style="display:none; align-items:center; justify-content:center; height:100%; font-size:4rem; color:#8b4513;">📚</div>
                    ${discountBadge}
                    ${newBadge}
                    ${bestsellerBadge}
                </div>
                <div class="book-info">
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-author">by ${book.author}</p>
                    <div class="book-rating">
                        <div class="stars">${'★'.repeat(Math.floor(rating))}${'☆'.repeat(5 - Math.floor(rating))}</div>
                        <span class="rating-text">${rating}</span>
                    </div>
                    <div class="book-price">
                        ${book.isDiscounted ? `<span class="original-price">$${book.originalPrice}</span>` : ''}
                        <span class="current-price">$${book.price}</span>
                    </div>
                    <button class="btn btn-primary add-to-cart" data-book-id="${bookId}" onclick="event.stopPropagation();">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
            </div>
        `;
    }

    getBookImage(book) {
        // Use proper book cover images from placeholder services
        const bookImages = {
            1: 'https://covers.openlibrary.org/b/isbn/9780743273565-M.jpg', // The Great Gatsby
            2: 'https://covers.openlibrary.org/b/isbn/9780061120084-M.jpg', // To Kill a Mockingbird
            3: 'https://covers.openlibrary.org/b/isbn/9780451524935-M.jpg', // 1984
            4: 'https://covers.openlibrary.org/b/isbn/9780062316097-M.jpg', // Sapiens
            5: 'https://covers.openlibrary.org/b/isbn/9780735211292-M.jpg', // Atomic Habits
            6: 'https://covers.openlibrary.org/b/isbn/9780857197689-M.jpg', // The Psychology of Money
            7: 'https://covers.openlibrary.org/b/isbn/9780312183617-M.jpg', // Calculus Made Easy
            8: 'https://covers.openlibrary.org/b/isbn/9781302906280-M.jpg', // Spider-Man
            9: 'https://covers.openlibrary.org/b/isbn/9780747532699-M.jpg', // Harry Potter
            10: 'https://covers.openlibrary.org/b/isbn/9780525559474-M.jpg' // The Midnight Library
        };
        
        const bookId = book._id || book.id;
        return bookImages[bookId] || `https://via.placeholder.com/300x400/8b4513/ffffff?text=${encodeURIComponent(book.title)}`;
    }

    // Book Details Page
    async viewBookDetails(bookId) {
        const books = this.getBooks();
        const book = books.find(b => (b._id || b.id) == bookId);
        if (!book) return;
        // Store book ID in URL for page refresh
        const url = new URL(window.location);
        url.searchParams.set('id', bookId);
        window.history.pushState({}, '', url);
        // Navigate to book details page
        window.location.href = `book-details.html?id=${bookId}`;
    }

    async renderBookDetailsPage() {
        const urlParams = new URLSearchParams(window.location.search);
        const bookId = parseInt(urlParams.get('id'));
        const books = this.getBooks();
        const book = books.find(b => (b._id || b.id) == bookId);
        if (!book) {
            window.location.href = 'products.html';
            return;
        }
        const container = document.getElementById('bookDetails');
        if (!container) return;
        const bookImage = this.getBookImage(book);
        const rating = book.rating?.average || book.rating || 0;
        const discountBadge = book.isDiscounted ? `<span class="discount-badge">${Math.round((1 - book.price / book.originalPrice) * 100)}% OFF</span>` : '';
        const bookIdForCart = book._id || book.id;
        container.innerHTML = `
            <div class="book-detail-cover">
                <img src="${bookImage}" alt="${book.title}" class="book-detail-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="book-detail-image-fallback" style="display:none; align-items:center; justify-content:center; height:400px; font-size:8rem; color:#8b4513;">📚</div>
                ${discountBadge}
            </div>
            <div class="book-detail-info">
                <h1>${book.title}</h1>
                <p class="book-detail-author">by ${book.author}</p>
                <div class="book-detail-rating">
                    <div class="stars">${'★'.repeat(Math.floor(rating))}${'☆'.repeat(5 - Math.floor(rating))}</div>
                    <span class="rating-text">${rating}/5</span>
                </div>
                <div class="book-detail-price">
                    ${book.isDiscounted ? `<span class="original-price">$${book.originalPrice}</span>` : ''}
                    <span class="current-price">$${book.price}</span>
                </div>
                <div class="book-detail-description">
                    <p>${book.description}</p>
                </div>
                <div class="book-detail-actions">
                    <button class="btn btn-primary btn-large add-to-cart" data-book-id="${bookIdForCart}">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                    <a href="products.html" class="btn btn-secondary">Back to Shop</a>
                </div>
            </div>
        `;
        // Update page title
        const bookTitleEl = document.getElementById('bookTitle');
        if (bookTitleEl) bookTitleEl.textContent = book.title;
    }

    // Cart Page
    renderCartPage() {
        const cartItems = document.getElementById('cartItems');
        const emptyCart = document.getElementById('emptyCart');
        
        if (this.cart.length === 0) {
            if (cartItems) cartItems.style.display = 'none';
            if (emptyCart) emptyCart.style.display = 'block';
            return;
        }

        if (cartItems) cartItems.style.display = 'block';
        if (emptyCart) emptyCart.style.display = 'none';

        if (cartItems) {
            cartItems.innerHTML = this.cart.map(item => {
                const itemId = item._id || item.id;
                const itemImage = this.getBookImage(item);
                return `
                    <div class="cart-item">
                        <div class="cart-item-image">
                            <img src="${itemImage}" alt="${item.title}" class="book-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <div class="book-image-fallback" style="display:none; align-items:center; justify-content:center; height:80px; width:60px; font-size:2rem; color:#8b4513;">📚</div>
                        </div>
                        <div class="cart-item-info">
                            <div class="cart-item-title">${item.title}</div>
                            <div class="cart-item-author">by ${item.author}</div>
                            <div class="cart-item-price">$${item.price}</div>
                        </div>
                        <div class="cart-item-controls">
                            <div class="quantity-controls">
                                <button class="quantity-btn update-quantity" data-book-id="${itemId}" data-change="-1">-</button>
                                <input type="number" class="quantity-input" value="${item.quantity}" min="1" 
                                       onchange="bookStore.setQuantity(${itemId}, this.value)">
                                <button class="quantity-btn update-quantity" data-book-id="${itemId}" data-change="1">+</button>
                            </div>
                            <button class="btn btn-danger remove-from-cart" data-book-id="${itemId}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        this.updateCartTotals();
    }

    setQuantity(bookId, quantity) {
        const item = this.cart.find(item => (item._id || item.id) == bookId);
        if (item) {
            item.quantity = parseInt(quantity);
            if (item.quantity <= 0) {
                this.removeFromCart(bookId);
            } else {
                this.saveLocalData();
                this.updateCartDisplay();
                this.renderCartPage();
            }
        }
    }

    updateCartTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.08; // 8% tax
        const total = subtotal + tax;

        const subtotalEl = document.getElementById('subtotal');
        const taxEl = document.getElementById('tax');
        const totalEl = document.getElementById('total');

        if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
    }

    // Checkout Page
    renderCheckoutPage() {
        const orderItems = document.getElementById('orderItems');
        if (orderItems) {
            orderItems.innerHTML = this.cart.map(item => {
                const itemImage = this.getBookImage(item);
                return `
                    <div class="order-item">
                        <div class="order-item-image">
                            <img src="${itemImage}" alt="${item.title}" class="book-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <div class="book-image-fallback" style="display:none; align-items:center; justify-content:center; height:80px; width:60px; font-size:1.5rem; color:#8b4513;">📚</div>
                        </div>
                        <div class="order-item-info">
                            <div class="order-item-title">${item.title}</div>
                            <div class="order-item-quantity">Qty: ${item.quantity}</div>
                        </div>
                        <div class="order-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                `;
            }).join('');
        }

        this.updateOrderTotals();
    }

    updateOrderTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.08;
        const total = subtotal + tax;

        const orderSubtotal = document.getElementById('orderSubtotal');
        const orderTax = document.getElementById('orderTax');
        const orderTotal = document.getElementById('orderTotal');

        if (orderSubtotal) orderSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        if (orderTax) orderTax.textContent = `$${tax.toFixed(2)}`;
        if (orderTotal) orderTotal.textContent = `$${total.toFixed(2)}`;
    }

    // Search and Filter
    handleSearch(searchTerm) {
        const books = this.getBooks();
        const filteredBooks = books.filter(book => 
            book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.author.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        this.renderFilteredBooks(filteredBooks);
    }

    getFilteredBooks(books) {
        const selectedCategories = Array.from(document.querySelectorAll('.filter-options input:checked'))
            .map(input => input.value);
        
        const maxPrice = document.getElementById('priceRange')?.value || 100;
        const sortBy = document.getElementById('sortSelect')?.value || 'newest';

        let filtered = books.filter(book => {
            const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(book.category);
            const priceMatch = book.price <= maxPrice;
            return categoryMatch && priceMatch;
        });

        // Sort books
        switch(sortBy) {
            case 'price-low':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'title':
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'newest':
            default:
                filtered.sort((a, b) => b.id - a.id);
                break;
        }

        return filtered;
    }

    applyFilters() {
        const books = this.getBooks();
        const filteredBooks = this.getFilteredBooks(books);
        this.renderFilteredBooks(filteredBooks);
    }

    renderFilteredBooks(books) {
        const container = document.getElementById('productsGrid');
        if (container) {
            container.innerHTML = books.map(book => this.createBookCard(book)).join('');
        }
    }

    // Auth Functions
    toggleAuthForm(formType) {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        
        if (formType === 'signup') {
            if (loginForm) loginForm.style.display = 'none';
            if (signupForm) signupForm.style.display = 'block';
        } else {
            if (loginForm) loginForm.style.display = 'block';
            if (signupForm) signupForm.style.display = 'none';
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        try {
            await this.login({ email, password });
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } catch (error) {
            // Error already handled in login method
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match!', 'error');
            return;
        }
        
        if (!name || !email || !password) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        try {
            await this.register({ name, email, password });
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } catch (error) {
            // Error already handled in register method
        }
    }

    async handleCheckout(e) {
        e.preventDefault();
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty!', 'error');
            return;
        }
        // Validate required fields
        const formData = new FormData(e.target);
        const orderData = Object.fromEntries(formData);
        const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'zipCode', 'paymentMethod'];
        for (const field of requiredFields) {
            if (!orderData[field] || orderData[field].trim() === '') {
                this.showNotification('Please fill in all required fields', 'error');
                return;
            }
        }
        // If payment method is card, check card fields
        if (orderData.paymentMethod === 'card') {
            const cardFields = ['cardNumber', 'expiryDate', 'cvv'];
            for (const field of cardFields) {
                if (!orderData[field] || orderData[field].trim() === '') {
                    this.showNotification('Please fill in all card details', 'error');
                    return;
                }
            }
        }
        // Place order (simulate)
        try {
            const response = await api.createOrder(orderData);
            this.cart = [];
            this.updateCartDisplay();
            // Show confirmation popup with order details
            this.showOrderConfirmation(response.order);
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    showOrderConfirmation(order) {
        // Calculate delivery date (3-7 days from now)
        const deliveryDays = Math.floor(Math.random() * 5) + 3;
        const deliveryDate = new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000);
        const formattedDate = deliveryDate.toLocaleDateString();
        // Build order summary
        const itemsList = order.items.map(item => `<li>${item.title} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>`).join('');
        // Calculate total price if missing or zero
        let total = 0;
        if (order.pricing && typeof order.pricing.total === 'number' && order.pricing.total > 0) {
            total = order.pricing.total;
        } else {
            total = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        }
        const popup = document.createElement('div');
        popup.className = 'order-confirm-popup';
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.18);
            padding: 2rem 2.5rem;
            z-index: 10001;
            min-width: 320px;
            max-width: 90vw;
        `;
        popup.innerHTML = `
            <h2 style="color:#28a745; margin-bottom:1rem;">Order Confirmed!</h2>
            <p>Thank you for your purchase.</p>
            <div style="margin:1rem 0;">
                <strong>Order ID:</strong> #${order.orderNumber}<br>
                <strong>Total Price:</strong> $${total.toFixed(2)}<br>
                <strong>Delivery Date:</strong> ${formattedDate}
            </div>
            <div style="margin-bottom:1rem;"><strong>Items:</strong><ul style="margin:0; padding-left:1.2em;">${itemsList}</ul></div>
            <button style="background:#28a745; color:#fff; border:none; border-radius:5px; padding:0.5em 1.5em; font-size:1rem; cursor:pointer;" id="closeOrderPopup">Close</button>
        `;
        document.body.appendChild(popup);
        document.getElementById('closeOrderPopup').onclick = () => {
            popup.remove();
            window.location.href = 'index.html';
        };
    }

    togglePaymentMethod(method) {
        const cardDetails = document.getElementById('cardDetails');
        if (cardDetails) {
            cardDetails.style.display = method === 'card' ? 'block' : 'none';
        }
    }

    // Orders Page
    async renderOrdersPage() {
        const ordersList = document.getElementById('ordersList');
        const emptyOrders = document.getElementById('emptyOrders');
        
        if (!this.currentUser) {
            if (ordersList) ordersList.style.display = 'none';
            if (emptyOrders) {
                emptyOrders.innerHTML = `
                    <i class="fas fa-shopping-bag"></i>
                    <h3>Please login to view orders</h3>
                    <p>You need to be logged in to see your order history.</p>
                    <a href="login.html" class="btn btn-primary">Login</a>
                `;
                emptyOrders.style.display = 'block';
            }
            return;
        }

        try {
            const response = await api.getOrders();
            const orders = response.orders;

            if (orders.length === 0) {
                if (ordersList) ordersList.style.display = 'none';
                if (emptyOrders) emptyOrders.style.display = 'block';
                return;
            }

            if (ordersList) ordersList.style.display = 'block';
            if (emptyOrders) emptyOrders.style.display = 'none';

            if (ordersList) {
                ordersList.innerHTML = orders.map(order => `
                    <div class="order-card">
                        <div class="order-header">
                            <div class="order-number">Order #${order.orderNumber}</div>
                            <div class="order-date">${new Date(order.createdAt).toLocaleDateString()}</div>
                            <div class="order-status status-${order.status}">${order.statusDisplay}</div>
                        </div>
                        <div class="order-items">
                            ${order.items.map(item => {
                                const itemImage = this.getBookImage(item);
                                return `
                                    <div class="order-item">
                                        <div class="order-item-image">
                                            <img src="${itemImage}" alt="${item.title}" class="book-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                            <div class="book-image-fallback" style="display:none; align-items:center; justify-content:center; height:80px; width:60px; font-size:1.5rem; color:#8b4513;">📚</div>
                                        </div>
                                        <div class="order-item-info">
                                            <div class="order-item-title">${item.title}</div>
                                            <div class="order-item-quantity">Qty: ${item.quantity}</div>
                                        </div>
                                        <div class="order-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        <div class="order-total">Total: $${order.pricing.total.toFixed(2)}</div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            this.showNotification('Error loading orders', 'error');
        }
    }

    // Utility Functions
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            background: ${type === 'error' ? '#dc3545' : '#28a745'};
            color: white;
            border-radius: 5px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Local data methods for guest users
    saveLocalData() {
        localStorage.setItem('bookstore_cart', JSON.stringify(this.cart));
    }

    loadLocalData() {
        const savedCart = localStorage.getItem('bookstore_cart');
        if (savedCart) this.cart = JSON.parse(savedCart);
    }

    // Merge guest cart with user cart after login
    async mergeGuestCart() {
        if (this.currentUser && this.cart.length > 0) {
            try {
                const guestItems = this.cart.map(item => ({
                    bookId: item._id || item.id,
                    quantity: item.quantity
                }));
                
                await api.mergeGuestCart(guestItems);
                await this.loadCart();
                this.updateCartDisplay();
            } catch (error) {
                console.error('Error merging guest cart:', error);
            }
        }
    }
}

// Initialize the bookstore when the page loads
let bookStore;
document.addEventListener('DOMContentLoaded', () => {
    bookStore = new BookStore();
});
