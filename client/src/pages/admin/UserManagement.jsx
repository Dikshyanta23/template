// client/src/pages/admin/UserManagement.jsx
import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Avatar,
  Grid,
  FormHelperText
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    email: '',
    role: '',
    verified: false,
    profilePhoto: '',
    courses: []
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, coursesRes] = await Promise.all([
        axios.get('/api/users'),
        axios.get('/api/courses')
      ]);
      
      setUsers(usersRes.data.users);
      setCourses(coursesRes.data.courses);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyUser = async (userId, verified) => {
    try {
      await axios.put(`/api/users/${userId}/verify`, { verified });
      
      setUsers(prev => 
        prev.map(user => 
          user._id === userId ? { ...user, verified } : user
        )
      );
      
      setSnackbar({
        open: true,
        message: `User ${verified ? 'verified' : 'unverified'} successfully`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Error updating user:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to update user. Please try again.',
        severity: 'error'
      });
    }
  };
  
  const handleOpenDialog = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        email: user.email,
        role: user.role,
        verified: user.verified,
        profilePhoto: user.profilePhoto || '',
        courses: user.courses?.map(c => c._id) || []
      });
    } else {
      setSelectedUser(null);
      setFormData({
        email: '',
        role: 'student',
        verified: false,
        profilePhoto: '',
        courses: []
      });
    }
    
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  const handleOpenDeleteDialog = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleCoursesChange = (e) => {
    setFormData(prev => ({ ...prev, courses: e.target.value }));
  };
  
  const handleSubmit = async () => {
    try {
      if (selectedUser) {
        // Update existing user
        const userData = {
          role: formData.role,
          verified: formData.verified,
          profilePhoto: formData.profilePhoto
        };
        
        await axios.put(`/api/users/${selectedUser._id}`, userData);
        
        // If user is a tutor, update their courses
        if (formData.role === 'tutor') {
          await axios.put(`/api/users/${selectedUser._id}/courses`, {
            courseIds: formData.courses
          });
        }
        
        // Update local state
        setUsers(prev => 
          prev.map(user => 
            user._id === selectedUser._id 
              ? { 
                  ...user, 
                  ...userData,
                  courses: formData.role === 'tutor' 
                    ? courses.filter(c => formData.courses.includes(c._id))
                    : []
                } 
              : user
          )
        );
        
        setSnackbar({
          open: true,
          message: 'User updated successfully',
          severity: 'success'
        });
      } else {
        // Create new user
        const { data } = await axios.post('/api/users', formData);
        
        // If user is a tutor, update their courses
        if (formData.role === 'tutor' && formData.courses.length > 0) {
          await axios.put(`/api/users/${data.user._id}/courses`, {
            courseIds: formData.courses
          });
        }
        
        // Add new user to local state
        setUsers(prev => [
          ...prev, 
          { 
            ...data.user,
            courses: formData.role === 'tutor' 
              ? courses.filter(c => formData.courses.includes(c._id))
              : []
          }
        ]);
        
        setSnackbar({
          open: true,
          message: 'User created successfully',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving user:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to save user. Please try again.',
        severity: 'error'
      });
    }
  };
  
  const handleDelete = async () => {
    try {
      await axios.delete(`/api/users/${selectedUser._id}`);
      
      setUsers(prev => prev.filter(user => user._id !== selectedUser._id));
      
      setSnackbar({
        open: true,
        message: 'User deleted successfully',
        severity: 'success'
      });
      
      handleCloseDeleteDialog();
    } catch (err) {
      console.error('Error deleting user:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to delete user. Please try again.',
        severity: 'error'
      });
    }
  };
  
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography color="error" align="center">{error}</Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5">
          User Management
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => handleOpenDialog()}
        >
          Add New User
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Courses</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2 }}>
                      {user.profilePhoto ? (
                        <img 
                          src={user.profilePhoto} 
                          alt={user.email} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <PersonIcon />
                      )}
                    </Avatar>
                    <Typography>{user.email}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={user.role.charAt(0).toUpperCase() + user.role.slice(1)} 
                    color={
                      user.role === 'admin' 
                        ? 'secondary' 
                        : user.role === 'tutor' 
                          ? 'primary' 
                          : 'default'
                    }
                    variant={user.role === 'student' ? 'outlined' : 'filled'}
                  />
                </TableCell>
                <TableCell>
                  {user.verified ? (
                    <Chip 
                      icon={<CheckCircleIcon />} 
                      label="Verified" 
                      color="success" 
                      variant="outlined"
                    />
                  ) : (
                    <Chip 
                      icon={<CancelIcon />} 
                      label="Unverified" 
                      color="warning" 
                      variant="outlined"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {user.role === 'tutor' && user.courses && user.courses.length > 0 ? (
                    <Box>
                      {user.courses.slice(0, 2).map((course, i) => (
                        <Chip 
                          key={i} 
                          label={course.title} 
                          size="small" 
                          sx={{ mr: 0.5, mb: 0.5 }} 
                        />
                      ))}
                      {user.courses.length > 2 && (
                        <Chip 
                          label={`+${user.courses.length - 2} more`} 
                          size="small" 
                          variant="outlined" 
                        />
                      )}
                    </Box>
                  ) : user.role === 'tutor' ? (
                    <Typography variant="body2" color="text.secondary">
                      No courses assigned
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      N/A
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="center">
                  {!user.verified ? (
                    <Button 
                      variant="outlined" 
                      color="success" 
                      size="small" 
                      onClick={() => handleVerifyUser(user._id, true)}
                      sx={{ mr: 1 }}
                    >
                      Verify
                    </Button>
                  ) : (
                    <Button 
                      variant="outlined" 
                      color="warning" 
                      size="small" 
                      onClick={() => handleVerifyUser(user._id, false)}
                      sx={{ mr: 1 }}
                    >
                      Unverify
                    </Button>
                  )}
                  
                  <IconButton 
                    color="primary" 
                    onClick={() => handleOpenDialog(user)}
                    title="Edit User"
                  >
                    <EditIcon />
                  </IconButton>
                  
                  {user.role !== 'admin' && (
                    <IconButton 
                      color="error" 
                      onClick={() => handleOpenDeleteDialog(user)}
                      title="Delete User"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    No users found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* User Form Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!!selectedUser}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    label="Role"
                  >
                    <MenuItem value="student">Student</MenuItem>
                    <MenuItem value="tutor">Tutor</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Profile Photo URL"
                  name="profilePhoto"
                  value={formData.profilePhoto}
                  onChange={handleInputChange}
                  helperText="Enter a URL for the user's profile photo (optional)"
                />
              </Grid>
              
              {formData.role === 'tutor' && (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Assign Courses</InputLabel>
                    <Select
                      multiple
                      name="courses"
                      value={formData.courses}
                      onChange={handleCoursesChange}
                      label="Assign Courses"
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const course = courses.find(c => c._id === value);
                            return (
                              <Chip 
                                key={value} 
                                label={course ? course.title : value} 
                              />
                            );
                          })}
                        </Box>
                      )}
                    >
                      {courses.map((course) => (
                        <MenuItem key={course._id} value={course._id}>
                          {course.title}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      Select courses this tutor will teach
                    </FormHelperText>
                  </FormControl>
                </Grid>
              )}
              
              {!selectedUser && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    A random password will be generated for the new user. They can reset it later.
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedUser ? 'Update User' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the user "{selectedUser?.email}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}