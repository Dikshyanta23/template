import { useAuth } from '../context/AuthContext';
import { Button, Typography, Box, Paper, Container, Chip } from '@mui/material';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="body1" sx={{ mr: 2 }}>
            Welcome, {user?.email}!
          </Typography>
          <Chip 
            label={user?.role} 
            color={user?.role === 'admin' ? 'primary' : 'default'}
            size="small"
            sx={{ mr: 1 }}
          />
          {user?.role !== 'admin' && (
            <Chip 
              label={user?.verified ? 'Verified' : 'Pending Verification'} 
              color={user?.verified ? 'success' : 'warning'}
              size="small"
            />
          )}
        </Box>
        <Typography variant="body1" paragraph>
          You are now logged in to the application.
        </Typography>
        {user?.role === 'admin' && (
          <Box sx={{ mt: 2, mb: 3 }}>
            <Button 
              variant="contained" 
              color="primary" 
              component="a"
              href="/admin"
              sx={{ mr: 2 }}
            >
              Admin Panel
            </Button>
          </Box>
        )}
        <Box sx={{ mt: 3 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={logout}
          >
            Logout
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}