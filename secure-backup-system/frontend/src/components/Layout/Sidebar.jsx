import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';

/**
 * Sidebar Component
 * 
 * Collapsible navigation sidebar that shows on the left side of the screen.
 * Contains navigation links to main sections of the application.
 */
const Sidebar = () => {
  const { sidebarOpen } = useUIStore();
  const { user } = useAuthStore();
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Backup', href: '/backup', icon: '💾' },
    { name: 'Recovery', href: '/recovery', icon: '🔄' },
    { name: 'Settings', href: '/settings', icon: '⚙️' },
  ];
  
  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white border-r border-slate-200 transition-all duration-300 z-50 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-slate-200">
          {sidebarOpen ? (
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              SecureBackup
            </span>
          ) : (
            <span className="text-2xl">💾</span>
          )}
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 py-4">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 mx-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100'
                } ${!sidebarOpen && 'justify-center'}`
              }
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="ml-3 font-medium">{item.name}</span>}
            </NavLink>
          ))}
        </nav>
        
        {/* User Info */}
        {sidebarOpen && user && (
          <div className="p-4 border-t border-slate-200">
            <p className="text-sm font-medium text-slate-900">{user.full_name || user.email}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export { Sidebar };
export default Sidebar;