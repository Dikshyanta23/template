// client/src/pages/admin/UserDetails.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  MenuItem
} from '@mui/material';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function UserDetails() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    phone: '',
  });
  const [passwordData, setPasswordData] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/users/${userId}`);
      const fetchedUser = response.data.user;
  
      // Ensure the role is one of the valid options
      const validRoles = ['student', 'tutor', 'admin'];
      const sanitizedRole = validRoles.includes(fetchedUser.role)
        ? fetchedUser.role
        : 'student'; // Default to 'student' if invalid
  
      setUser(fetchedUser);
      setFormData({
        name: fetchedUser.name,
        email: fetchedUser.email,
        role: sanitizedRole, // Use sanitized role
        phone: fetchedUser.phone || '',
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError('Failed to load user details');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData(e.target.value);
  };

  const handleUpdateDetails = async () => {
    try {
      const response = await axios.put(`/api/admin/users/details/${userId}`, formData);
      setUser(response.data.user);
      setSnackbar({
        open: true,
        message: 'User details updated successfully',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error updating user details:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update user details',
        severity: 'error',
      });
    }
  };

  const handleUpdatePassword = async () => {
    try {
      if (!passwordData) {
        return setSnackbar({
          open: true,
          message: 'Password cannot be empty',
          severity: 'error',
        });
      }
      await axios.put(`/api/admin/users/password/${userId}`, { password: passwordData });
      setSnackbar({
        open: true,
        message: 'Password updated successfully',
        severity: 'success',
      });
      setPasswordData('');
    } catch (err) {
      console.error('Error updating user password:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update user password',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        User Details
      </Typography>
      <Paper sx={{ p: 3 }}>
        {/* Display basic details */}
        <Typography variant="h6">Basic Information</Typography>
        <TextField
          label="Name"
          name="name"
          value={formData.name}
          fullWidth
          margin="normal"
          onChange={handleInputChange}
        />
        <TextField
          label="Email"
          name="email"
          value={formData.email}
          fullWidth
          margin="normal"
          onChange={handleInputChange}
        />
<TextField
  select
  label="Role"
  name="role"
  value={formData.role}
  fullWidth
  margin="normal"
  onChange={handleInputChange}
>
  <MenuItem value="student">Student</MenuItem>
  <MenuItem value="tutor">Tutor</MenuItem>
  <MenuItem value="admin">Admin</MenuItem>
</TextField>
        <TextField
          label="Phone Number"
          name="phone"
          value={formData.phone}
          fullWidth
          margin="normal"
          onChange={handleInputChange}
        />
        <Button variant="contained" color="primary" onClick={handleUpdateDetails}>
          Save Changes
        </Button>

        {/* Change Password Section */}
        <Typography variant="h6" sx={{ mt: 3 }}>
          Change Password
        </Typography>
        <TextField
          label="New Password"
          type="password"
          value={passwordData}
          fullWidth
          margin="normal"
          onChange={handlePasswordChange}
        />
        <Button variant="contained" color="secondary" onClick={handleUpdatePassword}>
          Update Password
        </Button>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}