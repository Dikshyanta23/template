// Dashboard.jsx
import { useAuth } from '../context/AuthContext';
import StudentDashboard from './student/StudentDashboard';
import TutorDashboard from './tutor/TutorDashboard';
import AdminLayout from './admin/AdminLayout';
import { Box, CircularProgress, Typography, Container, Paper } from '@mui/material';

export default function Dashboard() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Authentication Required
          </Typography>
          <Typography variant="body1">
            Please log in to access your dashboard.
          </Typography>
        </Paper>
      </Container>
    );
  }
  
  // Render the appropriate dashboard based on user role
  if (user.role === 'admin') {
    return <AdminLayout />;
  } else if (user.role === 'tutor') {
    return (
      <TutorDashboard />
    );
  } else {
    return (
      <StudentDashboard />
    );
  }
}