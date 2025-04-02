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

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const { login, authMessage, setAuthMessage } = useAuth();

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

    try {
      const response = await login({ email, password });
      setShowSuccess(true);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    }
  };

  const handleCloseSnackbar = () => {
    setShowSuccess(false);
    setAuthMessage('');
  };

  return (
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', position: 'relative'}}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Paper elevation={3} sx={{
          padding: 4,
          width: '100%',
          maxWidth: 400,
        }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Welcome Back
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
                  Login
                </Button>
              </Grid>

              <Grid item xs={12} container justifyContent="space-between" sx={{ mt: 2 }}>
                <Link 
                  component={RouterLink} 
                  to="/register" 
                  color="textSecondary"
                  sx={{ textAlign: 'center', width: '100%' }}
                >
                  Don't have an account? Create one
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
          {authMessage || 'Login successful'}
        </Alert>
      </Snackbar>
    </div>
  );
}