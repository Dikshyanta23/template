import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Button, 
  Typography, 
  Box, 
  Paper, 
  Container, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios';

export default function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/users', { withCredentials: true });
      setUsers(data.users);
    } catch (err) {
      console.error('Error fetching users:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load users',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId) => {
    try {
      await axios.put(`/api/users/${userId}/verify`, { verified: true }, { withCredentials: true });
      setUsers(users.map(u => u._id === userId ? { ...u, verified: true } : u));
      setSnackbar({
        open: true,
        message: 'User verified successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error verifying user:', err);
      setSnackbar({
        open: true,
        message: 'Failed to verify user',
        severity: 'error'
      });
    }
  };

  const handleRevokeVerification = async (userId) => {
    try {
      await axios.put(`/api/users/${userId}/verify`, { verified: false }, { withCredentials: true });
      setUsers(users.map(u => u._id === userId ? { ...u, verified: false } : u));
      setSnackbar({
        open: true,
        message: 'User verification revoked',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error revoking verification:', err);
      setSnackbar({
        open: true,
        message: 'Failed to revoke verification',
        severity: 'error'
      });
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await axios.put(`/api/users/${userId}/role`, { role: newRole }, { withCredentials: true });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      setSnackbar({
        open: true,
        message: `User role changed to ${newRole}`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Error changing role:', err);
      setSnackbar({
        open: true,
        message: 'Failed to change user role',
        severity: 'error'
      });
    }
  };

  const openDialog = (user, action) => {
    setSelectedUser(user);
    setDialogAction(action);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleDialogConfirm = async () => {
    if (!selectedUser) return;

    switch (dialogAction) {
      case 'verify':
        await handleVerifyUser(selectedUser._id);
        break;
      case 'revoke':
        await handleRevokeVerification(selectedUser._id);
        break;
      case 'makeAdmin':
        await handleChangeRole(selectedUser._id, 'admin');
        break;
      case 'removeAdmin':
        await handleChangeRole(selectedUser._id, 'student');
        break;
      default:
        break;
    }

    setDialogOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Panel
        </Typography>
        <Typography variant="body1" paragraph>
          Welcome, {user?.email}!
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            User Management
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role} 
                          color={user.role === 'admin' ? 'primary' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.verified ? 'Verified' : 'Pending'} 
                          color={user.verified ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="center">
                        {!user.verified ? (
                          <IconButton 
                            color="success" 
                            onClick={() => openDialog(user, 'verify')}
                            title="Verify User"
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        ) : (
                          <IconButton 
                            color="warning" 
                            onClick={() => openDialog(user, 'revoke')}
                            title="Revoke Verification"
                          >
                            <BlockIcon />
                          </IconButton>
                        )}
                        
                        {user.role !== 'admin' ? (
                          <IconButton 
                            color="primary" 
                            onClick={() => openDialog(user, 'makeAdmin')}
                            title="Make Admin"
                          >
                            <SupervisorAccountIcon />
                          </IconButton>
                        ) : user._id !== user._id && ( // Don't allow removing admin from self
                          <IconButton 
                            color="default" 
                            onClick={() => openDialog(user, 'removeAdmin')}
                            title="Remove Admin"
                          >
                            <PersonIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
      >
        <DialogTitle>
          {dialogAction === 'verify' ? 'Verify User' : 
           dialogAction === 'revoke' ? 'Revoke Verification' :
           dialogAction === 'makeAdmin' ? 'Make User Admin' : 'Remove Admin Role'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogAction === 'verify' && `Are you sure you want to verify ${selectedUser?.email}?`}
            {dialogAction === 'revoke' && `Are you sure you want to revoke verification for ${selectedUser?.email}?`}
            {dialogAction === 'makeAdmin' && `Are you sure you want to make ${selectedUser?.email} an admin?`}
            {dialogAction === 'removeAdmin' && `Are you sure you want to remove admin role from ${selectedUser?.email}?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleDialogConfirm} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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
    </Container>
  );
}