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
          console.error('Login error:', error);
          
          let errorMessage = 'Login failed. Please check your credentials.';
          if (error.response?.data?.detail) {
            if (typeof error.response.data.detail === 'string') {
              errorMessage = error.response.data.detail;
            } else if (Array.isArray(error.response.data.detail) && error.response.data.detail.length > 0) {
              errorMessage = error.response.data.detail[0].msg || errorMessage;
            }
          }
          
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
          console.log('Registration successful:', response);
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          console.error('Registration error in store:', error);
          
          let errorMessage = 'Registration failed. Please try again.';
          
          if (error.response?.data?.detail) {
            if (typeof error.response.data.detail === 'string') {
              errorMessage = error.response.data.detail;
            } else if (Array.isArray(error.response.data.detail) && error.response.data.detail.length > 0) {
              errorMessage = error.response.data.detail[0].msg || errorMessage;
            }
          } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          }
          
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
        const token = get().token;
        if (token) return token;
        return localStorage.getItem('token');
      },
    }),
    {
      name: 'auth-storage',
      storage: localStorage,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);