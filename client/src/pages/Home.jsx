import { Button, Typography, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, logout } = useAuth();

  const buttons = [
    { text: 'Browse courses', path: '/courses' },
    { text: 'Join us as a tutor', path: '/tutor-application' },
    { text: 'Talk to us', path: '/contact' },
    { text: user ? 'Dashboard' : 'Login/Register', path: user ? '/dashboard' : '/login' }
  ];

  return (
    <div style={{ 
      minHeight: '100vh',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <Typography variant="h1" gutterBottom sx={{ mt: 15, mb: 8 }}>
        Welcome to Tutors
      </Typography>

      <Grid container spacing={4} justifyContent="center" sx={{ maxWidth: 1200 }}>
        {buttons.map((btn, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Button
              component={Link}
              to={btn.path}
              fullWidth
              variant="outlined"
              sx={{
                height: 200,
                borderRadius: 2,
                borderWidth: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              <Typography variant="h6" component="div">
                {btn.text}
              </Typography>
            </Button>
          </Grid>
        ))}
      </Grid>

      {user && (
        <Typography variant="body1" sx={{ mt: 4 }}>
          Logged in as {user.email} | 
          <Button onClick={logout} color="inherit">
            Logout
          </Button>
        </Typography>
      )}
    </div>
  );
}