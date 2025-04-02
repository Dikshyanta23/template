// client/src/pages/admin/AdminPanel.jsx
import { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Tabs, 
  Tab,
  Button
} from '@mui/material';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

export default function AdminPanel() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    if (location.pathname.includes('/users')) return 0;
    if (location.pathname.includes('/courses')) return 1;
    if (location.pathname.includes('/enquiries')) return 2;
    return 0;
  });
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    
    switch (newValue) {
      case 0:
        navigate('/admin/users');
        break;
      case 1:
        navigate('/admin/courses');
        break;
      case 2:
        navigate('/admin/enquiries');
        break;
      default:
        navigate('/admin');
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Admin Panel
      </Typography>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          centered
          variant="fullWidth"
        >
          <Tab label="User Management" />
          <Tab label="Course Management" />
          <Tab label="Enquiries" />
        </Tabs>
      </Paper>
      
      <Outlet />
    </Container>
  );
}