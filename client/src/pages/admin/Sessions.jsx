// client/src/pages/admin/Sessions.jsx
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
  MenuItem,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  Autocomplete
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import RestoreIcon from '@mui/icons-material/Restore';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

export default function AdminSessions() {
  const [tabValue, setTabValue] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    student: '',
    tutor: '',
    course: '',
    totalHours: 10,
    hourlyRate: 50,
    startDate: '',
    notes: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchSessions();
    fetchStudents();
    fetchTutors();
    fetchCourses();
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      filterSessionsByTab(tabValue);
    }
  }, [sessions, tabValue]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/sessions');
      setSessions(response.data.sessions);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load sessions');
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/admin/students');
      setStudents(response.data.students);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const fetchTutors = async () => {
    try {
      const response = await axios.get('/api/admin/tutors');
      setTutors(response.data.tutors);
    } catch (err) {
      console.error('Error fetching tutors:', err);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/admin/courses');
      setCourses(response.data.courses);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const filterSessionsByTab = (tabIndex) => {
    let filtered = [];
    
    switch (tabIndex) {
      case 0: // Active Sessions
        filtered = sessions.filter(session => session.status === 'active');
        break;
      case 1: // Completed Sessions
        filtered = sessions.filter(session => session.status === 'completed');
        break;
      case 2: // Cancelled Sessions
        filtered = sessions.filter(session => session.status === 'cancelled');
        break;
      default:
        filtered = sessions.filter(session => session.status === 'active');
    }
    
    setFilteredSessions(filtered);
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
      student: '',
      tutor: '',
      course: '',
      totalHours: 10,
      hourlyRate: 50,
      startDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
  };

  const handleOpenEditDialog = (session) => {
    setSelectedSession(session);
    setFormData({
      student: session.student._id,
      tutor: session.tutor._id,
      course: session.course._id,
      totalHours: session.totalHours,
      hourlyRate: session.hourlyRate,
      startDate: new Date(session.startDate).toISOString().split('T')[0],
      notes: session.notes || ''
    });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedSession(null);
  };

  const handleOpenCancelDialog = (session) => {
    setSelectedSession(session);
    setCancelDialogOpen(true);
  };

  const handleCloseCancelDialog = () => {
    setCancelDialogOpen(false);
    setSelectedSession(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateSession = async () => {
    try {
      const { student, tutor, course, totalHours, hourlyRate, startDate, notes } = formData;
      
      if (!student || !tutor || !course || !totalHours || !hourlyRate || !startDate) {
        setSnackbar({
          open: true,
          message: 'Please fill all required fields',
          severity: 'error'
        });
        return;
      }
      
      const response = await axios.post('/api/admin/sessions', {
        student,
        tutor,
        course,
        totalHours,
        hourlyRate,
        startDate,
        notes
      });
      
      setSessions(prev => [...prev, response.data.session]);
      
      setSnackbar({
        open: true,
        message: 'Session created successfully',
        severity: 'success'
      });
      
      handleCloseCreateDialog();
    } catch (err) {
      console.error('Error creating session:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to create session',
        severity: 'error'
      });
    }
  };

  const handleUpdateSession = async () => {
    try {
      const { student, tutor, course, totalHours, hourlyRate, startDate, notes } = formData;
      
      if (!student || !tutor || !course || !totalHours || !hourlyRate || !startDate) {
        setSnackbar({
          open: true,
          message: 'Please fill all required fields',
          severity: 'error'
        });
        return;
      }
      
      const response = await axios.put(`/api/admin/sessions/${selectedSession._id}`, {
        student,
        tutor,
        course,
        totalHours,
        hourlyRate,
        startDate,
        notes
      });
      
      setSessions(prev => prev.map(session => 
        session._id === selectedSession._id ? response.data.session : session
      ));
      
      setSnackbar({
        open: true,
        message: 'Session updated successfully',
        severity: 'success'
      });
      
      handleCloseEditDialog();
    } catch (err) {
      console.error('Error updating session:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to update session',
        severity: 'error'
      });
    }
  };

  const handleCancelSession = async () => {
    try {
      const response = await axios.put(`/api/admin/sessions/${selectedSession._id}/cancel`);
      
      setSessions(prev => prev.map(session => 
        session._id === selectedSession._id ? response.data.session : session
      ));
      
      setSnackbar({
        open: true,
        message: 'Session cancelled successfully',
        severity: 'success'
      });
      
      handleCloseCancelDialog();
    } catch (err) {
      console.error('Error cancelling session:', err);
      setSnackbar({
        open: true,
        message: 'Failed to cancel session',
        severity: 'error'
      });
    }
  };

  const handleRestoreSession = async (sessionId) => {
    try {
      const response = await axios.put(`/api/admin/sessions/${sessionId}/restore`);
      
      setSessions(prev => prev.map(session => 
        session._id === sessionId ? response.data.session : session
      ));
      
      setSnackbar({
        open: true,
        message: 'Session restored successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error restoring session:', err);
      setSnackbar({
        open: true,
        message: 'Failed to restore session',
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
          Session Management
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}
        >
          Create New Session
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
          <Tab label="Active Sessions" />
          <Tab label="Completed Sessions" />
          <Tab label="Cancelled Sessions" />
        </Tabs>
      </Paper>
      
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Tutor</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Hours</TableCell>
                <TableCell>Rate</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSessions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((session) => (
                  <TableRow key={session._id}>
                    <TableCell>{session.student.name}</TableCell>
                    <TableCell>{session.tutor.name}</TableCell>
                    <TableCell>{session.course.title}</TableCell>
                    <TableCell>
                      {session.hoursCompleted} / {session.totalHours}
                    </TableCell>
                    <TableCell>${session.hourlyRate}/hr</TableCell>
                    <TableCell>
                      {new Date(session.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={session.status.charAt(0).toUpperCase() + session.status.slice(1)} 
                        color={
                          session.status === 'active' ? 'success' : 
                          session.status === 'completed' ? 'primary' : 
                          'error'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {session.status === 'active' && (
                        <>
                          <IconButton 
                            color="primary" 
                            size="small" 
                            onClick={() => handleOpenEditDialog(session)}
                          >
                            <EditIcon />
                          </IconButton>
                          
                          <IconButton 
                            color="error" 
                            size="small"
                            onClick={() => handleOpenCancelDialog(session)}
                          >
                            <CancelIcon />
                          </IconButton>
                        </>
                      )}
                      
                      {session.status === 'cancelled' && (
                        <IconButton 
                          color="success" 
                          size="small"
                          onClick={() => handleRestoreSession(session._id)}
                        >
                          <RestoreIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              
              {filteredSessions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No sessions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredSessions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      {/* Create Session Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Session</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="student-label">Student</InputLabel>
                <Select
                  labelId="student-label"
                  name="student"
                  value={formData.student}
                  onChange={handleInputChange}
                  label="Student"
                  required
                >
                  {students.map((student) => (
                    <MenuItem key={student._id} value={student._id}>
                      {student.name} ({student.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="tutor-label">Tutor</InputLabel>
                <Select
                  labelId="tutor-label"
                  name="tutor"
                  value={formData.tutor}
                  onChange={handleInputChange}
                  label="Tutor"
                  required
                >
                  {tutors.map((tutor) => (
                    <MenuItem key={tutor._id} value={tutor._id}>
                      {tutor.name} ({tutor.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="course-label">Course</InputLabel>
                <Select
                  labelId="course-label"
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  label="Course"
                  required
                >
                  {courses.map((course) => (
                    <MenuItem key={course._id} value={course._id}>
                      {course.title} ({course.collection.name})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                label="Total Hours"
                name="totalHours"
                type="number"
                value={formData.totalHours}
                onChange={handleInputChange}
                fullWidth
                required
                inputProps={{ min: 1 }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                label="Hourly Rate ($)"
                name="hourlyRate"
                type="number"
                value={formData.hourlyRate}
                onChange={handleInputChange}
                fullWidth
                required
                inputProps={{ min: 1 }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                label="Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                fullWidth
                required
                InputLabelProps={{
                  shrink: true,
                }}
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
          <Button onClick={handleCreateSession} variant="contained" color="primary">
            Create Session
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Session Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Session</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="student-label">Student</InputLabel>
                <Select
                  labelId="student-label"
                  name="student"
                  value={formData.student}
                  onChange={handleInputChange}
                  label="Student"
                  required
                >
                  {students.map((student) => (
                    <MenuItem key={student._id} value={student._id}>
                      {student.name} ({student.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="tutor-label">Tutor</InputLabel>
                <Select
                  labelId="tutor-label"
                  name="tutor"
                  value={formData.tutor}
                  onChange={handleInputChange}
                  label="Tutor"
                  required
                >
                  {tutors.map((tutor) => (
                    <MenuItem key={tutor._id} value={tutor._id}>
                      {tutor.name} ({tutor.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="course-label">Course</InputLabel>
                <Select
                  labelId="course-label"
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  label="Course"
                  required
                >
                  {courses.map((course) => (
                    <MenuItem key={course._id} value={course._id}>
                      {course.title} ({course.collection.name})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                label="Total Hours"
                name="totalHours"
                type="number"
                value={formData.totalHours}
                onChange={handleInputChange}
                fullWidth
                required
                inputProps={{ min: 1 }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                label="Hourly Rate ($)"
                name="hourlyRate"
                type="number"
                value={formData.hourlyRate}
                onChange={handleInputChange}
                fullWidth
                required
                inputProps={{ min: 1 }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                label="Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                fullWidth
                required
                InputLabelProps={{
                  shrink: true,
                }}
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
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleUpdateSession} variant="contained" color="primary">
            Update Session
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Cancel Session Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={handleCloseCancelDialog}
      >
        <DialogTitle>Confirm Cancellation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel the session for {selectedSession?.student?.name} with {selectedSession?.tutor?.name}?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            The session will be marked as cancelled but can be restored later.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog}>No, Keep Active</Button>
          <Button onClick={handleCancelSession} variant="contained" color="error">
            Yes, Cancel Session
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