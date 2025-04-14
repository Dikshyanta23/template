// client/src/pages/admin/Payments.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ReceiptIcon from '@mui/icons-material/Receipt';
import axios from 'axios';

export default function AdminPayments() {
  const [tabValue, setTabValue] = useState(0);
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [formData, setFormData] = useState({
    session: '',
    amount: 0,
    type: 'student-payment', // or 'tutor-payment'
    paymentMethod: 'cash',
    notes: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchPayments();
    fetchSessions();
  }, []);

  useEffect(() => {
    if (payments.length > 0) {
      filterPaymentsByTab(tabValue);
    }
  }, [payments, tabValue]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/payments');
      setPayments(response.data.payments);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to load payments');
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await axios.get('/api/admin/sessions/active');
      setSessions(response.data.sessions);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
  };

  const filterPaymentsByTab = (tabIndex) => {
    let filtered = [];
    
    switch (tabIndex) {
      case 0: // All Payments
        filtered = payments;
        break;
      case 1: // Student Payments
        filtered = payments.filter(payment => payment.type === 'student-payment');
        break;
      case 2: // Tutor Payments
        filtered = payments.filter(payment => payment.type === 'tutor-payment');
        break;
      default:
        filtered = payments;
    }
    
    setFilteredPayments(filtered);
    setPage(0);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenCreateDialog = () => {
    setFormData({
      session: '',
      amount: 0,
      type: 'student-payment',
      paymentMethod: 'cash',
      notes: ''
    });
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
  };

  const handleOpenReceiptDialog = (payment) => {
    setSelectedPayment(payment);
    setReceiptDialogOpen(true);
  };

  const handleCloseReceiptDialog = () => {
    setReceiptDialogOpen(false);
    setSelectedPayment(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSessionChange = (e) => {
    const sessionId = e.target.value;
    const session = sessions.find(s => s._id === sessionId);
    
    if (session) {
      // Calculate remaining amount based on hours and rate
      const hoursRemaining = session.totalHours - session.hoursCompleted;
      const amountDue = hoursRemaining * session.hourlyRate;
      
      setFormData(prev => ({
        ...prev,
        session: sessionId,
        amount: amountDue
      }));
    }
  };

  const handleCreatePayment = async () => {
    try {
      const { session, amount, type, paymentMethod, notes } = formData;
      
      if (!session || amount <= 0 || !type || !paymentMethod) {
        setSnackbar({
          open: true,
          message: 'Please fill all required fields with valid values',
          severity: 'error'
        });
        return;
      }
      
      const response = await axios.post('/api/admin/payments', {
        session,
        amount,
        type,
        paymentMethod,
        notes
      });
      
      setPayments(prev => [...prev, response.data.payment]);
      
      setSnackbar({
        open: true,
        message: 'Payment recorded successfully',
        severity: 'success'
      });
      
      handleCloseCreateDialog();
    } catch (err) {
      console.error('Error recording payment:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to record payment',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
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
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Payment Management
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Record New Payment
        </Button>
      </Box>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="All Payments" />
          <Tab label="Student Payments" />
          <Tab label="Tutor Payments" />
        </Tabs>
      </Paper>
      
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayments
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell>
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {payment.type === 'student-payment' 
                        ? `${payment.session.student.name} - ${payment.session.course.title}`
                        : `${payment.session.tutor.name} - ${payment.session.course.title}`
                      }
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={payment.type === 'student-payment' ? 'Student Payment' : 'Tutor Payment'} 
                        color={payment.type === 'student-payment' ? 'primary' : 'secondary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>${payment.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      {payment.paymentMethod.charAt(0).toUpperCase() + payment.paymentMethod.slice(1)}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label="Completed" 
                        color="success"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        color="primary" 
                        size="small"
                        onClick={() => handleOpenReceiptDialog(payment)}
                      >
                        <ReceiptIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              
              {filteredPayments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No payments found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredPayments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      {/* Create Payment Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Record New Payment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="session-label">Session</InputLabel>
                <Select
                  labelId="session-label"
                  name="session"
                  value={formData.session}
                  onChange={handleSessionChange}
                  label="Session"
                  required
                >
                  {sessions.map((session) => (
                    <MenuItem key={session._id} value={session._id}>
                      {session.student.name} - {session.course.title} with {session.tutor.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="type-label">Payment Type</InputLabel>
                <Select
                  labelId="type-label"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  label="Payment Type"
                  required
                >
                  <MenuItem value="student-payment">Student Payment (Received)</MenuItem>
                  <MenuItem value="tutor-payment">Tutor Payment (Paid Out)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="method-label">Payment Method</InputLabel>
                <Select
                  labelId="method-label"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  label="Payment Method"
                  required
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="bank-transfer">Bank Transfer</MenuItem>
                  <MenuItem value="credit-card">Credit Card</MenuItem>
                  <MenuItem value="paypal">PayPal</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Amount ($)"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
                fullWidth
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancel</Button>
          <Button onClick={handleCreatePayment} variant="contained" color="primary">
            Record Payment
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Payment Receipt Dialog */}
      <Dialog
        open={receiptDialogOpen}
        onClose={handleCloseReceiptDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Payment Receipt</DialogTitle>
        <DialogContent>
          {selectedPayment && (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" align="center" gutterBottom>
                Payment Receipt
              </Typography>
              
              <Box sx={{ border: '1px solid #ddd', borderRadius: 1, p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Receipt ID:
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedPayment._id.substring(0, 8).toUpperCase()}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Date:
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {new Date(selectedPayment.createdAt).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      {selectedPayment.type === 'student-payment' ? 'Payment From:' : 'Payment To:'}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedPayment.type === 'student-payment' 
                        ? selectedPayment.session.student.name
                        : selectedPayment.session.tutor.name
                      }
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Session:
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedPayment.session.course.title}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Amount:
                    </Typography>
                    <Typography variant="h6" gutterBottom color="primary">
                      ${selectedPayment.amount.toFixed(2)}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Payment Method:
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedPayment.paymentMethod.charAt(0).toUpperCase() + selectedPayment.paymentMethod.slice(1)}
                    </Typography>
                  </Grid>
                  
                  {selectedPayment.notes && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Notes:
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {selectedPayment.notes}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
              
              <Typography variant="body2" align="center" color="text.secondary">
                Thank you for your business!
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReceiptDialog}>Close</Button>
          <Button variant="contained" color="primary">
            Print Receipt
          </Button>
        </DialogActions>
      </Dialog>
      
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