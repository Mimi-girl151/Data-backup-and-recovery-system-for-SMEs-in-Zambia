// frontend/src/store/authStore.js
import { create } from 'zustand';
import { authApi } from '../api/auth';

export const useAuthStore = create((set) => ({
  user: null,
  isLoading: false,
  error: null,
  
  login: async (email, password, rememberMe) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(email, password);
      
      // Store token
      if (response.access_token) {
        localStorage.setItem('token', response.access_token);
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
      }
      
      set({ user: response.user || { email }, isLoading: false });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Login failed', isLoading: false });
      return false;
    }
  },
  
  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(
        userData.email, 
        userData.password, 
        userData.name
      );
      
      if (response.access_token) {
        localStorage.setItem('token', response.access_token);
      }
      
      set({ user: response.user || { email: userData.email }, isLoading: false });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Registration failed', isLoading: false });
      return false;
    }
  },
  
  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rememberMe');
    set({ user: null, error: null });
  },
  
  clearError: () => set({ error: null })
}));