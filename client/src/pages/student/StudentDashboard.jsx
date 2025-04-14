// client/src/pages/student/StudentDashboard.jsx
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
import AttendanceHistory from './AttendanceHistory';
import SessionOverview from './SessionOverview';
import PaymentHistory from './PaymentHistory';
import TutorRating from './TutorRating';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // useEffect(() => {
  //   fetchStudentData();
  // }, []);

  useEffect(() => {
    // Comment out the API call temporarily
    // fetchStudentData();
    
    // Just set empty arrays and loading to false
    setSessions([]);
    setAttendances([]);
    setPayments([]);
    setLoading(false);
  }, []);
  
  const fetchStudentData = async () => {
    
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [sessionsRes, attendancesRes, paymentsRes] = await Promise.all([
        axios.get('/api/sessions/student'),
        axios.get('/api/attendance/student'),
        axios.get('/api/payments/student')
      ]);
      
      setSessions(sessionsRes.data.sessions);
      setAttendances(attendancesRes.data.attendances);
      setPayments(paymentsRes.data.payments);
    } catch (err) {
      console.error('Error fetching student data:', err);
      setError('Failed to load your data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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
        Student Dashboard
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
          <Tab label="Rate Tutors" />
        </Tabs>
      </Paper>
      
      {tabValue === 0 && (
        <SessionOverview 
          sessions={sessions} 
          attendances={attendances} 
        />
      )}
      
      {tabValue === 1 && (
        <AttendanceHistory 
          attendances={attendances} 
        />
      )}
      
      {tabValue === 2 && (
        <PaymentHistory 
          payments={payments} 
        />
      )}
      
      {tabValue === 3 && (
        <TutorRating 
          sessions={sessions} 
        />
      )}
    </Container>
  );
}