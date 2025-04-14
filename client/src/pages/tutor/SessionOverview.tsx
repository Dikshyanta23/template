// client/src/pages/tutor/SessionOverview.jsx
import React from 'react';
import {
    Grid as MuiGrid,  // Rename to avoid TypeScript confusion
    Paper,
    Typography,
    Box,
    LinearProgress,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    Divider,
    Stack
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PendingIcon from '@mui/icons-material/Pending';
import PersonIcon from '@mui/icons-material/Person';

// Create a Grid component that works with TypeScript
const Grid = (props) => <MuiGrid {...props} />;

export default function SessionOverview({ activeSessions, recentAttendance, stats }) {
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
                                        {session.course.title} with {session.student.name}
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

                                    <Typography variant="body2" color="text.secondary">
                                        Payment status: {session.paymentStatus.replace('_', ' ')}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
                <Stack spacing={3}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Statistics
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Total Hours Completed
                                </Typography>
                                <Typography variant="h6">
                                    {stats.totalHoursCompleted} of {stats.totalHoursAssigned}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <MonetizationOnIcon sx={{ mr: 1, color: 'success.main' }} />
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Total Earnings
                                </Typography>
                                <Typography variant="h6">
                                    ${stats.totalEarnings.toFixed(2)}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PendingIcon sx={{ mr: 1, color: 'warning.main' }} />
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Pending Payments
                                </Typography>
                                <Typography variant="h6">
                                    ${stats.pendingPayments.toFixed(2)}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>

                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Recent Attendance
                        </Typography>

                        {recentAttendance.length === 0 ? (
                            <Typography variant="body1" color="text.secondary">
                                No recent attendance records.
                            </Typography>
                        ) : (
                            <List>
                                {recentAttendance.map((attendance, index) => (
                                    <React.Fragment key={attendance._id}>
                                        <ListItem>
                                            <ListItemText
                                                primary={`${attendance.course.title} (${attendance.hoursSpent} hours)`}
                                                secondary={`${new Date(attendance.date).toLocaleDateString()} with ${attendance.student.name}`}
                                            />
                                        </ListItem>
                                        {index < recentAttendance.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        )}
                    </Paper>
                </Stack>
            </Grid>
        </Grid>
    );
}