import { useState, useContext } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Button,
  TextField,
  Typography,
  Grid,
  Paper,
  Link,
  IconButton,
  Box,
  Alert,
  Snackbar
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '@mui/material/styles';
import { ColorModeContext } from '../App';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const { register, authMessage, setAuthMessage } = useAuth();
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

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
      const response = await register({ email, password });
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
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', position: 'relative'}}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.background.default,
      }}>

        <Paper elevation={3} sx={{
          padding: 4,
          width: '100%',
          maxWidth: 400,
          backgroundColor: theme.palette.background.paper,
        }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Create Account
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
                  sx={{ 
                    maxWidth: 400,
                    backgroundColor: theme.palette.background.default 
                  }}
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
                  sx={{ 
                    maxWidth: 400,
                    backgroundColor: theme.palette.background.default 
                  }}
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
                  sx={{ 
                    maxWidth: 400,
                    backgroundColor: theme.palette.background.default 
                  }}
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
                  Register
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
          {authMessage || 'Registration successful'}
        </Alert>
      </Snackbar>
    </div>
  );
}