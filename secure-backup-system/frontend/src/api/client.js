import axios from 'axios';
import { useAuthStore } from '../store/authStore';

/**
 * Base URL for API requests.
 * Falls back to localhost:8000 if environment variable is not set.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Configured Axios instance for API communication.
 * 
 * Features:
 * - Automatic JWT token injection via request interceptor
 * - Automatic logout on 401 Unauthorized responses
 * - Consistent timeout and headers
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

/**
 * Request Interceptor - Attach JWT token to every request
 * 
 * This interceptor runs before every request and adds the
 * Authorization header with the Bearer token if the user is authenticated.
 * 
 * The token is retrieved from the auth store which persists it in localStorage.
 */
apiClient.interceptors.request.use(
  (config) => {
    // Get token from store (which includes localStorage persistence)
    const token = useAuthStore.getState().getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // Handle request configuration errors
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor - Handle 401 Unauthorized responses
 * 
 * This interceptor runs when a response is received.
 * If the response status is 401 (Unauthorized), it means the token
 * has expired or is invalid. The interceptor will:
 * 1. Log the user out by clearing stored authentication data
 * 2. Redirect to the login page (unless already there or on register page)
 * 
 * This ensures that users are not stuck with expired sessions.
 */
apiClient.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  (error) => {
    // Check if the error is due to unauthorized access (401)
    if (error.response?.status === 401) {
      // Token expired or invalid - log the user out
      useAuthStore.getState().logout();
      
      // Redirect to login page if not already there or on register page
      // This prevents infinite redirect loops
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    
    // Reject the promise so the calling code can handle the error
    return Promise.reject(error);
  }
);

export default apiClient;