import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Button,
  TextField,
  Typography,
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

  // Add effect to clear error message after 2 seconds
  useEffect(() => {
    let timer;
    if (error) {
      timer = setTimeout(() => {
        setError('');
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [error]);

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
    <div style={{
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      width: '100vw', 
      position: 'relative'
    }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '400px',
      }}>
        <Paper elevation={3} sx={{
          padding: 4,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" marginBottom={2}>
            Welcome Back
          </Typography>
          
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              width: '100%',
              gap: 2 // Reduced from 3 to bring elements closer
            }}>
              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ 
                  width: '100%', 
                  maxWidth: '300px',
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'grey.100', // Original grey background
                  }
                }}
              />
              
              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ 
                  width: '100%', 
                  maxWidth: '300px',
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'grey.100', // Original grey background
                  }
                }}
              />

              {/* Error message container with reduced height */}
              <Box sx={{ 
                minHeight: '2px', // Slightly reduced
                width: '100%',
                textAlign: 'center',
                mb: 0 // Removed bottom margin
              }}>
                {error && (
                  <Typography color="error" variant="body2">
                    {error}
                  </Typography>
                )}
              </Box>

              <Button
                variant="contained"
                size="large"
                type="submit"
                sx={{
                  py: 1,
                  px: 4,
                  borderRadius: 2,
                  mt: 0, // Small top margin
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  }
                }}
              >
                Login
              </Button>

              <Box sx={{ width: '100%', textAlign: 'center', mt: 2 }}>
                <Link 
                  component={RouterLink} 
                  to="/register" 
                  color="textSecondary"
                >
                  Don't have an account? Create one
                </Link>
              </Box>
            </Box>
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