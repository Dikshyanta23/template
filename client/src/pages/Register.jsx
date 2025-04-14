import { useState, useContext, useEffect } from 'react';
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
import { useTheme } from '@mui/material/styles';
import { ColorModeContext } from '../App';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const { register, authMessage, setAuthMessage } = useAuth();
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

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

  const isValidName = (name) => {
    const re = /^(?=.*\s).{2,}$/; // At least two distinct words with a space
    return re.test(name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    if (!isValidName(name)) {
      setError('Please enter a valid name with at least two words.');
      return;
    }

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
      const response = await register({ name, email, password });
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
            Register
          </Typography>
          
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              width: '100%',
              gap: 2
            }}>
              <TextField
                fullWidth
                label="Name"
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={{ 
                  width: '100%', 
                  maxWidth: '300px',
                  '& .MuiOutlinedInput-root': {
                    bgcolor: theme.palette.mode === 'dark' ? '#1a1a1a' : 'grey.100',
                    '& input': {
                      color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                    },
                    '& label': {
                      color: theme.palette.mode === 'dark' ? '#ffffff' : 'rgba(0, 0, 0, 0.6)',
                    },
                  }
                }}
              />

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
                    bgcolor: theme.palette.mode === 'dark' ? '#1a1a1a' : 'grey.100',
                    '& input': {
                      color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                    },
                    '& label': {
                      color: theme.palette.mode === 'dark' ? '#ffffff' : 'rgba(0, 0, 0, 0.6)',
                    },
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
                    bgcolor: theme.palette.mode === 'dark' ? '#1a1a1a' : 'grey.100',
                    '& input': {
                      color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                    },
                    '& label': {
                      color: theme.palette.mode === 'dark' ? '#ffffff' : 'rgba(0, 0, 0, 0.6)',
                    },
                  }
                }}
              />

              <TextField
                fullWidth
                label="Confirm Password"
                variant="outlined"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{ 
                  width: '100%', 
                  maxWidth: '300px',
                  '& .MuiOutlinedInput-root': {
                    bgcolor: theme.palette.mode === 'dark' ? '#1a1a1a' : 'grey.100',
                    '& input': {
                      color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
                    },
                    '& label': {
                      color: theme.palette.mode === 'dark' ? '#ffffff' : 'rgba(0, 0, 0, 0.6)',
                    },
                  }
                }}
              />

              {/* Error message container */}
              <Box sx={{ 
                minHeight: '2px',
                width: '100%',
                textAlign: 'center',
                mb: 0
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
                  mt: 0,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  }
                }}
              >
                Register
              </Button>

              <Box sx={{ width: '100%', textAlign: 'center', mt: 2 }}>
                <Link 
                  component={RouterLink} 
                  to="/tutor-application" 
                  color="textSecondary"
                >
                  Want to register as a tutor instead?
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
          {authMessage || 'Registration successful'}
        </Alert>
      </Snackbar>
    </div>
  );
}