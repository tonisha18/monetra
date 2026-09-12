import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { AppLayout } from './layouts/AppLayout.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Transactions } from './pages/Transactions.jsx';
import { AIFinSight } from './pages/AIFinSight.jsx';
import { Profile } from './pages/Profile.jsx';
import { LoadingSpinner } from './components/LoadingSpinner.jsx';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, session, isDemoMode, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage message="Authenticating session..." />;
  }

  const isAuthenticated = Boolean(
    (user && session?.access_token) || (user && isDemoMode)
  );

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public only route (redirects authenticated users to dashboard)
const PublicOnlyRoute = ({ children }) => {
  const { user, session, isDemoMode, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage message="Verifying session..." />;
  }

  const isAuthenticated = Boolean(
    (user && session?.access_token) || (user && isDemoMode)
  );

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            }
          />

          {/* Protected Application Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="ai-finsight" element={<AIFinSight />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Fallback Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
