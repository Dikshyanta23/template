// client/src/pages/tutor/AttendanceManagement.jsx
import { useState } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
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
  IconButton,
  Tooltip,
  Alert,
  Snackbar
} from '@mui/material';
// Remove the date picker imports and use a simple input instead
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

export default function AttendanceManagement({ 
  attendances, 
  sessions, 
  onAttendanceCreated, 
  onAttendanceUpdated, 
  onAttendanceDeleted 
}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [formData, setFormData] = useState({
    student: '',
    course: '',
    date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD for input type="date"
    hoursSpent: 1,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Get active sessions for the create form
  const activeSessions = sessions.filter(session => session.status === 'active');
  
  // Group active sessions by student for easier selection
  const sessionsByStudent = activeSessions.reduce((acc, session) => {
    if (!acc[session.student._id]) {
      acc[session.student._id] = {
        student: session.student,
        courses: []
      };
    }
    
    acc[session.student._id].courses.push({
      id: session.course._id,
      title: session.course.title,
      sessionId: session._id
    });
    
    return acc;
  }, {});
  
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
      course: '',
      date: new Date().toISOString().split('T')[0],
      hoursSpent: 1,
      notes: ''
    });
    setCreateDialogOpen(true);
  };
  
  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    setError('');
  };
  
  const handleOpenEditDialog = (attendance) => {
    setSelectedAttendance(attendance);
    setFormData({
      student: attendance.student._id,
      course: attendance.course._id,
      date: new Date(attendance.date).toISOString().split('T')[0],
      hoursSpent: attendance.hoursSpent,
      notes: attendance.notes || ''
    });
    setEditDialogOpen(true);
  };
  
  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedAttendance(null);
    setError('');
  };
  
  const handleOpenDeleteDialog = (attendance) => {
    setSelectedAttendance(attendance);
    setDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedAttendance(null);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCreateAttendance = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { student, course, date, hoursSpent, notes } = formData;
      
      if (!student || !course || !date || !hoursSpent) {
        setError('Please fill all required fields');
        setLoading(false);
        return;
      }
      
      const response = await axios.post('/api/tutor/attendance', {
        student,
        course,
        date: new Date(date),
        hoursSpent: Number(hoursSpent),
        notes
      });
      
      setSnackbar({
        open: true,
        message: 'Attendance record created successfully',
        severity: 'success'
      });
      
      handleCloseCreateDialog();
      onAttendanceCreated(response.data.attendance);
    } catch (err) {
      console.error('Error creating attendance:', err);
      setError(err.response?.data?.message || 'Failed to create attendance record');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateAttendance = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { date, hoursSpent, notes } = formData;
      
      if (!date || !hoursSpent) {
        setError('Please fill all required fields');
        setLoading(false);
        return;
      }
      
      const response = await axios.put(`/api/tutor/attendance/${selectedAttendance._id}`, {
        date: new Date(date),
        hoursSpent: Number(hoursSpent),
        notes
      });
      
      setSnackbar({
        open: true,
        message: 'Attendance record updated successfully',
        severity: 'success'
      });
      
      handleCloseEditDialog();
      onAttendanceUpdated(response.data.attendance);
    } catch (err) {
      console.error('Error updating attendance:', err);
      setError(err.response?.data?.message || 'Failed to update attendance record');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteAttendance = async () => {
    try {
      setLoading(true);
      
      await axios.delete(`/api/tutor/attendance/${selectedAttendance._id}`);
      
      setSnackbar({
        open: true,
        message: 'Attendance record deleted successfully',
        severity: 'success'
      });
      
      handleCloseDeleteDialog();
      onAttendanceDeleted(selectedAttendance._id);
    } catch (err) {
      console.error('Error deleting attendance:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete attendance record',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };
  
  // Get today's date in YYYY-MM-DD format for max date attribute
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Attendance Records
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleOpenCreateDialog}
        >
          Record New Attendance
        </Button>
      </Box>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Student</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Hours</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendances
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((attendance) => (
                <TableRow key={attendance._id}>
                  <TableCell>
                    {new Date(attendance.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{attendance.student.name}</TableCell>
                  <TableCell>{attendance.course.title}</TableCell>
                  <TableCell>{attendance.hoursSpent}</TableCell>
                  <TableCell>
                    {attendance.notes ? 
                      (attendance.notes.length > 30 ? 
                        `${attendance.notes.substring(0, 30)}...` : 
                        attendance.notes) : 
                      'No notes'}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => handleOpenEditDialog(attendance)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleOpenDeleteDialog(attendance)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            
            {attendances.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No attendance records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={attendances.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      
      {/* Create Attendance Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Record New Attendance</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                label="Student"
                name="student"
                value={formData.student}
                onChange={handleInputChange}
                fullWidth
                required
              >
                {Object.values(sessionsByStudent).map((item) => (
                  <MenuItem key={item.student._id} value={item.student._id}>
                    {item.student.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                select
                label="Course"
                name="course"
                value={formData.course}
                onChange={handleInputChange}
                fullWidth
                required
                disabled={!formData.student}
              >
                {formData.student && sessionsByStudent[formData.student]?.courses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.title}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: today }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Hours Spent"
                name="hoursSpent"
                type="number"
                value={formData.hoursSpent}
                onChange={handleInputChange}
                fullWidth
                required
                inputProps={{ min: 0.5, step: 0.5 }}
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
                rows={4}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancel</Button>
          <Button 
            onClick={handleCreateAttendance} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Attendance Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Attendance Record</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Student"
                value={selectedAttendance?.student.name || ''}
                fullWidth
                disabled
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Course"
                value={selectedAttendance?.course.title || ''}
                fullWidth
                disabled
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: today }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Hours Spent"
                name="hoursSpent"
                type="number"
                value={formData.hoursSpent}
                onChange={handleInputChange}
                fullWidth
                required
                inputProps={{ min: 0.5, step: 0.5 }}
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
                rows={4}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button 
            onClick={handleUpdateAttendance} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this attendance record? This action cannot be undone.
          </Typography>
          
          {selectedAttendance && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Date:</strong> {new Date(selectedAttendance.date).toLocaleDateString()}
              </Typography>
              <Typography variant="body2">
                <strong>Student:</strong> {selectedAttendance.student.name}
              </Typography>
              <Typography variant="body2">
                <strong>Course:</strong> {selectedAttendance.course.title}
              </Typography>
              <Typography variant="body2">
                <strong>Hours:</strong> {selectedAttendance.hoursSpent}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button 
            onClick={handleDeleteAttendance} 
            variant="contained" 
            color="error"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
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
    </Paper>
  );
}