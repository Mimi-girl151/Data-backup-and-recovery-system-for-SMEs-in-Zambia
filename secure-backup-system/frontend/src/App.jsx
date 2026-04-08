import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './modules/Auth/ProtectedRoute';
import Login from './modules/Auth/Login';
import Register from './modules/Auth/Register';
import DashboardHome from './modules/Dashboard/DashboardHome';
import { MainLayout } from './components/Layout/MainLayout';
import { Toast } from './components/Common/Toast';

/**
 * Main Application Component
 * 
 * Sets up the routing for the entire application.
 * 
 * Routes:
 * - /login - Public login page
 * - /register - Public registration page
 * - /dashboard - Protected dashboard (requires authentication)
 * - /backup - Protected backup page (requires authentication)
 * - /recovery - Protected recovery page (requires authentication)
 * - /settings - Protected settings page (requires authentication)
 * - / - Redirects to /dashboard
 * - * - Catch all redirects to /dashboard
 * 
 * Protected routes are wrapped with ProtectedRoute component
 * which checks for valid JWT token before rendering.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - No authentication required */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes - Require authentication */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          }
        />
        
        {/* Dashboard - Uses DashboardHome directly (no MainLayout wrapper) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardHome />
            </ProtectedRoute>
          }
        />
        
        {/* Backup Page - Uses MainLayout for sidebar and header */}
        <Route
          path="/backup"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<div className="p-6 text-slate-600">Backup Page (Coming Soon)</div>} />
        </Route>
        
        {/* Recovery Page - Uses MainLayout for sidebar and header */}
        <Route
          path="/recovery"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<div className="p-6 text-slate-600">Recovery Page (Coming Soon)</div>} />
        </Route>
        
        {/* Settings Page - Uses MainLayout for sidebar and header */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<div className="p-6 text-slate-600">Settings Page (Coming Soon)</div>} />
        </Route>
        
        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      
      {/* Global Toast Notifications */}
      <Toast />
    </BrowserRouter>
  );
}

export default App;