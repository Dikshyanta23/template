// client/src/pages/Home.jsx
import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchFeaturedCourses();
  }, []);
  
  const fetchFeaturedCourses = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/courses');
      // Get up to 3 courses to feature
      setFeaturedCourses(data.courses.slice(0, 3));
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText',
          py: 8,
          mb: 6
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom align="center">
            Expert Tutoring for Academic Success
          </Typography>
          <Typography variant="h5" paragraph align="center">
            Personalized learning experiences for A Levels, IB, and US college preparation
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 2 }}>
            <Button 
              component={Link} 
              to="/courses" 
              variant="contained" 
              color="secondary" 
              size="large"
            >
              Explore Courses
            </Button>
            {!user && (
              <Button 
                component={Link} 
                to="/register" 
                variant="outlined" 
                color="inherit" 
                size="large"
              >
                Register as Student
              </Button>
            )}
          </Box>
        </Container>
      </Box>
      
      {/* Featured Courses Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
          Featured Courses
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={4}>
            {featuredCourses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course._id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={course.image || 'https://via.placeholder.com/300x200?text=Course+Image'}
                    alt={course.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {course.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {course.collection}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {course.description.substring(0, 120)}...
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      component={Link} 
                      to={`/courses/${course._id}`}
                      size="small" 
                      color="primary"
                    >
                      Learn More
                    </Button>
                    <Button 
                      component={Link} 
                      to={`/courses/${course._id}/test`}
                      size="small" 
                      color="primary"
                    >
                      Take Mini Test
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button 
            component={Link} 
            to="/courses" 
            variant="contained" 
            color="primary"
          >
            View All Courses
          </Button>
        </Box>
      </Container>
      
      {/* Join as Tutor Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 6, mb: 8 }}>
        <Container maxWidth="md">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h2" gutterBottom>
                Join Our Team of Expert Tutors
              </Typography>
              <Typography variant="body1" paragraph>
                Are you passionate about teaching and helping students achieve their academic goals? 
                Join our team of expert tutors and make a difference in students' lives.
              </Typography>
              <Button 
                component={Link} 
                to="/tutor-application" 
                variant="contained" 
                color="primary" 
                size="large"
              >
                Apply as a Tutor
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Benefits of Being a Tutor:
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <Typography component="li" variant="body1" paragraph>
                    Flexible teaching schedule
                  </Typography>
                  <Typography component="li" variant="body1" paragraph>
                    Competitive compensation
                  </Typography>
                  <Typography component="li" variant="body1" paragraph>
                    Professional development opportunities
                  </Typography>
                  <Typography component="li" variant="body1" paragraph>
                    Make a positive impact on students' futures
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Why Choose Us Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
          Why Choose Our Tutoring Services
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Expert Tutors
              </Typography>
              <Typography variant="body2">
                Our tutors are subject matter experts with proven track records of student success.
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Personalized Learning
              </Typography>
              <Typography variant="body2">
                We tailor our teaching approach to match each student's learning style and needs.
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Comprehensive Resources
              </Typography>
              <Typography variant="body2">
                Access to practice tests, study materials, and additional resources to enhance learning.
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Proven Results
              </Typography>
              <Typography variant="body2">
                Our students consistently achieve top grades and gain admission to prestigious universities.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}