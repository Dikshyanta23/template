// ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box, Typography, Paper, Container } from '@mui/material';

export default function ProtectedRoute({ children, adminOnly = false, tutorOnly = false }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Check if user exists
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Check if admin route and user is not admin
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  // Check if tutor route and user is not tutor
  if (tutorOnly && user.role !== 'tutor') {
    return <Navigate to="/dashboard" />;
  }
  
  // Return the children instead of Outlet
  return children;
}