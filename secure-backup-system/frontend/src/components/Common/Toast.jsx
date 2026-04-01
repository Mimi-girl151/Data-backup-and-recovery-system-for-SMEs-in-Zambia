import React, { useEffect } from 'react';
import { create } from 'zustand';

// Simple toast store
const useToastStore = create((set) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id: Date.now() }],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));

const Toast = () => {
  const { notifications, removeNotification } = useToastStore();
  
  useEffect(() => {
    const timers = notifications.map((notification) => {
      return setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);
    });
    
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [notifications, removeNotification]);
  
  if (notifications.length === 0) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => {
        const bgColor = {
          success: 'bg-green-500',
          error: 'bg-red-500',
          info: 'bg-blue-500',
          warning: 'bg-yellow-500',
        }[notification.type] || 'bg-gray-500';
        
        return (
          <div
            key={notification.id}
            className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg max-w-sm animate-slide-up`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm">{notification.message}</p>
              <button
                onClick={() => removeNotification(notification.id)}
                className="ml-4 text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Toast;