import React, { useState } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';

/**
 * Header Component
 * 
 * Top navigation bar that appears above the main content.
 * Contains sidebar toggle button and user menu with logout option.
 */
const Header = () => {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  
  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-40">
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
        aria-label="Toggle sidebar"
      >
        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="User menu"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-medium shadow-sm">
            {user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <span className="text-sm font-medium text-slate-700 hidden sm:block">
            {user?.full_name || user?.email?.split('@')[0] || 'User'}
          </span>
        </button>
        
        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
            <button
              onClick={() => {
                setShowMenu(false);
                logout();
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export { Header };
export default Header;