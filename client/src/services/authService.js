import { safeFetch, API_BASE_URL, getAuthHeaders } from './apiClient.js';

export const authService = {
  async register(name, email, password) {
    return safeFetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    }, 'Registration failed');
  },

  async login(email, password) {
    return safeFetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    }, 'Login failed');
  },

  async getMe(token) {
    return safeFetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    }, 'Session verification failed');
  },
};

