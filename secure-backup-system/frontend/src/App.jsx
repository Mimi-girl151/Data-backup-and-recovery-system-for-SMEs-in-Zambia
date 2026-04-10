import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './modules/Auth/ProtectedRoute';
import Login from './modules/Auth/Login';
import Register from './modules/Auth/Register';
import DashboardHome from './modules/Dashboard/DashboardHome';
import BackupPage from './modules/Backup/BackupPage';
import RecoveryPage from './modules/Recovery/RecoveryPage';
import SettingsPage from './modules/Settings/SettingsPage';
import { Toast } from './components/Common/Toast';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />
        <Route path="/backup" element={<ProtectedRoute><BackupPage /></ProtectedRoute>} />
        <Route path="/recovery" element={<ProtectedRoute><RecoveryPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toast />
    </BrowserRouter>
  );
}

export default App;