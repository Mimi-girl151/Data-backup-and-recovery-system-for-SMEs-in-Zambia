import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/auth';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setAuth: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
          error: null,
        });
      },

      login: async (email, password, rememberMe = false) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(email, password);
          const { access_token, user } = response;
          
          // Store token
          if (access_token) {
            localStorage.setItem('token', access_token);
            if (rememberMe) {
              localStorage.setItem('rememberMe', 'true');
            }
          }
          
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

      register: async (fullName, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(fullName, email, password);
          
          // Don't auto-login after registration - just return success
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

      logout: async () => {
        localStorage.removeItem('token');
        localStorage.removeItem('rememberMe');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),

      getToken: () => {
        // First check state, then localStorage
        const token = get().token;
        if (token) return token;
        return localStorage.getItem('token');
      },
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);