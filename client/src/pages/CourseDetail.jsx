// client/src/pages/CourseDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Paper,
  Divider,
  Avatar,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PersonIcon from '@mui/icons-material/Person';
import axios from 'axios';

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enquiry, setEnquiry] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [enquiryErrors, setEnquiryErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  useEffect(() => {
    fetchCourse();
  }, [id]);
  
  const fetchCourse = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/courses/${id}`);
      setCourse(data.course);
    } catch (err) {
      console.error('Error fetching course:', err);
      setError('Failed to load course details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEnquiryChange = (e) => {
    const { name, value } = e.target;
    setEnquiry(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (enquiryErrors[name]) {
      setEnquiryErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateEnquiry = () => {
    const errors = {};
    
    if (!enquiry.name.trim()) errors.name = 'Name is required';
    if (!enquiry.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(enquiry.email)) {
      errors.email = 'Please enter a valid email';
    }
    if (!enquiry.phone.trim()) errors.phone = 'Phone number is required';
    if (!enquiry.message.trim()) errors.message = 'Message is required';
    
    setEnquiryErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEnquiry()) return;
    
    try {
      await axios.post('/api/enquiries', {
        courseId: id,
        ...enquiry
      });
      
      setSnackbar({
        open: true,
        message: 'Enquiry submitted successfully! We will contact you soon.',
        severity: 'success'
      });
      
      // Reset form
      setEnquiry({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
    } catch (err) {
      console.error('Error submitting enquiry:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to submit enquiry. Please try again.',
        severity: 'error'
      });
    }
  };
  
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !course) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography color="error" align="center">{error || 'Course not found'}</Typography>
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button component={Link} to="/courses" variant="contained">
            Back to Courses
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom>
              {course.title}
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" color="text.secondary">
                {course.collection}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 4 }}>
              <img 
                src={course.image || 'https://via.placeholder.com/800x400?text=Course+Image'} 
                alt={course.title}
                style={{ width: '100%', borderRadius: '8px', maxHeight: '400px', objectFit: 'cover' }}
              />
            </Box>
            
            <Typography variant="h5" gutterBottom>
              Course Description
            </Typography>
            <Typography variant="body1" paragraph>
              {course.description}
            </Typography>
            
            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              Topics Covered
            </Typography>
            <List>
              {course.topics.map((topic, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircleOutlineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={topic} />
                </ListItem>
              ))}
            </List>
            
            <Box sx={{ mt: 4 }}>
              <Button 
                component={Link} 
                to={`/courses/${id}/test`}
                variant="contained" 
                color="primary"
                size="large"
              >
                Take Mini Test
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Course Tutors
            </Typography>
            
            {course.tutors.length > 0 ? (
              <List>
                {course.tutors.map((tutor) => (
                  <ListItem key={tutor._id} sx={{ px: 0 }}>
                    <Avatar 
                      src={tutor.profilePhoto || undefined}
                      sx={{ mr: 2 }}
                    >
                      <PersonIcon />
                    </Avatar>
                    <ListItemText primary={tutor.email} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No tutors assigned to this course yet.
              </Typography>
            )}
          </Paper>
          
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Enquire About This Course
            </Typography>
            
            <form onSubmit={handleEnquirySubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Your Name"
                    name="name"
                    value={enquiry.name}
                    onChange={handleEnquiryChange}
                    error={!!enquiryErrors.name}
                    helperText={enquiryErrors.name}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={enquiry.email}
                    onChange={handleEnquiryChange}
                    error={!!enquiryErrors.email}
                    helperText={enquiryErrors.email}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phone"
                    value={enquiry.phone}
                    onChange={handleEnquiryChange}
                    error={!!enquiryErrors.phone}
                    helperText={enquiryErrors.phone}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Your Message"
                    name="message"
                    multiline
                    rows={4}
                    value={enquiry.message}
                    onChange={handleEnquiryChange}
                    error={!!enquiryErrors.message}
                    helperText={enquiryErrors.message}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                  >
                    Submit Enquiry
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}