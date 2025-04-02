
import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  CircularProgress,
  Alert
} from '@mui/material';
import { Link } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PendingIcon from '@mui/icons-material/Pending';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (user) {
      fetchUserCourses();
    }
  }, [user]);
  
  const fetchUserCourses = async () => {
    try {
      setLoading(true);
      
      if (user.role === 'tutor') {
        // For tutors, fetch courses they teach
        const { data } = await axios.get('/api/users/me');
        if (data.user.courses && data.user.courses.length > 0) {
          const coursesResponse = await axios.get('/api/courses');
          const userCourses = coursesResponse.data.courses.filter(
            course => data.user.courses.includes(course._id)
          );
          setCourses(userCourses);
        } else {
          setCourses([]);
        }
      } else {
        // For students, fetch all courses (for now)
        // In a real app, you might fetch enrolled courses
        const { data } = await axios.get('/api/courses');
        setCourses(data.courses);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            {user?.profilePhoto ? (
              <img 
                src={user.profilePhoto} 
                alt={user?.email} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <PersonIcon />
            )}
          </Avatar>
          <Box>
            <Typography variant="h5">
              Welcome, {user?.email}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
              </Typography>
              {user?.verified ? (
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                  <CheckCircleOutlineIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">Verified</Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'warning.main' }}>
                  <PendingIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">Pending Verification</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
        
        {!user?.verified && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Your account is pending verification by an administrator. Some features may be limited until your account is verified.
          </Alert>
        )}
        
        {isAdmin && (
          <Box sx={{ mt: 2 }}>
            <Button 
              component={Link} 
              to="/admin/users" 
              variant="contained" 
              color="secondary"
              sx={{ mr: 2 }}
            >
              Manage Users
            </Button>
            <Button 
              component={Link} 
              to="/admin/courses" 
              variant="contained" 
              color="secondary"
            >
              Manage Courses
            </Button>
          </Box>
        )}
      </Paper>
      
      {user?.role === 'tutor' && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Your Teaching Courses
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : courses.length > 0 ? (
            <Grid container spacing={3}>
              {courses.map((course) => (
                <Grid item xs={12} sm={6} md={4} key={course._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={course.image || 'https://placehold.co/600x400?text=Course+Image'}
                      alt={course.title}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="div">
                        {course.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {course.description.substring(0, 100)}...
                      </Typography>
                      <Button 
                        component={Link} 
                        to={`/courses/${course._id}`} 
                        variant="outlined" 
                        size="small" 
                        sx={{ mt: 1 }}
                      >
                        View Course
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                You are not assigned to teach any courses yet.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                An administrator will assign courses to you soon.
              </Typography>
            </Paper>
          )}
        </Box>
      )}
      
      {user?.role === 'student' && (
        <>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Your Enrolled Courses
            </Typography>
            
            {/* In a real app, you would show enrolled courses here */}
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                You are not enrolled in any courses yet.
              </Typography>
              <Button 
                component={Link} 
                to="/courses" 
                variant="contained" 
                color="primary"
              >
                Browse Courses
              </Button>
            </Paper>
          </Box>
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recommended Courses
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : courses.length > 0 ? (
              <Grid container spacing={3}>
                {courses.slice(0, 3).map((course) => (
                  <Grid item xs={12} sm={6} md={4} key={course._id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={course.image || 'https://placehold.co/600x400?text=Course+Image'}
                        alt={course.title}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography gutterBottom variant="h6" component="div">
                          {course.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {course.description.substring(0, 100)}...
                        </Typography>
                        <Button 
                          component={Link} 
                          to={`/courses/${course._id}`} 
                          variant="outlined" 
                          size="small" 
                          sx={{ mt: 1 }}
                        >
                          View Course
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">
                  No courses available at the moment.
                </Typography>
              </Paper>
            )}
            
            {courses.length > 3 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button 
                  component={Link} 
                  to="/courses" 
                  variant="contained" 
                  color="primary"
                >
                  View All Courses
                </Button>
              </Box>
            )}
          </Box>
        </>
      )}
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Quick Links
            </Typography>
            <List>
              <ListItem button component={Link} to="/courses">
                <ListItemIcon>
                  <SchoolIcon />
                </ListItemIcon>
                <ListItemText primary="All Courses" />
              </ListItem>
              
              {user?.role === 'student' && (
                <ListItem button component={Link} to="/profile">
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary="My Profile" />
                </ListItem>
              )}
              
              {user?.role === 'tutor' && (
                <>
                  <ListItem button component={Link} to="/profile">
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText primary="My Profile" />
                  </ListItem>
                  
                  <ListItem button component={Link} to="/tutor/students">
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText primary="My Students" />
                  </ListItem>
                </>
              )}
              
              {isAdmin && (
                <>
                  <ListItem button component={Link} to="/admin/users">
                    <ListItemIcon>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText primary="User Management" />
                  </ListItem>
                  
                  <ListItem button component={Link} to="/admin/courses">
                    <ListItemIcon>
                      <SchoolIcon />
                    </ListItemIcon>
                    <ListItemText primary="Course Management" />
                  </ListItem>
                </>
              )}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              System Announcements
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Welcome to our Learning Platform!" 
                  secondary="We're excited to have you join our community of learners and educators."
                />
              </ListItem>
              <Divider component="li" />
              <ListItem>
                <ListItemText 
                  primary="New Courses Available" 
                  secondary="Check out our newly added courses in Physics and Mathematics."
                />
              </ListItem>
              <Divider component="li" />
              <ListItem>
                <ListItemText 
                  primary="Upcoming Maintenance" 
                  secondary="The system will be undergoing maintenance this weekend. Please save your work."
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}