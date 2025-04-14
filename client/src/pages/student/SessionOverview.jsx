// client/src/pages/student/SessionOverview.jsx
import React from 'react';
import { 
    Grid, 
    Paper, 
    Typography, 
    Box, 
    LinearProgress, 
    Card, 
    CardContent,
    List,
    ListItem,
    ListItemText,
    Divider
  } from '@mui/material';
  
  export default function SessionOverview({ sessions, attendances }) {
    // Get active sessions
    const activeSessions = sessions.filter(session => session.status === 'active');
    
    // Calculate total hours completed across all sessions
    const totalHoursCompleted = sessions.reduce((sum, session) => sum + session.hoursCompleted, 0);
    const totalHoursAssigned = sessions.reduce((sum, session) => sum + session.totalHours, 0);
    
    // Get recent attendance records
    const recentAttendances = [...attendances].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    ).slice(0, 3);
    
    return (
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Active Sessions
            </Typography>
            
            {activeSessions.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                You don't have any active sessions.
              </Typography>
            ) : (
              activeSessions.map(session => (
                <Card key={session._id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6">
                      {session.course.title} with {session.tutor.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1 }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={(session.hoursCompleted / session.totalHours) * 100} 
                        />
                      </Box>
                      <Box sx={{ minWidth: 35 }}>
                        <Typography variant="body2" color="text.secondary">
                          {Math.round((session.hoursCompleted / session.totalHours) * 100)}%
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary">
                      {session.hoursCompleted} of {session.totalHours} hours completed
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      Started on: {new Date(session.startDate).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              ))
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Hours Summary
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total Hours Completed
              </Typography>
              <Typography variant="h4">
                {totalHoursCompleted}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                of {totalHoursAssigned} assigned hours
              </Typography>
            </Box>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Attendance
            </Typography>
            
            {recentAttendances.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                No recent attendance records.
              </Typography>
            ) : (
              <List>
                {recentAttendances.map((attendance, index) => (
                  <React.Fragment key={attendance._id}>
                    <ListItem>
                      <ListItemText
                        primary={`${attendance.course.title} (${attendance.hoursSpent} hours)`}
                        secondary={`${new Date(attendance.date).toLocaleDateString()} with ${attendance.tutor.name}`}
                      />
                    </ListItem>
                    {index < recentAttendances.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    );
  }