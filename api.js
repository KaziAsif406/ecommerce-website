// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// API Helper Functions
class BookStoreAPI {
  constructor() {
    this.token = localStorage.getItem('bookstore_token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('bookstore_token', token);
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
    localStorage.removeItem('bookstore_token');
  }

  // Make API request
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` })
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Authentication API
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  async changePassword(passwordData) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData)
    });
  }

  // Books API
  async getBooks(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/books?${queryString}`);
  }

  async getBook(id) {
    return this.request(`/books/${id}`);
  }

  async getFeaturedBooks(type) {
    return this.request(`/books/featured/${type}`);
  }

  // Cart API
  async getCart() {
    return this.request('/cart');
  }

  async addToCart(bookId, quantity = 1) {
    return this.request('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ bookId, quantity })
    });
  }

  async updateCartItem(bookId, quantity) {
    return this.request('/cart/update', {
      method: 'PUT',
      body: JSON.stringify({ bookId, quantity })
    });
  }

  async removeFromCart(bookId) {
    return this.request('/cart/remove', {
      method: 'DELETE',
      body: JSON.stringify({ bookId })
    });
  }

  async clearCart() {
    return this.request('/cart/clear', {
      method: 'DELETE'
    });
  }

  async getCartCount() {
    return this.request('/cart/count');
  }

  async mergeGuestCart(guestItems) {
    return this.request('/cart/merge', {
      method: 'POST',
      body: JSON.stringify({ guestItems })
    });
  }

  // Orders API
  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async getOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/orders?${queryString}`);
  }

  async getOrder(id) {
    return this.request(`/orders/${id}`);
  }

  async cancelOrder(id, reason) {
    return this.request(`/orders/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    });
  }

  async getOrderStats() {
    return this.request('/orders/stats/summary');
  }

  // User API
  async getUserProfile() {
    return this.request('/users/profile');
  }

  async updateUserProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  async getUserOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/users/orders?${queryString}`);
  }

  async getUserDashboard() {
    return this.request('/users/dashboard');
  }

  async deleteAccount(password) {
    return this.request('/users/account', {
      method: 'DELETE',
      body: JSON.stringify({ password })
    });
  }
}

// Create global API instance
const api = new BookStoreAPI();

// Export for use in other files
window.BookStoreAPI = BookStoreAPI;
window.api = api;
