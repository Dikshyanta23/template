
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Button,
  TextField,
  Typography,
  Grid,
  Paper,
  Link,
  Box,
  Alert,
  Snackbar
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function TutorRegister() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const { registerTutor, authMessage, setAuthMessage } = useAuth();

  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await registerTutor({ email, password });
      setShowSuccess(true);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  const handleCloseSnackbar = () => {
    setShowSuccess(false);
    setAuthMessage('');
  };

  return (
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100%', padding: '2rem 0'}}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
      }}>
        <Paper elevation={3} sx={{
          padding: 4,
          width: '100%',
          maxWidth: 400,
        }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Register as a Tutor
          </Typography>
          
          <Typography variant="body2" paragraph align="center" sx={{ mb: 3 }}>
            Join our platform as a tutor and share your knowledge with students worldwide.
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                <TextField
                  fullWidth
                  label="Email"
                  variant="outlined"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                <TextField
                  fullWidth
                  label="Password"
                  variant="outlined"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  variant="outlined"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Grid>

              {error && (
                <Grid item xs={12} sx={{ textAlign: 'center' }}>
                  <Typography color="error">{error}</Typography>
                </Grid>
              )}

              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  type="submit"
                  sx={{
                    py: 2,
                    px: 6,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4
                    }
                  }}
                >
                  Register as Tutor
                </Button>
              </Grid>

              <Grid item xs={12} container justifyContent="space-between" sx={{ mt: 2 }}>
                <Link 
                  component={RouterLink} 
                  to="/login" 
                  color="textSecondary"
                  sx={{ textAlign: 'center', width: '100%' }}
                >
                  Already have an account? Login
                </Link>
              </Grid>
              
              <Grid item xs={12} container justifyContent="space-between">
                <Link 
                  component={RouterLink} 
                  to="/register" 
                  color="textSecondary"
                  sx={{ textAlign: 'center', width: '100%' }}
                >
                  Want to register as a student instead?
                </Link>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>

      <Snackbar 
        open={showSuccess} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {authMessage || 'Tutor registration successful! Your account is pending verification by an admin.'}
        </Alert>
      </Snackbar>
    </div>
  );
}