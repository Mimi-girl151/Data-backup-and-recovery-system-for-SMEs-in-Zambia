import apiClient from './client';

export const authApi = {
  /**
   * Register a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} fullName - User full name
   * @returns {Promise} Registration response
   */
  register: async (email, password, fullName) => {
    const response = await apiClient.post('/auth/register', {
      email,
      password,
      full_name: fullName,
    });
    return response.data;
  },

  /**
   * Login user and get JWT token
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Login response with token and user data
   */
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  /**
   * Get current authenticated user
   * @returns {Promise} User data
   */
  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};