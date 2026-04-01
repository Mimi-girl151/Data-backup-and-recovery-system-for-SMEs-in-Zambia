import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/auth';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setAuth: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
          error: null,
        });
      },

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(email, password);
          const { access_token, user } = response;
          
          set({
            user,
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.detail || 'Login failed. Please check your credentials.';
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });
          return { success: false, error: errorMessage };
        }
      },

      register: async (email, password, fullName) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.register(email, password, fullName);
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.detail || 'Registration failed. Please try again.';
          set({
            error: errorMessage,
            isLoading: false,
          });
          return { success: false, error: errorMessage };
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),

      getToken: () => get().token,
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
    }
  )
);