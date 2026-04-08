import { create } from 'zustand';

/**
 * UI State Management Store
 * 
 * Manages global UI state including:
 * - Sidebar open/closed state
 * - Toast notifications
 * - Theme preferences
 */
const useUIStore = create((set) => ({
  // State
  theme: 'light',
  sidebarOpen: true,
  notifications: [],

  // Actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id: Date.now() }],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearNotifications: () => set({ notifications: [] }),
}));

export { useUIStore };
export default useUIStore;