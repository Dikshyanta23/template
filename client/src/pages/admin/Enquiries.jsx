// client/src/pages/admin/Enquiries.jsx
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';

export default function AdminEnquiries() {
  const [tabValue, setTabValue] = useState(0);
  const [enquiries, setEnquiries] = useState([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchEnquiries();
  }, []);

  useEffect(() => {
    if (enquiries.length > 0) {
      filterEnquiriesByTab(tabValue);
    }
  }, [enquiries, tabValue]);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/enquiries');
      setEnquiries(response.data.enquiries);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching enquiries:', err);
      setError('Failed to load enquiries');
      setLoading(false);
    }
  };

  const filterEnquiriesByTab = (tabIndex) => {
    let filtered = [];
    
    switch (tabIndex) {
      case 0: // All Enquiries
        filtered = enquiries;
        break;
      case 1: // Pending Enquiries
        filtered = enquiries.filter(enquiry => enquiry.status === 'pending');
        break;
      case 2: // Completed Enquiries
        filtered = enquiries.filter(enquiry => enquiry.status === 'completed');
        break;
      default:
        filtered = enquiries;
    }
    
    setFilteredEnquiries(filtered);
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

  const handleOpenViewDialog = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setResponseText(enquiry.response || '');
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedEnquiry(null);
    setResponseText('');
  };

  const handleResponseChange = (e) => {
    setResponseText(e.target.value);
  };

  const handleMarkAsCompleted = async (enquiryId, withResponse = false) => {
    try {
      const data = { status: 'completed' };
      
      if (withResponse && responseText) {
        data.response = responseText;
      }
      
      const response = await axios.put(`/api/admin/enquiries/${enquiryId}`, data);
      
      setEnquiries(prev => prev.map(enquiry => 
        enquiry._id === enquiryId ? response.data.enquiry : enquiry
      ));
      
      setSnackbar({
        open: true,
        message: 'Enquiry marked as completed',
        severity: 'success'
      });
      
      if (withResponse) {
        handleCloseViewDialog();
      }
    } catch (err) {
      console.error('Error updating enquiry:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update enquiry',
        severity: 'error'
      });
    }
  };

  const handleSendResponse = async () => {
    if (!responseText.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a response',
        severity: 'error'
      });
      return;
    }
    
    await handleMarkAsCompleted(selectedEnquiry._id, true);
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
      <Typography variant="h4" gutterBottom>
        Enquiry Management
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="All Enquiries" />
          <Tab label="Pending Enquiries" />
          <Tab label="Completed Enquiries" />
        </Tabs>
      </Paper>
      
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEnquiries
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((enquiry) => (
                  <TableRow key={enquiry._id}>
                    <TableCell>
                      {new Date(enquiry.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{enquiry.name}</TableCell>
                    <TableCell>{enquiry.email}</TableCell>
                    <TableCell>{enquiry.subject}</TableCell>
                    <TableCell>
                      <Chip 
                        label={enquiry.status === 'pending' ? 'Pending' : 'Completed'} 
                        color={enquiry.status === 'pending' ? 'warning' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        color="primary" 
                        size="small"
                        onClick={() => handleOpenViewDialog(enquiry)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      
                      {enquiry.status === 'pending' && (
                        <IconButton 
                          color="success" 
                          size="small"
                          onClick={() => handleMarkAsCompleted(enquiry._id)}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              
              {filteredEnquiries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No enquiries found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredEnquiries.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      {/* View Enquiry Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Enquiry Details</DialogTitle>
        <DialogContent>
          {selectedEnquiry && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedEnquiry.name}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedEnquiry.email}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedEnquiry.phone || 'Not provided'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Date Submitted
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {new Date(selectedEnquiry.createdAt).toLocaleString()}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Subject
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedEnquiry.subject}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Message
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, mt: 1, mb: 2, bgcolor: '#f9f9f9' }}>
                  <Typography variant="body1">
                    {selectedEnquiry.message}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Response
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={responseText}
                  onChange={handleResponseChange}
                  placeholder="Enter your response here..."
                  disabled={selectedEnquiry.status === 'completed'}
                />
              </Grid>
              
              {selectedEnquiry.status === 'completed' && selectedEnquiry.response && (
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    This enquiry has been marked as completed with a response.
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
          {selectedEnquiry && selectedEnquiry.status === 'pending' && (
            <>
              <Button 
                onClick={() => handleMarkAsCompleted(selectedEnquiry._id)}
                color="success"
              >
                Mark as Completed
              </Button>
              <Button 
                onClick={handleSendResponse} 
                variant="contained" 
                color="primary"
              >
                Send Response & Complete
              </Button>
            </>
          )}
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