// client/src/components/Layout.jsx
import { useContext } from 'react';
import { Box, IconButton, AppBar, Toolbar, Typography, Button } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '@mui/material/styles';
import { ColorModeContext } from '../App';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const { user, logout, isAdmin } = useAuth();

  return (
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', position: 'relative'}}>
    <Box sx={{
        minHeight: '100vh',
        width: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.palette.background.default,
      color: theme.palette.text.primary
    }}>
      <AppBar position="static" color="transparent" elevation={1}>
        <Toolbar>
          <Typography 
            variant="h6" 
            component={Link} 
            to="/" 
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            Tutors
          </Typography>
          
          {user ? (
            <>
              <Button color="inherit" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
            </>
          )}
          
          <IconButton 
            onClick={colorMode.toggleColorMode} 
            color="inherit"
            sx={{ ml: 1 }}
          >
            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      
      <Box component="footer" sx={{ 
        py: 3, 
        textAlign: 'center',
        borderTop: `1px solid ${theme.palette.divider}`
      }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Tutors. All rights reserved.
        </Typography>
      </Box>
    </Box>
    </div>
  );
}