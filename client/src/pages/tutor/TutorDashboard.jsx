// client/src/pages/tutor/TutorDashboard.jsx
import { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  CircularProgress, 
  Alert 
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import SessionOverview from './SessionOverview';
import AttendanceManagement from './AttendanceManagement';
import PaymentOverview from './PaymentOverview';

export default function TutorDashboard() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [dashboardData, setDashboardData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchTutorData();
  }, []);
  
  const fetchTutorData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard overview data
      const dashboardRes = await axios.get('/api/tutor/dashboard');
      setDashboardData(dashboardRes.data);
      
      // Fetch all sessions, attendances, and payments
      const [sessionsRes, attendancesRes, paymentsRes] = await Promise.all([
        axios.get('/api/tutor/sessions'),
        axios.get('/api/tutor/attendance'),
        axios.get('/api/tutor/payments')
      ]);
      
      setSessions(sessionsRes.data.sessions);
      setAttendances(attendancesRes.data.attendances);
      setPayments(paymentsRes.data.payments);
    } catch (err) {
      console.error('Error fetching tutor data:', err);
      setError('Failed to load your data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleAttendanceCreated = async (newAttendance) => {
    // Refresh attendance data
    try {
      const attendancesRes = await axios.get('/api/tutor/attendance');
      setAttendances(attendancesRes.data.attendances);
      
      // Also refresh sessions as hours completed will have changed
      const sessionsRes = await axios.get('/api/tutor/sessions');
      setSessions(sessionsRes.data.sessions);
      
      // Refresh dashboard data
      const dashboardRes = await axios.get('/api/tutor/dashboard');
      setDashboardData(dashboardRes.data);
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  };
  
  const handleAttendanceUpdated = async (updatedAttendance) => {
    // Same as created - refresh data
    await handleAttendanceCreated(updatedAttendance);
  };
  
  const handleAttendanceDeleted = async (deletedId) => {
    // Same as created - refresh data
    await handleAttendanceCreated(null);
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
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" gutterBottom>
        Tutor Dashboard
      </Typography>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Overview" />
          <Tab label="Attendance" />
          <Tab label="Payments" />
        </Tabs>
      </Paper>
      
      {tabValue === 0 && dashboardData && (
        <SessionOverview 
          activeSessions={dashboardData.activeSessions}
          recentAttendance={dashboardData.recentAttendance}
          stats={dashboardData.stats}
        />
      )}
      
      {tabValue === 1 && (
        <AttendanceManagement 
          attendances={attendances}
          sessions={sessions}
          onAttendanceCreated={handleAttendanceCreated}
          onAttendanceUpdated={handleAttendanceUpdated}
          onAttendanceDeleted={handleAttendanceDeleted}
        />
      )}
      
      {tabValue === 2 && (
        <PaymentOverview 
          payments={payments}
          stats={dashboardData?.stats}
        />
      )}
    </Container>
  );
}