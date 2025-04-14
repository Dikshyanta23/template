// client/src/pages/student/AttendanceHistory.jsx
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
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import MenuBookIcon from '@mui/icons-material/MenuBook';

export default function AttendanceHistory({ attendances }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleOpenDetails = (attendance) => {
    setSelectedAttendance(attendance);
    setDetailsOpen(true);
  };
  
  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };
  
  return (
    <>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Attendance History
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Tutor</TableCell>
                <TableCell>Hours</TableCell>
                <TableCell>Materials</TableCell>
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
                    <TableCell>{attendance.course.title}</TableCell>
                    <TableCell>{attendance.tutor.name}</TableCell>
                    <TableCell>{attendance.hoursSpent}</TableCell>
                    <TableCell>
                      {attendance.materials && attendance.materials.length > 0 ? (
                        <Chip 
                          label={`${attendance.materials.length} files`} 
                          size="small" 
                          color="primary" 
                        />
                      ) : (
                        <Chip 
                          label="No materials" 
                          size="small" 
                          variant="outlined" 
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => handleOpenDetails(attendance)}
                      >
                        View Details
                      </Button>
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
      </Paper>
      
      {/* Attendance Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedAttendance && (
          <>
            <DialogTitle>
              Attendance Details - {new Date(selectedAttendance.date).toLocaleDateString()}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Session Information
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CalendarTodayIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography>
                          {new Date(selectedAttendance.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography>
                          {selectedAttendance.hoursSpent} hours
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography>
                          Tutor: {selectedAttendance.tutor.name}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <MenuBookIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography>
                          Course: {selectedAttendance.course.title}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Tutor Notes
                      </Typography>
                      
                      <Typography variant="body1">
                        {selectedAttendance.notes || "No notes provided for this session."}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Session Materials
                      </Typography>
                      
                      {selectedAttendance.materials && selectedAttendance.materials.length > 0 ? (
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Name</TableCell>
                              <TableCell>Type</TableCell>
                              <TableCell>Uploaded</TableCell>
                              <TableCell>Action</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedAttendance.materials.map((material, index) => (
                              <TableRow key={index}>
                                <TableCell>{material.name}</TableCell>
                                <TableCell>{material.fileType}</TableCell>
                                <TableCell>
                                  {new Date(material.uploadDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    startIcon={<DownloadIcon />}
                                    size="small"
                                    component={Link}
                                    href={material.fileUrl}
                                    target="_blank"
                                    download
                                  >
                                    Download
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <Typography variant="body1">
                          No materials have been uploaded for this session.
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}