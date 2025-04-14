// client/src/pages/tutor/StudentProgress.jsx
import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  Avatar, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  CircularProgress, 
  Alert, 
  Tabs, 
  Tab, 
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import { 
  Person as PersonIcon, 
  School as SchoolIcon, 
  Assignment as AssignmentIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  Note as NoteIcon,
  Add as AddIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';

const StudentProgress = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [openNoteDialog, setOpenNoteDialog] = useState(false);
  const [progressNote, setProgressNote] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all students for this tutor
      const studentsRes = await axios.get('/api/tutor/students');
      setStudents(studentsRes.data.students);
      
      // Fetch all sessions for this tutor
      const sessionsRes = await axios.get('/api/tutor/sessions');
      setSessions(sessionsRes.data.sessions);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to load student data');
      setLoading(false);
    }
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setTabValue(0);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenNoteDialog = (sessionId = null, existingNote = '') => {
    setSelectedSessionId(sessionId);
    setProgressNote(existingNote);
    setOpenNoteDialog(true);
  };

  const handleCloseNoteDialog = () => {
    setOpenNoteDialog(false);
    setProgressNote('');
    setSelectedSessionId(null);
  };

  const handleSaveNote = async () => {
    try {
      setLoading(true);
      
      await axios.put(`/api/tutor/sessions/${selectedSessionId}/notes`, {
        notes: progressNote
      });
      
      // Refresh sessions data
      const sessionsRes = await axios.get('/api/tutor/sessions');
      setSessions(sessionsRes.data.sessions);
      
      handleCloseNoteDialog();
      setLoading(false);
    } catch (err) {
      console.error('Error saving note:', err);
      setError(err.response?.data?.message || 'Failed to save progress note');
      setLoading(false);
    }
  };

  const getStudentSessions = (studentId) => {
    return sessions.filter(session => session.student._id === studentId);
  };

  const getStudentAttendance = (studentId) => {
    const studentSessions = getStudentSessions(studentId);
    let totalAttendances = 0;
    let totalHours = 0;
    
    studentSessions.forEach(session => {
      totalAttendances += session.attendances.length;
      session.attendances.forEach(attendance => {
        totalHours += attendance.hours;
      });
    });
    
    return { totalAttendances, totalHours };
  };

  const calculateProgress = (studentId) => {
    const studentSessions = getStudentSessions(studentId);
    let totalHours = 0;
    let completedHours = 0;
    
    studentSessions.forEach(session => {
      totalHours += session.totalHours;
      completedHours += session.hoursCompleted;
    });
    
    return {
      totalHours,
      completedHours,
      percentage: totalHours > 0 ? Math.round((completedHours / totalHours) * 100) : 0
    };
  };

  if (loading && students.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && students.length === 0) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (students.length === 0) {
    return (
      <Box sx={{ mt: 2 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            No students found
          </Typography>
          <Typography variant="body1">
            You don't have any students assigned to your sessions yet.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Student Progress Tracking
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Your Students
            </Typography>
            <List>
              {students.map((student) => {
                const { totalAttendances, totalHours } = getStudentAttendance(student._id);
                const progress = calculateProgress(student._id);
                
                return (
                  <Paper 
                    key={student._id} 
                    elevation={selectedStudent?._id === student._id ? 3 : 1}
                    sx={{ 
                      mb: 2, 
                      cursor: 'pointer',
                      border: selectedStudent?._id === student._id ? '1px solid' : 'none',
                      borderColor: 'primary.main'
                    }}
                    onClick={() => handleStudentSelect(student)}
                  >
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={student.name} 
                        secondary={
                          <Box>
                            <Typography variant="body2" component="span">
                              {student.email}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={progress.percentage} 
                                sx={{ height: 8, borderRadius: 1 }}
                              />
                              <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                                {progress.completedHours} of {progress.totalHours} hours completed ({progress.percentage}%)
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  </Paper>
                );
              })}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          {selectedStudent ? (
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  <PersonIcon />
                </Avatar>
                <Typography variant="h6">
                  {selectedStudent.name}
                </Typography>
              </Box>
              
              <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
                <Tab label="Overview" />
                <Tab label="Sessions" />
                <Tab label="Attendance" />
              </Tabs>
              
              {/* Overview Tab */}
              {tabValue === 0 && (
                <Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Card>
                        <CardHeader title="Student Information" />
                        <CardContent>
                          <List dense>
                            <ListItem>
                              <ListItemAvatar>
                                <Avatar>
                                  <PersonIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText primary="Name" secondary={selectedStudent.name} />
                            </ListItem>
                            <ListItem>
                              <ListItemAvatar>
                                <Avatar>
                                  <PersonIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText primary="Email" secondary={selectedStudent.email} />
                            </ListItem>
                            {selectedStudent.phone && (
                              <ListItem>
                                <ListItemAvatar>
                                  <Avatar>
                                    <PersonIcon />
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText primary="Phone" secondary={selectedStudent.phone} />
                              </ListItem>
                            )}
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Card>
                        <CardHeader title="Progress Summary" />
                        <CardContent>
                          <Box sx={{ mb: 2 }}>
                            {(() => {
                              const progress = calculateProgress(selectedStudent._id);
                              return (
                                <>
                                  <Typography variant="body2" color="text.secondary">
                                    Overall Progress
                                  </Typography>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={progress.percentage} 
                                    sx={{ height: 10, borderRadius: 1, my: 1 }}
                                  />
                                  <Typography variant="body2">
                                    {progress.completedHours} of {progress.totalHours} hours completed ({progress.percentage}%)
                                  </Typography>
                                </>
                              );
                            })()}
                          </Box>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          <List dense>
                            {(() => {
                              const { totalAttendances, totalHours } = getStudentAttendance(selectedStudent._id);
                              return (
                                <>
                                  <ListItem>
                                    <ListItemAvatar>
                                      <Avatar>
                                        <AssignmentIcon />
                                      </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText 
                                      primary="Total Sessions" 
                                      secondary={getStudentSessions(selectedStudent._id).length} 
                                    />
                                  </ListItem>
                                  <ListItem>
                                    <ListItemAvatar>
                                      <Avatar>
                                        <CalendarIcon />
                                      </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText 
                                      primary="Total Attendances" 
                                      secondary={totalAttendances} 
                                    />
                                  </ListItem>
                                  <ListItem>
                                    <ListItemAvatar>
                                      <Avatar>
                                        <TimeIcon />
                                      </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText 
                                      primary="Total Hours Attended" 
                                      secondary={`${totalHours} hours`} 
                                    />
                                  </ListItem>
                                </>
                              );
                            })()}
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                  
                  <Card sx={{ mt: 2 }}>
                    <CardHeader 
                      title="Recent Attendance" 
                      action={
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => setTabValue(2)}
                        >
                          View All
                        </Button>
                      }
                    />
                    <CardContent>
                      {(() => {
                        const studentSessions = getStudentSessions(selectedStudent._id);
                        let recentAttendances = [];
                        
                        studentSessions.forEach(session => {
                          session.attendances.forEach(attendance => {
                            recentAttendances.push({
                              ...attendance,
                              sessionId: session._id,
                              course: session.course.title
                            });
                          });
                        });
                        
                        // Sort by date (newest first) and take only the 5 most recent
                        recentAttendances.sort((a, b) => new Date(b.date) - new Date(a.date));
                        recentAttendances = recentAttendances.slice(0, 5);
                        
                        if (recentAttendances.length === 0) {
                          return (
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                              No attendance records found
                            </Typography>
                          );
                        }
                        
                        return (
                          <List dense>
                            {recentAttendances.map((attendance, index) => (
                              <ListItem key={index}>
                                <ListItemAvatar>
                                  <Avatar>
                                    <CalendarIcon />
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText 
                                  primary={format(new Date(attendance.date), 'PPP')} 
                                  secondary={`${attendance.hours} hours - ${attendance.course}`} 
                                />
                              </ListItem>
                            ))}
                          </List>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </Box>
              )}
              
              {/* Sessions Tab */}
              {tabValue === 1 && (
                <Box>
                  {(() => {
                    const studentSessions = getStudentSessions(selectedStudent._id);
                    
                    if (studentSessions.length === 0) {
                      return (
                        <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
                          No sessions found for this student
                        </Typography>
                      );
                    }
                    
                    return studentSessions.map(session => {
                      const progress = Math.round((session.hoursCompleted / session.totalHours) * 100);
                      
                      return (
                        <Card key={session._id} sx={{ mb: 2 }}>
                          <CardHeader 
                            title={session.course.title}
                            subheader={`Started: ${format(new Date(session.startDate), 'PPP')}`}
                          />
                          <CardContent>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                  Progress
                                </Typography>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={progress} 
                                  sx={{ height: 10, borderRadius: 1, my: 1 }}
                                />
                                <Typography variant="body2">
                                  {session.hoursCompleted} of {session.totalHours} hours completed ({progress}%)
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                  Session Details
                                </Typography>
                                <Typography variant="body2">
                                  Hourly Rate: ${session.hourlyRate}
                                </Typography>
                                <Typography variant="body2">
                                  Status: {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                                </Typography>
                              </Grid>
                            </Grid>
                            
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                <NoteIcon fontSize="small" sx={{ mr: 0.5 }} />
                                Progress Notes
                                <Tooltip title="Add/Edit Note">
                                  <IconButton 
                                    size="small" 
                                    sx={{ ml: 1 }}
                                    onClick={() => handleOpenNoteDialog(session._id, session.notes || '')}
                                  >
                                    {session.notes ? <EditIcon fontSize="small" /> : <AddIcon fontSize="small" />}
                                  </IconButton>
                                </Tooltip>
                              </Typography>
                              {session.notes ? (
                                <Typography variant="body2" sx={{ mt: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                                  {session.notes}
                                </Typography>
                              ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                                  No notes added yet
                                </Typography>
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      );
                    });
                  })()}
                </Box>
              )}
              
              {/* Attendance Tab */}
              {tabValue === 2 && (
                <Box>
                  {(() => {
                    const studentSessions = getStudentSessions(selectedStudent._id);
                    let allAttendances = [];
                    
                    studentSessions.forEach(session => {
                      session.attendances.forEach(attendance => {
                        allAttendances.push({
                          ...attendance,
                          sessionId: session._id,
                          course: session.course.title
                        });
                      });
                    });
                    
                    // Sort by date (newest first)
                    allAttendances.sort((a, b) => new Date(b.date) - new Date(a.date));
                    
                    if (allAttendances.length === 0) {
                      return (
                        <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
                          No attendance records found for this student
                        </Typography>
                      );
                    }
                    
                    return (
                      <TableContainer component={Paper} sx={{ mt: 2 }}>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Date</TableCell>
                              <TableCell>Course</TableCell>
                              <TableCell>Hours</TableCell>
                              <TableCell>Notes</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {allAttendances.map((attendance, index) => (
                              <TableRow key={index}>
                                <TableCell>{format(new Date(attendance.date), 'PPP')}</TableCell>
                                <TableCell>{attendance.course}</TableCell>
                                <TableCell>{attendance.hours}</TableCell>
                                <TableCell>{attendance.notes || '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    );
                  })()}
                </Box>
              )}
            </Paper>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Select a Student
              </Typography>
              <Typography variant="body1">
                Please select a student from the list to view their progress details.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
      
      {/* Progress Note Dialog */}
      <Dialog open={openNoteDialog} onClose={handleCloseNoteDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Add Progress Notes
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Progress Notes"
            fullWidth
            multiline
            rows={6}
            value={progressNote}
            onChange={(e) => setProgressNote(e.target.value)}
            placeholder="Enter notes about student progress, areas of improvement, strengths, etc."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNoteDialog}>Cancel</Button>
          <Button onClick={handleSaveNote} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Save Notes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentProgress;