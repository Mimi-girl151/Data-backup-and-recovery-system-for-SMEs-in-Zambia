import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toast } from '../Common/Toast';
import { useUIStore } from '../../store/uiStore';

/**
 * MainLayout Component
 * 
 * This is the main layout wrapper for authenticated pages.
 * It includes:
 * - Collapsible sidebar navigation
 * - Top header bar with user menu
 * - Main content area with Outlet for nested routes
 * - Toast notification system
 * 
 * The layout adjusts when the sidebar is collapsed/expanded.
 */
const MainLayout = () => {
  const { sidebarOpen } = useUIStore();
  
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
        <Toast />
      </div>
    </div>
  );
};

// Named export
export { MainLayout };

// Default export for convenience
export default MainLayout;