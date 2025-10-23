import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const PrivateRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check if user has required role
  if (roles.length > 0 && !roles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on user role
    const roleDashboards = {
      admin: '/admin/dashboard',
      agent: '/agent/dashboard',
      customer: '/customer/dashboard'
    };

    return <Navigate to={roleDashboards[user?.role] || '/'} />;
  }

  return children;
};

export default PrivateRoute;