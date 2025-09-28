// Frontend-only API stub for localStorage and local data
class BookStoreAPI {
  constructor() {
    this.token = null;
    this.user = JSON.parse(localStorage.getItem('bookstore_user')) || null;
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('bookstore_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('bookstore_token');
    localStorage.removeItem('bookstore_user');
  }

  // Simulate registration
  async register(userData) {
    this.user = {
      name: userData.fullName || userData.name,
      email: userData.email,
      password: userData.password
    };
    localStorage.setItem('bookstore_user', JSON.stringify(this.user));
    return { user: this.user };
  }

  // Simulate login
  async login(credentials) {
    const user = JSON.parse(localStorage.getItem('bookstore_user'));
    if (user && user.email === credentials.email && user.password === credentials.password) {
      this.user = user;
      return { user };
    } else {
      throw new Error('Invalid email or password');
    }
  }

  async getCurrentUser() {
    const user = JSON.parse(localStorage.getItem('bookstore_user'));
    if (user) {
      return { user };
    } else {
      throw new Error('Not authenticated');
    }
  }

  async updateProfile(profileData) {
    let user = JSON.parse(localStorage.getItem('bookstore_user'));
    if (user) {
      user = { ...user, ...profileData };
      localStorage.setItem('bookstore_user', JSON.stringify(user));
      this.user = user;
      return { user };
    } else {
      throw new Error('Not authenticated');
    }
  }

  async changePassword(passwordData) {
    let user = JSON.parse(localStorage.getItem('bookstore_user'));
    if (user && passwordData.oldPassword === user.password) {
      user.password = passwordData.newPassword;
      localStorage.setItem('bookstore_user', JSON.stringify(user));
      this.user = user;
      return { user };
    } else {
      throw new Error('Incorrect old password');
    }
  }

  // Books API - frontend only, so return nothing
  async getBooks(params = {}) {
    return { books: [] };
  }

  async getBook(id) {
    return { book: null };
  }

  async getFeaturedBooks(type) {
    return { books: [] };
  }

  // Cart API - use localStorage
  async getCart() {
    const cart = JSON.parse(localStorage.getItem('bookstore_cart')) || [];
    return { cart: { items: cart } };
  }

  async addToCart(bookId, quantity = 1) {
    let cart = JSON.parse(localStorage.getItem('bookstore_cart')) || [];
    const existing = cart.find(item => item.id === bookId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ id: bookId, quantity });
    }
    localStorage.setItem('bookstore_cart', JSON.stringify(cart));
    return { cart: { items: cart } };
  }

  async updateCartItem(bookId, quantity) {
    let cart = JSON.parse(localStorage.getItem('bookstore_cart')) || [];
    const item = cart.find(item => item.id === bookId);
    if (item) {
      item.quantity = quantity;
      localStorage.setItem('bookstore_cart', JSON.stringify(cart));
    }
    return { cart: { items: cart } };
  }

  async removeFromCart(bookId) {
    let cart = JSON.parse(localStorage.getItem('bookstore_cart')) || [];
    cart = cart.filter(item => item.id !== bookId);
    localStorage.setItem('bookstore_cart', JSON.stringify(cart));
    return { cart: { items: cart } };
  }

  async clearCart() {
    localStorage.setItem('bookstore_cart', JSON.stringify([]));
    return { cart: { items: [] } };
  }

  async getCartCount() {
    const cart = JSON.parse(localStorage.getItem('bookstore_cart')) || [];
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  async mergeGuestCart(guestItems) {
    let cart = JSON.parse(localStorage.getItem('bookstore_cart')) || [];
    guestItems.forEach(guest => {
      const existing = cart.find(item => item.id === guest.bookId);
      if (existing) {
        existing.quantity += guest.quantity;
      } else {
        cart.push({ id: guest.bookId, quantity: guest.quantity });
      }
    });
    localStorage.setItem('bookstore_cart', JSON.stringify(cart));
    return { cart: { items: cart } };
  }

  // Orders API - store in localStorage
  async createOrder(orderData) {
    let orders = JSON.parse(localStorage.getItem('bookstore_orders')) || [];
    const order = {
      ...orderData,
      items: JSON.parse(localStorage.getItem('bookstore_cart')) || [],
      orderNumber: orders.length + 1,
      createdAt: new Date().toISOString(),
      status: 'placed',
      statusDisplay: 'Placed',
      pricing: {
        total: orderData.total || 0
      }
    };
    orders.push(order);
    localStorage.setItem('bookstore_orders', JSON.stringify(orders));
    localStorage.setItem('bookstore_cart', JSON.stringify([]));
    return { order };
  }

  async getOrders(params = {}) {
    const orders = JSON.parse(localStorage.getItem('bookstore_orders')) || [];
    return { orders };
  }

  async getOrder(id) {
    const orders = JSON.parse(localStorage.getItem('bookstore_orders')) || [];
    const order = orders.find(o => o.orderNumber === id);
    return { order };
  }

  async cancelOrder(id, reason) {
    let orders = JSON.parse(localStorage.getItem('bookstore_orders')) || [];
    const order = orders.find(o => o.orderNumber === id);
    if (order) {
      order.status = 'cancelled';
      order.statusDisplay = 'Cancelled';
      order.cancelReason = reason;
      localStorage.setItem('bookstore_orders', JSON.stringify(orders));
    }
    return { order };
  }

  async getOrderStats() {
    const orders = JSON.parse(localStorage.getItem('bookstore_orders')) || [];
    return { stats: { totalOrders: orders.length } };
  }

  // User API
  async getUserProfile() {
    return this.getCurrentUser();
  }

  async updateUserProfile(profileData) {
    return this.updateProfile(profileData);
  }

  async getUserOrders(params = {}) {
    return this.getOrders(params);
  }

  async getUserDashboard() {
    return {};
  }

  async deleteAccount(password) {
    let user = JSON.parse(localStorage.getItem('bookstore_user'));
    if (user && user.password === password) {
      localStorage.removeItem('bookstore_user');
      localStorage.removeItem('bookstore_orders');
      localStorage.removeItem('bookstore_cart');
      this.user = null;
      return { success: true };
    } else {
      throw new Error('Incorrect password');
    }
  }
}

// Create global API instance
const api = new BookStoreAPI();
window.BookStoreAPI = BookStoreAPI;
window.api = api;