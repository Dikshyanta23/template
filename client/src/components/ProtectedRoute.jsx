import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box, Typography, Paper, Container, Button } from '@mui/material';

export default function ProtectedRoute({ adminOnly }) {
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
  
  // Check if user is verified
  if (!user.verified && user.role !== 'admin') {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Account Pending Verification
          </Typography>
          <Typography variant="body1" paragraph>
            Your account is currently awaiting verification by an administrator.
          </Typography>
          <Typography variant="body1" paragraph>
            You'll be able to access the full features of the application once your account has been verified.
          </Typography>
          <Typography variant="body2" sx={{ mt: 3, color: 'text.secondary' }}>
            Please check back later or contact support if you have any questions.
          </Typography>
        </Paper>
      </Container>
    );
  }
  
  return <Outlet />;
}