import apiClient from './client';

export const authApi = {
  /**
   * Register a new user
   * @param {string} fullName - User full name
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Registration response
   */
  register: async (fullName, email, password) => {
    const response = await apiClient.post('/auth/register', {
      email: email,
      password: password,
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

// Also export individual functions for convenience
export const register = authApi.register;
export const login = authApi.login;
export const getMe = authApi.getMe;

export default authApi;